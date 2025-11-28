const {OAuth2Client} = require('google-auth-library');
import {google} from 'googleapis';
const http = require('http');
const url = require('url');
const fs = require('node:fs');
const open = require('open');
const { BrowserWindow } = require('electron');
const destroyer = require('server-destroy');
const keys = require('./credentials.json');
const token = require('./token.json');
const today = new Date();
today.setHours(0,0,0,0);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate()+7);

async function clientManager(){
    if(typeof token.expiry_date == 'undefined' || new Date(token.expiry_date-20) < new Date()){
      return await getAuthenticatedClient();
    }else{
      const oAuth2Client = new OAuth2Client({
        clientId: keys.web.client_id,
        clientSecret: keys.web.client_secret,
        redirectUri: keys.web.redirect_uris[0]
      });
      const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'online',
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
      });
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
  }
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
            res.end("<!DOCTYPE html><html><head><title>Google Auth Login</title><script>window.setTimeout(function(){window.close()},3000);</script></head><body><div id='container'><h1>Authorization successful you can now close this window</h1></div></body><style>@import url('https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');html,body{height:100%;width:100%;margin:0;}#container{font-family:Roboto;color:#333;text-align:center;display:flex;align-items:center;padding:40px;margin:auto;height:500px;width:500px;border-radius:50px;box-shadow:5px 5px 5px #aaaaaa;background-color:#f0f0f0}body{display:flex;align-content:center;}</style></html>");
            server.destroy();

            // Now that we have the code, use that to acquire tokens.
            const r = await oAuth2Client.getToken(code);
            // Make sure to set the credentials on the OAuth2 client.
            oAuth2Client.setCredentials(r.tokens);
            fs.writeFile('./token.json', JSON.stringify(r.tokens) , err => {
              if (err) {
                console.error(err);
              }
            });   
            resolve(oAuth2Client);
          }
        } catch (e) {
          res.end("<!DOCTYPE html><html><head><title>Google Auth Login</title><script>window.setTimeout(function(){window.close()},5000);</script></head><body><div id='container'><h1>An error has occured :( , Please retry</h1></div></body><style>@import url('https://fonts.googleapis.com/css2?family=Arsenal:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');html,body{height:100%;width:100%;margin:0;}#container{font-family:Roboto;color:#333;text-align:center;display:flex;align-items:center;padding:40px;margin:auto;height:500px;width:500px;border-radius:50px;box-shadow:5px 5px 5px #aaaaaa;background-color:#f0f0f0}body{display:flex;align-content:center;}</style></html>");
          reject(e);
        }
      })
      .listen(3500, () => {
        const win = new BrowserWindow();
        // open the browser to the authorize url to start the workflow
        win.loadURL(authorizeUrl, {wait: false}).then(cp => cp.unref());
      });
    destroyer(server);
  });
}

export async function login(){
  return await getAuthenticatedClient();
}

export async function getEvents(calendarId='primary') {
  const  auth = await clientManager();
  const calendar = google.calendar({version: 'v3', auth});
  const result = await calendar.events.list({
    calendarId: calendarId,
    maxResults:4000,
    singleEvents: true,
    orderBy: 'startTime',
  });
  return result.data.items;
}
export async function getWeekEvents(calendarId='primary'){
  let first = new Date();
  let last = new Date();
  first.setDate(today-today.getDay());
  last.setDate(first.getDate()+7);
  const  auth = await clientManager();
  const calendar = google.calendar({version: 'v3', auth});
  const result = await calendar.events.list({
    calendarId: calendarId,
    timeMin: first.toISOString(),
    timeMax: last.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  return result.data.items;
}