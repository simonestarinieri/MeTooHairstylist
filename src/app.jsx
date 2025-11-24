import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createCalendar, createViewWeek } from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import 'temporal-polyfill/global'
 
const calendar = createCalendar({
  views: [createViewWeek()],
  events: [
    {
        id: 1,
        title: 'Coffee with John',
        start: Temporal.ZonedDateTime.from('2025-11-24T10:05:00+01:00[Europe/Berlin]'),
        end: Temporal.ZonedDateTime.from('2025-11-24T10:35:00+01:00[Europe/Berlin]'),
    },
  ],
    timezone: 'Europe/Rome',
    locale: 'it-IT',
    dayBoundaries: {
        start: '06:00',
        end: '19:00',
    }
})
 
calendar.render(document.getElementById('calendar'))