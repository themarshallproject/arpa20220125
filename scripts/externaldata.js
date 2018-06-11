var fs = require('fs');
var path = require('path');
var glob = require('glob');
var parse = require('csv-parse/lib/sync');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');

function getExternalData() {
  var fullData = {};
  var dataPaths = glob.sync('./src/template-files/*.@(json|csv)');

  for (i in dataPaths) {
    var extName = path.extname(dataPaths[i]);
    var dataFileRead = fs.readFileSync(dataPaths[i]);
    var baseFilename = path.basename(dataPaths[i], extName);
    var pathData;

    if (extName == '.csv') {
      pathData = convertCSVtoJSON(dataFileRead);
    } else {
      pathData = JSON.parse(dataFileRead);
    }

    fullData[baseFilename] = pathData;
  }

  return data({ data: fullData });
}

function convertCSVtoJSON(dataFile) {
  var parsedFile = parse(dataFile);
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
    formattedData = parse(dataFile, { columns: true });
  }

  return formattedData;
}

function renderGraphicHTML(data) {
  return nunjucksRender({
    path: 'src/graphic.html',
    data: data
  });
}

module.exports = {
  getExternalData,
  renderGraphicHTML
}
