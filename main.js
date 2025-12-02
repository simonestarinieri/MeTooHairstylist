const express = require('express');
const {OAuth2Client} = require('google-auth-library');
const fs = require('fs');
const keys = require('./credentials.json');
const app = express();
const path = require('path');
const {google} = require('googleapis');
const url = require('url');
const {sendReminder} = require('./WABusinessAPI.js');
const destroyer = require('server-destroy');

const port = 3000;
var token = false;
const local = 0;
const oAuth2Client = new OAuth2Client({
    clientId: keys.web.client_id,
    clientSecret: keys.web.client_secret,
    redirectUri: keys.web.redirect_uris[local]
});
const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt:'consent',
    scope: 'https://www.googleapis.com/auth/calendar'
});
oAuth2Client.setCredentials({
  refresh_token:token.refresh_token
});
const timeMin = new Date();
timeMin.setDate(timeMin.getDate()+1);
const timeMax = new Date(timeMin);
timeMin.setHours(6,30,0,0);
timeMax.setHours(23,0,0,0);
app.get('/',(req,res)=>{
    res.send('nothing to see here yet');
})
app.get('/manual',async (req,res)=>{
   if(handleClient()){
        res.redirect('./auto');
   }else{
        res.redirect('/auth');
   }
})

app.get('/auto',async(req,res)=>{
    let events = await getEvents().catch(console.error);
    await sendReminder(events);
    res.send('messages sent')
})
app.get('/oauth2callback'),async(req,res)=>{
    const qs = new url.URL(req.url, 'https://metoohairstylist.onrender.com:3000')
        .searchParams;
    const code = qs.get('code');
    console.log(`Code is ${code}`);
    res.end('Authentication successful! Please return to the console.');
}
app.listen(port,()=>{
    console.log('server started');
})



async function getEvents(tMin=timeMin,tMax=timeMax,calendarId='primary') { 
  const auth = oAuth2Client;
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
app.get('/auth',(req,res)=>{
    res.redirect(authorizeUrl);
});

app.get('/oauth2callback',async (req,res)=>{
    try{
    // acquire the code from the querystring, and close the web server.
    const qs = new url.URL(req.url, 'https://metoohairstylist.onrender.com:3000')
        .searchParams;
    const code = qs.get('code');
    console.log(`Code is ${code}`);
    res.send('<html><head><script>setTimeout(function(){window.location = "./auto";},3000)</script><body><h1>Authentication successful! Please return to the console.</h1></body></html>');
    // Now that we have the code, use that to acquire tokens.
    const r = await oAuth2Client.getToken(code);
    // Make sure to set the credentials on the OAuth2 client.
    oAuth2Client.setCredentials(r.tokens);
    fs.writeFile('token.json',JSON.stringify(r.tokens),function(err){
        if(err) return console.log(err);
    });
    console.info('Tokens acquired.');
    }catch (e) {
        console.log(e);
    }
});

//regenerate the client using refresh token
function regenerateClient(token){
  oAuth2Client.setCredentials({
    refresh_token:token.refresh_token
  });
  token = false;
  return oAuth2Client;
}

//check if token exists, if it does regenerate the client if it doesnt ask user for a new one
function handleClient(){
  try{
    token = JSON.parse(fs.readFileSync('./token.json'));
  }catch(err){
    console.log(err);
  }
  if(token){
    regenerateClient(token);
    return true;
  }else{
    return false;
  }
}