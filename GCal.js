import {OAuth2Client} from 'google-auth-library';
import http from 'http';
import {google} from 'googleapis';
import url from 'url';
import open from 'open';
import destroyer from 'server-destroy';
import fs from 'fs';

// Download your OAuth2 configuration from the Google
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const keys = require("./credentials.json");

const timeMin = new Date();
timeMin.setDate(timeMin.getDate()+1);
const timeMax = new Date(timeMin);
timeMin.setHours(6,30,0,0);
timeMax.setHours(23,0,0,0);
/**
* Start by acquiring a pre-authenticated oAuth2 client.
*/
export async function getEvents(tMin=timeMin,tMax=timeMax,calendarId='primary') { 
  const auth = await handleClient();
  const calendar = google.calendar({version: 'v3', auth});
  const result = await calendar.events.list({
    calendarId: calendarId,
    timeMin: tMin.toISOString(),
    timeMax: tMax.toISOString(),
    maxResults: 800,
    singleEvents: true,
    orderBy: 'startTime',
  })
  const events = result.data.items;
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
      prompt:'consent',
      scope: 'https://www.googleapis.com/auth/calendar'
    });

    // Open an http server to accept the oauth callback. In this simple example, the
    // only request to our webserver is to /oauth2callback?code=<code>
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, 'https://metoohairstylist.onrender.com:3000')
              .searchParams;
            const code = qs.get('code');
            console.log(`Code is ${code}`);
            res.end('Authentication successful! Please return to the console.');
            server.destroy();

            // Now that we have the code, use that to acquire tokens.
            const r = await oAuth2Client.getToken(code);
            // Make sure to set the credentials on the OAuth2 client.
            oAuth2Client.setCredentials(r.tokens);
            fs.writeFile('token.json',JSON.stringify(r.tokens),function(err){
              if(err) return console.log(err);
            });
            console.info('Tokens acquired.');
            resolve(oAuth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(3000, () => {
        // open the browser to the authorize url to start the workflow
        open(authorizeUrl, {wait: false}).then(cp => cp.unref());
      });
    destroyer(server);
  });
}
//regenerate the client using refresh token
function regenerateClient(token){
  const oAuth2Client = new OAuth2Client({
    clientId: keys.web.client_id,
    clientSecret: keys.web.client_secret,
    redirectUri: keys.web.redirect_uris[0]
  });
  oAuth2Client.setCredentials({
    refresh_token:token.refresh_token
  });
  return oAuth2Client;
}
//check if token exists, if it does regenerate the client if it doesnt ask user for a new one
async function handleClient(){
  var token = false
  try{
    token = JSON.parse(fs.readFileSync('./token.json'));
  }catch(err){
    console.log(err);
  }
  if(token){
    return regenerateClient(token);
  }else{
    return await getAuthenticatedClient();
  }
}