const express = require('express');
const app = express();
const path = require('path');
const port = 10000;
const {getEvents} = require('./GCal.js')
const {sendReminder} = require('./WABusinessAPI.js');
const destroyer = require('server-destroy');
const timeMin = new Date();
timeMin.setDate(timeMin.getDate()+1);
const timeMax = new Date(timeMin);
timeMin.setHours(0,0,1,0);
timeMax.setHours(23,59,59,0);

app.get('/',async (req,res)=>{
    res.send('hello there, wrong page');
})
app.get('/auto',async(req,res)=>{
    let events = await getEvents().catch(console.error);
    await sendReminder(events);
    res.send('messages sent')
})
app.listen(port,()=>{
    console.log('server started');
})