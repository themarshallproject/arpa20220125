const credentials = require('./credentials.js');
const fs = require('fs');
const urljoin = require('url-join');
const config = require('../config.json');
const axios = require('axios');


const MANIFEST_LOCATION = './video-manifest.json';

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


function getManifest() {
  let manifestText;
  let manifest = {};
  try {
    manifestText = fs.readFileSync(MANIFEST_LOCATION);
  } catch (e) {
    console.log("Couldn't find video-manifest.json, assuming none exists.");
  }

  if (manifestText) {
    try {
      manifest = JSON.parse(manifestText);
    } catch (e) {
      console.log("Error parsing video-manifest.json.");
    }
  }

  return manifest;
}


function writeManifest(data) {
  fs.writeFileSync(MANIFEST_LOCATION, JSON.stringify(data, null, 2));
}


function transcodeAll(creds) {
  const existingTranscodings = getManifest();
  const videoUrls = getVideoUrls();
  let alreadyExistingCount = 0;

  if (videoUrls.length == 0) {
    console.log("No uploaded videos found.");
    return;
  }

  const promises = videoUrls.map((url) => {
    if (existingTranscodings[url]) {
      console.log(`Found existing transcoding for ${url}, at ${existingTranscodings[url]}`);
      alreadyExistingCount += 1;
      return Promise.resolve({ [url]: existingTranscodings[url] });
    } else {
      return axios.post('https://api.mux.com/video/v1/assets',
        getTranscodingParams(url),
        {
          auth: {
            username: creds['gfx-mux-access'],
            password: creds['gfx-mux-secret'],
          }
        })
        .then((res) => {
          return formatOutput(url, res.data);
        })
        .catch((error) => {
          return error.message;
        });
    }
  });

  if (alreadyExistingCount === videoUrls.length) {
    console.log(`All videos already transcoded. You can check ${MANIFEST_LOCATION} for the urls.`)
  } else {
    console.log("Successfully uploaded videos to Mux, they are now transcoding. This shouldn't take too long. If it fails, the video won't work. You can check for errors here:");
    console.log("\nhttps://dashboard.mux.com/activity/events");
  }

  return Promise.all(promises).then((outputs) => {
    const manifest = outputs.reduce((accumulator, value) => {
      return Object.assign(accumulator, value);
    }, {});
    writeManifest(manifest);
    return manifest;
  });
}


function getCredentials() {
  return new Promise((resolve, reject) => {
    credentials.getMuxCredentials((creds) => {
      resolve(creds);
    });
  });
}


function formatOutput(url, responseData) {
  return {
    [url]: `https://stream.mux.com/${responseData.data.playback_ids[0].id}.m3u8`,
  };
}


function transcodeUploadedVideos() {
  return getCredentials()
    .then(transcodeAll)
    .then((output) => {
      console.log("\n\n", JSON.stringify(output, null, 2), "\n\n");
    });
}


module.exports = {
  transcodeUploadedVideos
}
