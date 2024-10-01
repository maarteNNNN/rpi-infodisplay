import {
  app,
  BrowserWindow,
  screen,
} from 'electron';
import * as scClient from 'socketcluster-client';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'node:fs/promises';
import { CronJob } from 'cron';
import InstanceService from './service.mjs';

const config = JSON.parse(await readFile('./config.json', 'utf-8'));

const socket = scClient.create({
  host: config.controller ?? 'localhost:8000',
  // port: 443,
  // secure: true,
  // // Only necessary during debug if using a self-signed certificate
  // wsOptions: { rejectUnauthorized: false },
  autoReconnectOptions: {
    initialDelay: 1000, // in milliseconds
    maxDelay: 2000, // in milliseconds
  },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow = null;
let infoWindow = null;

const actions = {
  saveProps: async (data) => {
    config.name = data.payload.props.name;
    config.location = data.payload.props.location;
    config.url = data.payload.props.url;
    config.zoomFactor = parseFloat(data.payload.props.zoomFactor);
    // JSON.parse(await readFile('./config.json', 'utf-8'));
    await writeFile('./config.json', JSON.stringify(config, null, 2), 'utf-8');

    mainWindow.loadURL(data.payload.props.url);
    mainWindow.webContents.setZoomFactor(
      parseFloat(data.payload.props.zoomFactor)
    );
  },
  refresh: () => {
    mainWindow.reload();
  },
  toggleDevtools: () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.webContents.closeDevTools();
    }
  },
  showInfo: () => {
    showInfoWindow();
  },
  getScreenshot: async (data) => {
    const image = await mainWindow.webContents.capturePage();
    try {
      socket.transmitPublish(`instance/confirmationChannel:${data.messageId}`, {
        // message: 'confirmation ',
        action: 'getScreenshot',
        image: image.toPNG(),
      });
      // debugger;
    } catch (error) {
      console.log(error);
    }
  },
  ping: async (data) => {
    console.log('ping action', data);
    // const image = await mainWindow.webContents.capturePage();
    try {
      console.log(
        'ping confirmation',
        `instance/confirmationChannel:${data.messageId}`
      );
      socket.transmitPublish(`instance/confirmationChannel:${data.messageId}`, {
        // message: 'confirmation ',
        action: 'ping',
        serial: data.payload.serial,
        socket: socket.id,
      });
      // debugger;
    } catch (error) {
      console.log(error);
    }
  },
};

const instance = new InstanceService(config, actions, socket)
instance.connect();

// NOT UNDERSTANDABLE BUT IF I DO IT BELOW IT DOESN'T WORK ON THE PI... SEE COMMENTED CODE
const device = await InstanceService.systemInfo();

// Shows Info for 10secs
const showInfoWindow = async () => {
  // const device = await InstanceService.systemInfo()
  // const device = {}
  // const device = await getSystemInfo()

  setInfoText(JSON.stringify({ config, device }, null, 2));
  infoWindow.show();
  setTimeout(() => {
    infoWindow.hide();
  }, 10000);
};

// Set text InfoWindow
const setInfoText = (text) => {
  infoWindow.webContents.send('setInfoText', text);
};

// Electron windows create functions
const createMainWindow = () => {
  const display = screen.getPrimaryDisplay();
  mainWindow = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.size.width + 1,
    height: display.size.height,
    fullscreen: config.fullscreen ?? true,
    frame: config.frame ?? false,
    // focusable: false, // On Linux: false makes the window stop interacting with wm, so the window will always stay on top in all workspaces.
  });

  mainWindow.loadURL(config.url ?? 'https://edugolo.be');

  // Hide cursor in webpage
  mainWindow.webContents.on('dom-ready', (event) => {
    let css = '* { cursor: none !important; }';
    mainWindow.webContents.insertCSS(css);
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.webContents.setZoomFactor(config.zoomFactor ?? 1);
    setupCronjobs();
  });
};

const createInfoWindow = () => {
  infoWindow = new BrowserWindow({
    parent: mainWindow,
    y: mainWindow.getBounds().y,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height,
    show: false,
    transparent: true,
    frame: false,
    backgroundColor: '#00FFFFFF',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegrationInWorker: true,
      contextIsolation: true,
    },
  });
  infoWindow.loadFile(path.join(__dirname, 'info.html'));
  infoWindow.on('ready-to-show', () => {
    showInfoWindow();
  });
};

app.commandLine.appendSwitch('disable-gpu');

app.on('ready', async () => {

  createMainWindow();
  createInfoWindow();
  console.log('App ready');
});

app.on('before-quit', async (e) => {
  // try {
  //   e.preventDefault();
  //   await socket.invoke('devices/goodbye', { serial: systemInfo.serial });
  //   app.exit();
  // } catch (error) {
  //   console.error(error);
  // }
});

const setupCronjobs = () => {
  // Auto refresh  in config
  if (config.refreshCronExpression && config.refreshCronExpression.length > 0) {
    new CronJob(
      config.refreshCronExpression, // cronTime
      function() {
        actions.refresh();
        console.log('refresh', new Date());
      }, // onTick
      null, // onComplete
      true // start
    );
  }
};
