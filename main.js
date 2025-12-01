import * as  http from 'http';
import * as fs from 'fs';
import dateEvents from 'date-events';
import {getEvents} from './GCal.js';
import {sendReminder} from './WABusinessAPI.js';

const timeMin = new Date();
timeMin.setDate(timeMin.getDate()+1);
const timeMax = new Date(timeMin);
timeMin.setHours(0,0,1,0);
timeMax.setHours(23,59,59,0);

handleMessages().catch(console.error);
console.log('Messages sent');

async function handleMessages(){
    const events = await getEvents(timeMin,timeMax);
    console.log(events);
    await sendReminder(events);

}
