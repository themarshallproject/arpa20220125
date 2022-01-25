// native
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { extname, basename } from 'path';

// packages
import { csvParse } from 'd3-dsv';
import { format } from 'd3-format';
import { warn, error as _error } from 'fancy-log';
import glob from 'glob';
import data from 'gulp-data';
import { onError } from 'gulp-notify';
import nunjucksRender from 'gulp-nunjucks-render';
import { marked } from 'marked';

function printDataFilenameError(baseFilename, dataFilePath) {
  const dataError = new Error(
    `A data file named ${baseFilename} already exists in another example. Please rename ${dataFilePath} to avoid name collision with other graphics.`
  );
  throw dataError;
}

export function getExternalData(options) {
  var fullData = {};
  var srcBasePath = options && options.examples ? './examples/*' : './src';
  var dataPaths = glob.sync(`${srcBasePath}/template-files/*.@(json|csv)`);

  var assetDataPath = './src/assets/import-data';
  initializeDirectory(assetDataPath);

  for (let i in dataPaths) {
    var extName = extname(dataPaths[i]);
    var fileContents = readFileSync(dataPaths[i]);
    var baseFilename = basename(dataPaths[i], extName);
    var pathData;

    // Prevent data files with the same file name from overwriting each other
    if (fullData.hasOwnProperty(baseFilename)) {
      printDataFilenameError(baseFilename, dataPaths[i]);
    }

    try {
      if (extName == '.csv') {
        pathData = convertCSVtoJSON(fileContents);
      } else if (extName == '.json') {
        pathData = JSON.parse(fileContents);
      } else {
        warn(
          'WARNING Skipping file',
          dataPaths[i],
          'because it is neither CSV or JSON.'
        );
      }
    } catch (e) {
      printParseError(e, dataPaths[i]);
    }

    // Write to assets for use in js
    writeFileSync(
      `${assetDataPath}/${baseFilename}.json`,
      JSON.stringify(pathData)
    );

    fullData[baseFilename] = pathData;
  }

  return data({ data: fullData });
}

function initializeDirectory(dirPath) {
  if (existsSync(dirPath)) {
    return;
  }
  mkdirSync(dirPath);
}

function convertCSVtoJSON(fileContents) {
  // Convert CSV file contents to JSON, with two output options
  let formattedData = {};
  const parsedFile = csvParse(fileContents.toString().trim());
  const columns = parsedFile.columns;

  if (columns[0] === 'key') {
    if (columns.length === 2) {
      // If there are only two columns, return an object of
      // key-value pairs
      for (const row of parsedFile) {
        formattedData[row[columns[0]]] = row[columns[1]];
      }
    } else {
      // If columns begin with 'key', return an object with each
      // data object accessible by key
      for (const row of parsedFile) {
        formattedData[row['key']] = row;
      }
    }
  } else {
    // If not keyed, then return an array of objects
    // representing each row with column names serving as keys
    formattedData = parsedFile;
  }

  return formattedData;
}

export function renderGraphicHTML(options) {
  var path =
    options && options.examples ? glob.sync('./examples/!(lib)/') : 'src/';

  return nunjucksRender({
    path: path,
    manageEnv: manageNunjucksEnvironment,
  }).on('error', onError('Nunjucks <%= error %>'));
}

function manageNunjucksEnvironment(environment) {
  environment.addFilter('md', function (text) {
    return marked(text);
  });

  environment.addFilter('format', function (text, formatString) {
    return format(formatString)(text);
  });
}

function printParseError(error, dataFilePath) {
  var errorMessage = `ERROR: Couldn't parse file ${dataFilePath}.\n${error.name}: ${error.message}`;
  _error(errorMessage);
}
