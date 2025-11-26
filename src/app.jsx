import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createCalendar, createViewWeek } from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
import logo from './logo.png'
var eventsList = [];
window.electronAPI.getData().then((receivedData) => {
      eventsList = receivedData.message;
      console.log(eventsList);
    }).catch((error) => {
      console.error('Error fetching data:', error);
    });
const header=createRoot(document.getElementById('header'));
const headerContent =<img src={logo} alt="MeToo"/>;
const calendar = createCalendar({
  views: [createViewWeek()],
  events:eventsList,
})
calendar.render(document.getElementById('calendar'))
header.render(headerContent);
