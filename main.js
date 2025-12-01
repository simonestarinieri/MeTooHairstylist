const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const {getEvents} = require('./GCal.js')
const {sendReminder} = require('./WABusinessAPI.js');
const destroyer = require('server-destroy');
app.use(express.static('public'));
const timeMin = new Date();
timeMin.setDate(timeMin.getDate()+1);
const timeMax = new Date(timeMin);
timeMin.setHours(0,0,1,0);
timeMax.setHours(23,59,59,0);
app.get('/',async (req,res)=>{
    console.log('test')
    res.sendFile(path.join(__dirname,'public/index.html'));
    let events = await getEvents().catch(console.error);
    await sendReminder(events);
})

app.listen(port,()=>{
    console.log('server started');
})