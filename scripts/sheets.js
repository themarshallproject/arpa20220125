// native
import fs from 'fs';

// packages
import { csvFormatRows } from 'd3-dsv';
import google from '@googleapis/sheets';

// local
import * as googleClient from './google.js';
import { getLocalConfig } from './config.js';

const config = getLocalConfig();

export async function downloadData() {
  const auth = await googleClient.getGoogleClient();

  return downloadSheet(auth);
}

async function downloadSheet(auth) {
  if (!config.spreadsheet_id) {
    console.log('\n\nYou must specify a spreadsheet ID in config.json\n\n');
    return;
  }

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: config.spreadsheet_id,
    });

    for (const sheet of res.data.sheets) {
      const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheet_id,
        range: sheet.properties.title,
      });

      saveDownloadedSheet(sheet.properties.title, data.values);
    }
  } catch (err) {
    throw new Error('The API returned an error: ' + err);
  }
}

function saveDownloadedSheet(title, values) {
  console.log('Saving ' + title);
  const content = csvFormatRows(values);

  fs.writeFileSync(`./src/template-files/${title}.csv`, content);
}
