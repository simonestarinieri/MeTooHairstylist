import { app, BrowserWindow,ipcMain } from 'electron/main';
import path from 'node:path';
import { fileURLToPath } from 'url';
import {dirname} from 'path';
import {getEvents,login} from './googleCalendar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('src/public/index.html')
}
const createAppointmentWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('src/public/appointment.html')
}

app.whenReady().then(async () => {
  await login();
  ipcMain.handle('ping',()=>'pong');
  ipcMain.handle('events', async (event,data) =>await getEvents(data.day,data.id));
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

ipcMain.handle('createAppointment',async (data)=>await newAppointment(data));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

async function newAppointment(data){
  createAppointmentWindow()
}