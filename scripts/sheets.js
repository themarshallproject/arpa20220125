const credentials = require('./credentials.js');
const config = require('../config.json');

const fs = require('fs');
const readline = require('readline');
const stringify = require('csv-stringify/lib/sync')
const {google} = require('googleapis');


function downloadData(done) {
  credentials.getGoogleClient(downloadSheet.bind(null, done))
}


function downloadSheet(cb, auth) {
  if (!config.spreadsheet_id) {
    console.log("\n\nYou must specify a spreadsheet ID in config.json\n\n");
    return cb();
  }
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.get({
    spreadsheetId: config.spreadsheet_id,
  }, (err, res) => {
    if (err) {
      return console.log('The API returned an error: ' + err);
    }

    let completed = 0;
    let success = true;
    let errorMessage = null;
    const markComplete = function(err) {
      if (err) {
        errorMessage = err;
        success = false;
      }
      completed += 1;
      if (completed === res.data.sheets.length) {
        cb(errorMessage);
      }
    }

    res.data.sheets.forEach((sheet) => {
      sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheet_id,
        range: sheet.properties.title
      }, saveDownloadedSheet.bind(null, markComplete, sheet.properties.title));
    });
  });
}


function saveDownloadedSheet(cb, title, err, response) {
  if (err) {
    console.log('Error downloading sheet: ' + err);
    return cb(err);
  }
  console.log('Saving ' + title);
  const content = stringify(response.data.values);
  fs.writeFileSync(`./src/template-files/${title}.csv`, content);
  cb();
}


module.exports = {
  downloadData: downloadData
}