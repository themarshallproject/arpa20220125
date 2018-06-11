var fs = require('fs');
var path = require('path');
var glob = require('glob');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');

function getExternalData() {
  var fullData = {};
  var dataPaths = glob.sync('./src/template-files/*.json');

  for (i in dataPaths) {
    var baseFilename = path.basename(dataPaths[i], path.extname(dataPaths[i]));
    var pathData = JSON.parse(fs.readFileSync(dataPaths[i]));
    fullData[baseFilename] = pathData;
  }

  return data({ data: fullData });
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
