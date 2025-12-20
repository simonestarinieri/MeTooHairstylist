import path from 'node:path';
import process from 'node:process';
import {OAuth2Client} from 'google-auth-library';
import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';
import {readFile,writeFile} from 'fs/promises';

// The scope for reading calendar events.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The path to the credentials file.
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const credentials = JSON.parse(await readFile(CREDENTIALS_PATH,'utf8').catch(console.error))
const token = async () => {
    try{
        const data = await readFile('token.json','utf8');
        return JSON.parse(data);
    }catch(err){
        console.log('No Token set, request a new one by logging in');
        return false;
    }
}

/**
 * Lists the next 10 events on the user's primary calendar.
 */
export async function getEvents(today = new Date(),id='primary',timeMin=getMonday(today),timeMax=getSunday(today)) {
    // Authenticate with Google and get an authorized client.
    const auth = await login();
    // Create a new Calendar API client.
    const calendar = google.calendar({version: 'v3', auth});
    // Get the list of events.
    const result = await calendar.events.list({
        calendarId: id ,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: 1000,
        singleEvents: true,
        orderBy: 'startTime',   
    });
    return result.data.items;
}

export async function login(){
    if(await token()){
        const refresh = await token();
        const auth = new OAuth2Client({
            clientId:credentials.installed.client_id,
            clientSecret:credentials.installed.client_secret,
            redirectUri:credentials.installed.redirect_uris[0],
        });
        auth.setCredentials({
            refresh_token:refresh.refresh_token,
        })
        return auth;
    }else{
        console.log('startato il login')
        const auth = await authenticate({
            scopes:SCOPES,
            keyfilePath:CREDENTIALS_PATH,
        })
        await writeToken(auth.credentials).catch(console.error);
        return auth;
    }
}

async function writeToken(token){
    try{
        await writeFile('token.json',JSON.stringify(token),'utf8');
    }catch(err){
        console.log('Error writing token to disk: ',err);
    }
}

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    var res = new Date(d.setDate(diff));
    res.setHours(5,0,0,0);
    return res;
}
function getSunday(d){
    // Calculate the date of the last day of the week by adding the difference between the day of the month and the day of the week, then adding 6.
    var lastday = d.getDate() - (d.getDay() - 1) + 6;
    // Set the date to the calculated last day of the week.
    var res = new Date(d.setDate(lastday));
    res.setHours(23,0,0,0);
    return res;
}