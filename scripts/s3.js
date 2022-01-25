// native
import { join, parse } from 'node:path';

// packages
import * as colors from 'colorette';
import log from 'fancy-log';
import prettyBytes from 'pretty-bytes';
import { totalist } from 'totalist';

// local
import * as credentials from './credentials.js';
import { getLocalConfig } from './config.js';
import { S3Deploy } from './s3/index.js';

const config = getLocalConfig();

async function getS3Credentials() {
  const accessKeyId = await credentials.ensureCredential(
    credentials.AWS_ACCESS
  );
  const secretAccessKey = await credentials.ensureCredential(
    credentials.AWS_SECRET
  );

  return { accessKeyId, secretAccessKey };
}

export async function deploy() {
  // get our S3 credentials
  const { accessKeyId, secretAccessKey } = await getS3Credentials();

  // create the S3 client
  const client = new S3Deploy({
    basePath: config.slug,
    bucket: config.bucket,
    region: 'us-east-1',
    accessKeyId,
    secretAccessKey,
  });

  // use the event listener to log out the progress of the upload
  client.on('upload', ({ isIdentical, isUpdated, Key, size }) => {
    let color, status;

    if (isUpdated) {
      if (isIdentical) {
        color = colors.gray;
        status = 'No change:';
      } else {
        color = colors.yellow;
        status = 'Updated:  ';
      }
    } else {
      color = colors.green;
      status = 'Uploaded: ';
    }

    log(color(`${status} ${Key} (${prettyBytes(size)})`));
  });

  /** @type {[key: string, path: string][]} */
  const files = [];

  // find our target files, filtering out anything within the "embed-loaders" directory
  await totalist('./dist', (name, abs) => {
    const { dir } = parse(name);

    if (!dir.startsWith('embed-loaders')) {
      files.push([abs, name]);
    }
  });

  log(
    colors.bold(
      `Uploading ${files.length} file${files.length === 1 ? '' : 's'}...`
    )
  );

  // upload the files
  return Promise.all(
    files.map(([file, key]) =>
      client.uploadFile(file, key, { isPublic: true, shouldCache: true })
    )
  );
}

export async function deployData(done) {
  // get our S3 credentials
  const { accessKeyId, secretAccessKey } = await getS3Credentials();

  // create the S3 client
  const client = new S3Deploy({
    basePath: config.slug,
    bucket: config.data_bucket,
    region: 'us-east-1',
    accessKeyId,
    secretAccessKey,
  });

  // use the event listener to log out the progress of the upload
  client.on('upload', ({ isIdentical, isUpdated, Key, size }) => {
    let color, status;

    if (isUpdated) {
      if (isIdentical) {
        color = colors.gray;
        status = 'No change:';
      } else {
        color = colors.yellow;
        status = 'Updated:  ';
      }
    } else {
      color = colors.green;
      status = 'Uploaded: ';
    }

    const url = new URL(
      join(config.data_bucket, Key),
      'https://s3.amazonaws.com'
    );

    log(color(`${status} ${url.toString()} (${prettyBytes(size)})`));
  });

  /** @type {[key: string, path: string][]} */
  const files = [];

  // find our target files
  await totalist('./analysis/output_data', (name, abs) => {
    // don't let .keep + other dot files in
    if (name.startsWith('.')) return;
    files.push([abs, name]);
  });

  log(
    colors.bold(
      `Uploading ${files.length} file${files.length === 1 ? '' : 's'}...`
    )
  );

  // upload the files
  return Promise.all(
    files.map(([file, key]) => client.uploadFile(file, key, { isPublic: true }))
  );
}
