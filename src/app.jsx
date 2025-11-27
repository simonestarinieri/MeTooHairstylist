import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createCalendar, createViewWeek } from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import logo from './logo.png'
var data=[];
const zone="[Europe/Rome]";
window.electronAPI.getData().then(async (receivedData) => {
  parseEvents(receivedData.message).then((eventsList)=>{
  const calendar = createCalendar({
    views: [createViewWeek()],
    events:eventsList,
    locale: 'it-IT',
    timezone: 'Europe/Rome',
    firstDayOfWeek: 1,
    dayBoundaries:{
      start: '06:00',
      end: '20:00',
    },
  })
  calendar.render(document.getElementById('calendar'))
});
  console.log(receivedData.message,"inside");
    }).catch((error) => {
      console.error('Error fetching data:', error);
    });
const header=createRoot(document.getElementById('header'));
const headerContent =<img src={logo} alt="MeToo"/>;
header.render(headerContent);

async function parseEvents(list){
  let events = [];
  let i=1;
    for(let element of list){
      events.push({
        'id':i,
        'start': Temporal.ZonedDateTime.from(element.start?.dateTime+zone),
        'end': Temporal.ZonedDateTime.from(element.end?.dateTime+zone),
        'title':element.summary,
        'description':element.description
      });
    
      i++;
    }
  return(events);
}