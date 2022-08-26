// native
import { createServer } from 'node:http';

// packages
import getPort from 'get-port';
import { OAuth2Client } from 'google-auth-library';
import destroy from 'server-destroy';

// local
import {
  ACCOUNT,
  ensureCredential,
  deletePassword,
  getPassword,
  GOOGLE_CLIENT,
  GOOGLE_TOKEN,
  resetServicePassword,
  setPassword,
} from './credentials.js';

export function resetGoogleClient() {
  return resetServicePassword(GOOGLE_CLIENT);
}

export async function resetGoogleToken() {
  await deletePassword(GOOGLE_TOKEN.key, ACCOUNT);
  await getGoogleClient();
}

/**
 * Ensure that client credentials, and bearer token are present and stored.
 * Calls back with an authenticated client.
 */
export async function getGoogleClient() {
  // Ensure credentials are present.
  await ensureCredential(GOOGLE_CLIENT);
  // Get the stored credentials.
  const secret = await getPassword(GOOGLE_CLIENT.key, ACCOUNT);
  // Return an authorized Google client.
  return authorize(JSON.parse(secret));
}

/**
 * Create an OAuth2 client with stored credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @returns {Promise<OAuth2Client>}
 */
async function authorize(credentials) {
  // Check if we have previously stored a token.
  let secret;
  try {
    secret = await getPassword(GOOGLE_TOKEN.key, ACCOUNT);
  } catch (err) {
    if (err.code !== 'PasswordNotFound') {
      throw err;
    }
  }

  const { client_secret, client_id } = credentials.installed;

  const port = await getPort();

  const oAuth2Client = new OAuth2Client(
    client_id,
    client_secret,
    `http://localhost:${port}/oauth2callback`
  );

  if (secret == null) {
    return getNewToken(oAuth2Client, port);
  }

  oAuth2Client.setCredentials(JSON.parse(secret));

  return oAuth2Client;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {OAuth2Client} oAuth2Client The OAuth2 client to get token for.
 * @param {number} port The port to listen on.
 * @returns {Promise<OAuth2Client>}
 */
function getNewToken(oAuth2Client, port) {
  return new Promise((resolve) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_TOKEN.scopes,
    });

    const server = createServer(async (req, res) => {
      try {
        if (req.url.includes('/oauth2callback')) {
          const params = new URL(req.url, `http://localhost:${port}`)
            .searchParams;

          res.end('Authentication successful! Please return to the console.');
          server.destroy();

          const { tokens } = await oAuth2Client.getToken(params.get('code'));
          oAuth2Client.setCredentials(tokens);
          await setPassword(GOOGLE_TOKEN.key, ACCOUNT, JSON.stringify(tokens));
          resolve(oAuth2Client);
        }
      } catch (e) {
        reject(e);
      }
    }).listen(port, () => {
      // vist the authorize url to start the workflow
      console.log('Authorize this app by visiting this url:', authUrl);
    });

    destroy(server);
  });
}
