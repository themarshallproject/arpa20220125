import { readFileSync } from 'fs';
import { warn, error as _error } from 'fancy-log';
import { extname, basename } from 'path';
import glob from 'glob';
import { csvParse } from 'd3-dsv';
import nunjucksRender from 'gulp-nunjucks-render';
import data from 'gulp-data';
import { onError } from 'gulp-notify';
import marked from 'marked';
import d3 from 'd3';

const { format } = d3;

function printDataFilenameError(baseFilename, dataFilePath) {
  const dataError = new Error(
    `A data file named ${baseFilename} already exists in another example. Please rename ${dataFilePath} to avoid name collision with other graphics.`
  );
  throw dataError;
}

export function getExternalData(options) {
  var fullData = {};
  var dataPaths =
    options && options.examples
      ? glob.sync('./examples/*/template-files/*.@(json|csv)')
      : glob.sync('./src/template-files/*.@(json|csv)');

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

    fullData[baseFilename] = pathData;
  }

  return data({ data: fullData });
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
      let keyedData = {};

      for (const row of parsedFile) {
        keyedData[row['key']] = row;
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
