const {OAuth2Client} = require('google-auth-library');
import {google} from 'googleapis';
const http = require('http');
const url = require('url');
const open = require('open');
const destroyer = require('server-destroy');
const today = new Date();
today.setHours(0,0,0,0);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate()+7);
// Download your OAuth2 configuration from the Google
const keys = require('./credentials.json');

/**
* Start by acquiring a pre-authenticated oAuth2 client.
*/
async function getEvents() {
  const  auth = await getAuthenticatedClient();
  // Make a simple request to the People API using our pre-authenticated client. The `fetch` and
  // `request` methods accept a [`GaxiosOptions`](https://github.com/googleapis/gaxios)
  // object.
    // Create a new Calendar API client.
  const calendar = google.calendar({version: 'v3', auth});
  // Get the list of events.
  const result = await calendar.events.list({
    calendarId: 'primary',
    timeMin: today.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = result.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
  }

  // Print the start time and summary of each event.
  for (const event of events) {
    const start = event.start?.dateTime ?? event.start?.date;
    console.log(`${start} - ${event.summary}`);
  }
  const url = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';


  // After acquiring an access_token, you may want to check on the audience, expiration,
  // or original scopes requested.  You can do that with the `getTokenInfo` method.
  const tokenInfo = await auth.getTokenInfo(
    auth.credentials.access_token
  );
  console.log(tokenInfo);
  return events;
}

/**
* Create a new OAuth2Client, and go through the OAuth2 content
* workflow.  Return the full client to the callback.
*/
function getAuthenticatedClient() {
  return new Promise((resolve, reject) => {
    // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
    // which should be downloaded from the Google Developers Console.
    const oAuth2Client = new OAuth2Client({
      clientId: keys.web.client_id,
      clientSecret: keys.web.client_secret,
      redirectUri: keys.web.redirect_uris[0]
    });

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
    });

    // Open an http server to accept the oauth callback. In this simple example, the
    // only request to our webserver is to /oauth2callback?code=<code>
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.includes('/?code')) {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, 'http://localhost:3500')
              .searchParams;
            const code = qs.get('code');
            console.log(`Code is ${code}`);
            res.end('Authentication successful! Please return to the console.');
            server.destroy();

            // Now that we have the code, use that to acquire tokens.
            const r = await oAuth2Client.getToken(code);
            // Make sure to set the credentials on the OAuth2 client.
            oAuth2Client.setCredentials(r.tokens);
            console.info('Tokens acquired.');
            resolve(oAuth2Client);
          }else{
            console.log(req.url);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(3500, () => {
        // open the browser to the authorize url to start the workflow
        open(authorizeUrl, {wait: false}).then(cp => cp.unref());
      });
    destroyer(server);
  });
}

export default getEvents;