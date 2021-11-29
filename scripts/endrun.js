import fs from 'fs';
import log from 'fancy-log';
import request from 'request';

import * as credentials from './credentials.js';
import { getGraphics } from './localrenderer.js';
import { getEmbedLoaders } from './external-embeds.js';
import * as github from './github.js';
import { readJsonSync } from './utils.js';

const config = readJsonSync('./config.json');

function routeEndrunRequest(done, host, callback) {
  host = host || config.endrun_host;
  if (host == 'https://www.themarshallproject.org') {
    credentials.ensureCredentials(function (creds) {
      var endrunCredsKey = 'gfx-endrun';
      var endrunTask = 'endrun';
      callback(host, creds[endrunCredsKey], endrunTask);
    });
  } else {
    credentials.getEndrunLocalCredentials(function (creds) {
      log(
        `Reminder: You are using an Endrun install hosted at ${host}. To deploy to https://www.themarshallproject.org, update the endrun_host in config.json.`
      );

      var endrunCredsKey = 'gfx-endrun-local';
      var endrunTask = 'endrun_local';
      callback(host, creds[endrunCredsKey], endrunTask);
    });
  }
}

function defaultEndrunResponseHandler(error, response, endrunTask) {
  if (error) {
    log.error(error);
  }

  if (response.statusCode === 403) {
    log(
      `Your API key is invalid! You can get a new one at ${config.endrun_host}/admin/api_keys\n which you can update here by running:\n\n\tgulp credentials:${endrunTask}\n\n`
    );
  }
}

export function endrunDeploy(done, host) {
  routeEndrunRequest(done, host, function (host, endrunToken, endrunTask) {
    var endpoint = '/admin/api/v2/deploy-gfx';
    var body = {
      token: endrunToken,
      type: config.type,
      slug: config.slug,
      repo: github.getRemoteUrl(),
    };

    body['contents'] = getGraphics({ isProduction: true });

    if (config.generate_external_embeds) {
      body['embeds'] = getEmbedLoaders();
    }

    request.post(
      {
        url: host + endpoint,
        json: true,
        body: body,
      },
      function (error, response, body) {
        defaultEndrunResponseHandler(error, response, endrunTask);

        if (response && response.statusCode !== 200) {
          log.error(response.statusCode + ': ' + body.error);
          done(body.error);
        }

        log(body);

        done();
      }
    );
  });
}

export function getPostData(done, host) {
  routeEndrunRequest(done, host, function (host, endrunToken, endrunTask) {
    if (config.slug) {
      host = host || config.endrun_host;
      var endpoint = `/admin/api/v2/post-data/${config.slug}?token=${endrunToken}`;

      request.get(
        {
          url: host + endpoint,
          json: true,
        },
        function (error, response, body) {
          defaultEndrunResponseHandler(error, response, endrunTask);

          if (response && response.statusCode == 404) {
            // This is not necessarily an error -- `getPostData` will run by
            // default regardless of whether there's an associated post. We do
            // not want to force the gulp series to break because that is normal
            // behavior. Most graphics will not be using post data.
            log.error(
              response.statusCode +
                ': ' +
                JSON.stringify(body) +
                '\nNo post associated with this graphic slug. To create a new post linked to this slug, run `gulp deploy`. To link this slug to an existing post, add the slug to the "Internal Slug" field on the Endrun post, found in the Advanced post editor.'
            );
            done();
          } else if (response && response.statusCode !== 200) {
            log.error(
              response.statusCode + ': ' + body.error + '\nNo post data saved.'
            );
            done(body.error);
          } else if (response && response.statusCode == 200) {
            log('Writing post data to post-templates/custom-header-data.json.');
            const content = JSON.stringify(response.body, null, 2);
            fs.writeFileSync(
              `./post-templates/custom-header-data.json`,
              content
            );
          }

          done();
        }
      );
    } else {
      log.error(
        'You must specify a slug in config.json to download custom header data.'
      );
      done();
    }
  });
}
