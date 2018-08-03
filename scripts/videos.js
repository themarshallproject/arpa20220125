const credentials = require('./credentials.js');
const AWS = require('aws-sdk');
const fs = require('fs');
const urljoin = require('url-join');
const config = require('../config.json');


function configureAWSClient(done) {
  credentials.ensureCredentials(function(creds) {
    AWS.config.update({
      region: 'us-east-1',
      accessKeyId: creds['gfx-aws-access'],
      secretAccessKey: creds['gfx-aws-secret']
    });
    configureMediaConvertEndpoint(done);
  });
}


function configureMediaConvertEndpoint(done) {
  // Create empty request parameters
  const params = {
    MaxResults: 0,
  };

  new AWS.MediaConvert()
    .describeEndpoints(params).promise()
    .then((value) => {
      AWS.config.mediaconvert = { endpoint: value.Endpoints[0].Url };
      done();
    }, (error) => {
      throw new Error('Error Getting MediaConvert endpoint: ' + error);
    });
}


function getVideoUrls() {
  const results = [];
  fs.readdirSync('./dist/assets').forEach((file) => {
    if (!file.match(/.mp4$/)) {
      return;
    }
    results.push(getS3Url(file));
  });
  return results;
}


function getS3Url(filename) {
  return 's3://' + urljoin(config.bucket, config.slug, 'assets', filename);
}


function getS3OutputBucket() {
  return 's3://' + urljoin(config.bucket, config.slug, 'assets', 'converted');
}


function getJobConfig(url) {
  const jobConfig = JSON.parse(fs.readFileSync('./scripts/video-default.json'));
  jobConfig.Settings.Inputs[0].FileInput = url;
  jobConfig.Settings.OutputGroups = jobConfig.Settings.OutputGroups.map((group) => {
    group.OutputGroupSettings.HlsGroupSettings.Destination = getS3OutputBucket();
    return group;
  });
  return jobConfig;
}


function transcodeAll() {
  configureAWSClient(() => {
    getVideoUrls().forEach((url) => {
      new AWS.MediaConvert().createJob(getJobConfig(url)).promise()
        .then((data) => {
          console.log('Transcoding job successfully created', data);
        }, (err) => {
          console.log('Error creating transcoding job', err);
        });
    })
  });
}


function listRecentJobs() {
  configureAWSClient(() => {
    new AWS.MediaConvert().listJobs().promise()
      .then((data) => {
        console.log(data);
      }, (err) => {
        console.log(err);
      });
  });
}

// transcodeAll();
listRecentJobs();
