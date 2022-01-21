// packages
import axios from 'axios';
import log from 'fancy-log';

// local
import { getLocalConfig } from './config.js';
import * as credentials from './credentials.js';
import { getEmbedLoaders } from './external-embeds.js';
import * as github from './github.js';
import { getGraphics } from './localrenderer.js';
import { writeJsonSync } from './utils.js';

const config = getLocalConfig();

async function routeEndrunRequest(host = config.endrun_host) {
  let secret;
  let task;

  if (host === 'https://www.themarshallproject.org') {
    secret = await credentials.ensureCredential(credentials.ENDRUN);
    task = 'endrun';
  } else {
    secret = await credentials.ensureCredential(credentials.ENDRUN_LOCAL);
    task = 'endrun_local';
    log(
      `Reminder: You are using an Endrun install hosted at ${host}. To deploy to https://www.themarshallproject.org, update the endrun_host in config.json.`
    );
  }

  return { host, secret, task };
}

function defaultEndrunResponseHandler(error, response, endrunTask) {
  if (error) {
    log.error(error.message);
  }

  if (response.status === 403) {
    log(
      `Your API key is invalid! You can get a new one at ${config.endrun_host}/admin/api_keys\n which you can update here by running:\n\n\tgulp credentials:${endrunTask}\n\n`
    );
  }
}

export async function endrunDeploy() {
  const params = await routeEndrunRequest();

  const endpoint = '/admin/api/v2/deploy-gfx';

  const body = {
    token: params.secret,
    type: config.type,
    slug: config.slug,
    repo: github.getRemoteUrl(),
  };

  body.contents = getGraphics({ isProduction: true });

  if (config.generate_external_embeds) {
    body.embeds = getEmbedLoaders();
  }

  try {
    const res = await axios.post(`${params.host}${endpoint}`, body);
    log(res.data);
  } catch (err) {
    defaultEndrunResponseHandler(err, err.response, params.task);
  }
}

export async function getPostData() {
  const params = await routeEndrunRequest();

  if (!config.slug) {
    throw new Error(
      'You must specify a slug in config.json to download custom header data.'
    );
  }

  const endpoint = `/admin/api/v2/post-data/${config.slug}?token=${params.secret}`;

  try {
    const res = await axios.get(`${params.host}${endpoint}`);

    log('Writing post data to post-templates/custom-header-data.json.');
    writeJsonSync(`./post-templates/custom-header-data.json`, res.data, 2);
  } catch (err) {
    defaultEndrunResponseHandler(err, err.response, params.task);

    if (err.response) {
      if (err.response.status === 404) {
        // This is not necessarily an error -- `getPostData` will run by
        // default regardless of whether there's an associated post. We do
        // not want to force the gulp series to break because that is normal
        // behavior. Most graphics will not be using post data.
        log.error(
          JSON.stringify(err.response.data) +
            '\nNo post associated with this graphic slug. To create a new post linked to this slug, run `gulp deploy`. To link this slug to an existing post, add the slug to the "Internal Slug" field on the Endrun post, found in the Advanced post editor.'
        );
      }

      log.warn('No post data saved.');
    }
  }
}
