var fs = require('fs');
var log = require('fancy-log');
var path = require('path');
var glob = require('glob');
var csvParse = require('csv-parse/lib/sync');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var notify = require('gulp-notify');
var marked = require('marked');
var d3 = require('d3');


function printDataFilenameError(baseFilename, dataFilePath) {
  const dataError = new Error(`A data file named ${ baseFilename } already exists in another example. Please rename ${ dataFilePath } to avoid name collision with other graphics.`);
  throw dataError;
}


function getExternalData(options) {
  var fullData = {};
  var dataPaths = options && options.examples ?
                  glob.sync('./examples/*/template-files/*.@(json|csv)') :
                  glob.sync('./src/template-files/*.@(json|csv)');

  for (i in dataPaths) {
    var extName = path.extname(dataPaths[i]);
    var fileContents = fs.readFileSync(dataPaths[i]);
    var baseFilename = path.basename(dataPaths[i], extName);
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
        log.warn('WARNING Skipping file', dataPaths[i], 'because it is neither CSV or JSON.');
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
  let basicParse = csvParse(fileContents, { relax_column_count: true });
  let parsedFile = csvParse(fileContents, {
    columns: true,
    relax_column_count: true
  });

  if (basicParse[0][0] == 'key') {
    if (basicParse[0].length == 2) {
      // If there are only two columns, return an object of
      // key-value pairs
      for (var i=1; i<basicParse.length; i++) {
        formattedData[basicParse[i][0]] = basicParse[i][1];
      }
    } else {
      // If columns begin with 'key', return an object with each
      // data object accessible by key
      let keyedData = {};

      for (var i=0; i<parsedFile.length; i++) {
        keyedData[parsedFile[i]['key']] = parsedFile[i];
      }

      formattedData = keyedData;
    }
  } else {
    // If not keyed, then return an array of objects
    // representing each row with column names serving as keys
    formattedData = parsedFile;
  }

  return formattedData;
}

function renderGraphicHTML(options) {
  var path = options && options.examples ?
    glob.sync('./examples/!(lib)/') :
    'src/';

  return nunjucksRender({
    path: path,
    manageEnv: manageNunjucksEnvironment
  }).on('error', notify.onError("Nunjucks <%= error %>"));
}

function manageNunjucksEnvironment(environment) {
  environment.addFilter('md', function(text) {
    return marked(text);
  });

  environment.addFilter('format', function(text, formatString) {
    return d3.format(formatString)(text);
  });
}

function printParseError(error, dataFilePath) {
  var errorMessage = `ERROR: Couldn't parse file ${dataFilePath}.\n${error.name}: ${error.message}`;
  log.error(errorMessage);
}

module.exports = {
  getExternalData,
  renderGraphicHTML
}
