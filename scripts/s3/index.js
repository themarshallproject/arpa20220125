// native
import { EventEmitter } from 'node:events';
import { createReadStream, promises as fs } from 'node:fs';
import { Agent } from 'node:https';
import { join } from 'node:path';

// packages
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { lookup, mimes } from 'mrmime';

// local
import { longLiveCache, requireRevalidation } from './cache-headers.js';
import { defaultShouldBeCached, findFiles, md5FromFile } from './utils.js';

/**
 * A helper type to cover cases where either nullable is valid.
 *
 * @private
 * @typedef {null | undefined} Optional
 */

/**
 * @typedef {Object} UploadOutput
 * @property {string} ETag - The file's ETag.
 * @property {string} Key - The file's path on S3.
 * @property {boolean} isIdentical - Whether the file was identical on S3 or locally and was skipped.
 * @property {boolean} isPublic - This file was made public on upload.
 * @property {number} size - The size of the uploaded file in bytes.
 */

// add some custom extensions to mime library
mimes['topojson'] = 'application/json';

/**
 * Create an instance of S3Deploy to prepare an interface with S3.
 *
 * @example
 * const client = new S3Deploy({
 *  bucket: 'apps.thebignews.com',
 *  basePath: 'our-great-project',
 * });
 */
export class S3Deploy extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} options.bucket - The bucket on S3 to interact with.
   * @param {string} options.region - The region to use for S3.
   * @param {string} [options.basePath] - A pre-defined base path for all interactions with S3.
   *                                      Useful for establishing the slug or prefix of an upload.
   * @param {boolean} [options.useAccelerateEndpoint] - If true, use the Accelerate endpoint.
   * @param {(path: string) => boolean} [options.shouldBeCached] - A function used to determine whether a file
   *                                                               should receive long-lived cache headers.
   * @param {string} [options.accessKeyId] - The AWS access key ID.
   * @param {string} [options.secretAccessKey] - The AWS secret access key.
   */
  constructor(options) {
    super();

    // instantiate the s3 instance
    this.client = new S3Client({
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
      region: options.region,
      requestHandler: new NodeHttpHandler({
        httpsAgent: new Agent({ keepAlive: true, maxSockets: 50 }),
      }),
      useAccelerateEndpoint: options.useAccelerateEndpoint || false,
    });

    this.bucket = options.bucket;
    this.basePath = options.basePath || '';
    this.shouldBeCached = options.shouldBeCached || defaultShouldBeCached;
  }

  /**
   * Uploads a single file to S3.
   *
   * @param {string} file - The path to the file to upload.
   * @param {string} path - Where to upload the file relative to the base path
   * @param {Object} options
   * @param {boolean} [options.isPublic] - Whether a file should be made public or not on upload
   * @param {boolean} [options.shouldCache] - Whether a file should have cache headers applied
   * @param {string} [options.cacheControlOverride] - A custom Cache-Control value that will
   *                                                  override the built-in lookup if
   *                                                  shouldCache is true
   * @returns {Promise<UploadOutput>}
   * @example
   * const result = await client.uploadFile(
   *   './data/counties.json', // path to the file on local drive
   *   'counties.json', // the key to give the file in S3, combined with `basePath`
   *   {
   *     isPublic: true,
   *   }
   * );
   */
  async uploadFile(file, path, options) {
    // prepare the Key to the file on S3
    const Key = join(this.basePath, path);

    // get ready to read the file as a stream
    const Body = createReadStream(file);

    // grab the size of the file
    const { size } = await fs.stat(file);

    // determine the content type of the file
    const ContentType = lookup(file) || 'application/octet-stream';

    // decide whether it should be a public file or not
    const ACL = options.isPublic ? 'public-read' : 'private';

    // determine the content hash for the file
    const ETag = await md5FromFile(file);

    // we check to see if the file already exists on S3 and if it is identical
    const s3ETag = await this.getS3ObjectETag(Key);
    const isIdentical = this.isFileIdenticaltoS3File(ETag, s3ETag);

    // if they were the same, no need to upload
    if (!isIdentical) {
      /** @type {import('@aws-sdk/client-s3').PutObjectCommandInput} */
      const params = {
        Bucket: this.bucket,
        ACL,
        Body,
        ContentType,
        Key,
      };

      if (options.shouldCache) {
        // we received a custom override
        if (options.cacheControlOverride) {
          params.CacheControl = options.cacheControlOverride;
        } else {
          // otherwise figure it out
          if (this.shouldBeCached(path)) {
            params.CacheControl = longLiveCache;
          } else {
            params.CacheControl = requireRevalidation;
          }
        }
      }

      const command = new PutObjectCommand(params);

      try {
        const res = await this.client.send(command);
      } catch (err) {
        throw err;
      }
    }

    /** @type {UploadOutput} */
    const output = {
      ETag,
      Key,
      isIdentical,
      isPublic: options.isPublic,
      isUpdated: !!s3ETag,
      size,
    };

    /**
     * @event S3Deploy#upload
     * @type {UploadOutput}
     */
    this.emit('upload', output);

    return output;
  }

  /**
   * Upload a directory of files to S3.
   *
   * @param {string} dir - The directory to upload to S3
   * @param {Object} options
   * @param {string} [options.prefix] - The prefix to add to the uploaded file's path
   * @param {boolean} [options.isPublic] - Whether all files uploaded should be made public
   * @param {boolean} [options.shouldCache] - Whether all files uploaded should get cache headers
   * @param {string} [options.cacheControlOverride] - A custom Cache-Control value that will
   *                                                  override the built-in lookup if
   *                                                  shouldCache is true
   * @returns {Promise<UploadOutput[]>}
   * @example
   * const result = await client.uploadFiles(
   *   './dist/', // path to the directory on local drive to upload
   *   {
   *     isPublic: true,
   *     prefix: 'output', // the key prefix to combine with `basePath`
   *   }
   * );
   */
  async uploadFiles(dir, options) {
    const files = await findFiles(dir);

    const uploadedFiles = await Promise.all(
      files.map(({ file, dest }) =>
        this.uploadFile(file, join(options.prefix, dest), {
          isPublic: options.isPublic,
          shouldCache: options.shouldCache,
          cacheControlOverride: options.cacheControlOverride,
        })
      )
    );

    this.emit('upload:all', uploadedFiles);
    return uploadedFiles;
  }

  /**
   * Retrieves the ETag of a file on S3.
   *
   * @private
   * @param {string} Key The key of the file on S3 to get the Etag for
   */
  async getS3ObjectETag(Key) {
    /** @type {import('@aws-sdk/client-s3').HeadBucketCommandInput} */
    const params = {
      Bucket: this.bucket,
      Key,
    };

    const command = new HeadObjectCommand(params);

    try {
      const { ETag } = await this.client.send(command);

      return ETag;
    } catch (err) {
      // the file didn't exist and that's fine
      if (err.name === 'NotFound') {
        return undefined;
      }

      // other wise throw the error, it was something else
      throw err;
    }
  }

  /**
   * Compares the ETag of a local file with an ETag of a file on S3. Tweaks
   * the value of the local ETag to match the format of the S3 ETag.
   *
   * @private
   * @param {string | Optional} localETag The ETag of the local file being compared.
   * @param { string | Optional} s3ETag The Etag of the file on S3 being compared.
   */
  isFileIdenticaltoS3File(localETag, s3ETag) {
    // the AWS API returns this with a extra quotes for some reason, so make
    // sure this follows suit
    localETag = `"${localETag}"`;

    // if either file didn't exist, don't bother
    if (localETag == null || s3ETag == null) return false;

    // determine whether they are the same or not
    return localETag === s3ETag;
  }
}
