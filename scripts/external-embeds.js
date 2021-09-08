const fs = require('fs');
const config = require('../config.json');

function renderEmbed(options) {
  var content = fs.readFileSync('./build/graphic.html', 'utf-8');
  return content;
}
