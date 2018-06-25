var fs = require('fs');
var log = require('fancy-log');
var path = require('path');
var glob = require('glob');
var csvParse = require('csv-parse/lib/sync');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');

function getExternalData() {
  var fullData = {};
  var dataPaths = glob.sync('./src/template-files/*.@(json|csv)');

  for (i in dataPaths) {
    var extName = path.extname(dataPaths[i]);
    var fileContents = fs.readFileSync(dataPaths[i]);
    var baseFilename = path.basename(dataPaths[i], extName);
    var pathData;

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
  var parsedFile = csvParse(fileContents);
  var formattedData;

  // If columns are ['key', 'value'] then parse as an associative array
  // of key value pairs
  if (parsedFile[0][0] == 'key' && parsedFile[0][1] == 'value') {
    formattedData = {};
    for (var i=1; i<parsedFile.length; i++) {
      formattedData[parsedFile[i][0]] = parsedFile[i][1];
    }
  } else {
    // If not key/value pairs, then return an array of objects
    // representing each row with column names serving as keys
    formattedData = csvParse(fileContents, { columns: true });
  }

  return formattedData;
}

function renderGraphicHTML(data) {
  return nunjucksRender({
    path: 'src/',
    data: data
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
