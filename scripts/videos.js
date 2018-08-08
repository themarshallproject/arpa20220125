const credentials = require('./credentials.js');
const fs = require('fs');
const urljoin = require('url-join');
const config = require('../config.json');
const axios = require('axios');


function getVideoUrls() {
  const results = [];
  fs.readdirSync('./dist/assets').forEach((file) => {
    if (!file.match(/.mp4$/)) {
      return;
    }
    results.push(getCDNUrl(file));
  });
  return results;
}


function getCDNUrl(filename) {
  return urljoin(config.cdn, config.slug, 'assets', filename);
}


function getTranscodingParams(url) {
  return {
    playback_policy: 'public',
    per_title_encode: true, // https://docs.mux.com/docs/per-title-encoding
    input: url
  };
}


function transcodeAll() {
  const promises = getVideoUrls().map((url) => {
    return axios.post('https://api.mux.com/video/v1/assets',
      getTranscodingParams(url),
      {
        auth: {
          // TODO implement credentials
          username: '',
          password: '',
        }
      })
      .then((res) => {
        return formatOutput(url, res.data);
      })
      .catch((error) => {
        return error.message;
      });
  });
  return Promise.all(promises).then((outputs) => {
    return outputs.reduce((accumulator, value) => {
      return Object.assign(accumulator, value);
    }, {});
  });
}


function formatOutput(url, responseData) {
  return {
    [url]: `https://stream.mux.com/${responseData.data.playback_ids[0].id}.m3u8`,
  };
}


transcodeAll().then(console.log);
