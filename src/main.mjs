// const { app, BrowserWindow, dialog, screen } = require('electron');
// const path = require('path');
// const client = require('socketcluster-client');
// const macaddress = require('macaddress');
// const hwid = require('hwid');
// const ip = require('ip');
// const os = require('os');
// const sh = require('child_process');
// const cron = require('node-cron');
import { app, BrowserWindow, dialog, ipcMain, screen } from 'electron';
import { dirname, join } from 'path';
import * as client from 'socketcluster-client';
// import { all } from 'macaddress';
// import { getHWID } from 'hwid';

// import macaddress from 'macaddress';
// const { all: getAllMacs } = macaddress;

import * as si from 'systeminformation';

import * as path from 'path';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow = null;
let consoleWindow = null;

const socket = client.create({
  hostname: 'api.dev.edugolo.be',
  // hostname: 'localhost',
  port: 443,
  // port: 8000,
  secure: true,
  // Only necessary during debug if using a self-signed certificate
  wsOptions: { rejectUnauthorized: false },
  // autoReconnectOptions: {
  //   initialDelay: 1000, // in milliseconds
  //   maxDelay: 2000, // in milliseconds
  // },
});
(async () => {
  for await (const event of socket.listener('connect')) {
    console.log(`Connected to server with socket id ${socket.id}`);
    console.log(`Authenticated?: ${event.isAuthenticated}`);

    if (!event.isAuthenticated) {
      // router.push({ name: 'login'})
      // window.location.replace(`http://localhost:9000`);
    }
    (async () => {
      let channel = socket.subscribe('foo');
      for await (let data of channel) {
        console.log(data);
        actions[data.action](data.payload);
      }
    })();
  }
})();
(async () => {
  for await (const event of socket.listener('disconnect')) {
    console.log('Disconnected from server');
  }
})();
(async () => {
  for await (const event of socket.listener('authStateChange')) {
    console.log(`authStateChange ${socket.id}`);
    // if (event.newAuthState === 'authenticated') {
    //   router.push({ name: 'chat' });
    // } else {
    //   router.push({ name: 'login' });
    // }
  }
})();
(async () => {
  for await (const event of socket.listener('error')) {
    console.log(event.error);
  }
})();

const actions = {
  loadURL: (payload) => {
    mainWindow.loadURL(payload.url);
  },
  hello: (payload) => {
    console.log(payload.message);
  },
  reload: () => {
    mainWindow.reload();
  },
  reboot: () => {
    console.log('reboot');
  },
  toggleDevtools: () => {
    console.log(mainWindow.webContents.isDevToolsOpened());
    debugger;
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.webContents.closeDevTools();
    }
  },
  getDeviceProps: async () => {
    console.log('getDeviceProps');
    // console.log(await getAllMacs());
    // console.log(await getHWID());
    // console.log(await si.cpu());
    // console.log(await si.osInfo());
    // console.log(await si.cpuCurrentSpeed());

    // https://systeminformation.io/
    const res = await si.get({
      cpu: 'manufacturer, brand, vendor, family, model, revision',
      osInfo: 'platform, distro, release, codename, kernel, arch, serial', //'platform, release',
      system: 'manufacturer, model',
      networkInterfaces: 'iface, ifaceName, ip4, mac, type, default',
    });
    res.defaultNetworkInterface = res.networkInterfaces.find((iface) => {
      return iface.default === true;
    });
    delete res.networkInterfaces;
    setConsoleText(JSON.stringify(res, null, 2));
  },
  toggleConsoleWindow: () => {
    if (!consoleWindow.isVisible()) {
      consoleWindow.show();
    } else {
      consoleWindow.hide();
    }
  },
  locate: async () => {
    console.log('locate');
    setConsoleText('locate');
  },
  getScreenshot: async () => {
    console.log('getScreenshot');
    const image = await mainWindow.webContents.capturePage();
    console.log(image);
  },
};

const setConsoleText = (text) => {
  consoleWindow.webContents.send('setConsoleText', text);
};

// dialog.showErrorBox = function (title, content) {
//   console.log(`${title}\n${content}`);
// };

// /**
//  * At 07:30 on every day-of-week from Monday through Friday
//  * in every month from January through June
//  * and every month from September through December. */
// const reboot = cron.schedule('30 7 * JAN-JUN,SEP-DEC MON-FRI', () => {
//   console.log('Reboot');
//   sh.exec('sudo /sbin/shutdown -r now', function (msg) {
//     socket.publish(mac, { msg: `Rebooting now! ${msg}` });
//   });
// });

// /**
//  * At 17:00 on every day-of-week from Monday through Friday
//  * in every month from January through June
//  * and every month from September through December.
//  */
// const hdmi = cron.schedule('0 17 * JAN-JUN,SEP-DEC MON-FRI', () => {
//   console.log('Turn off HDMI');
//   sh.exec('sudo tvservice -o', function (msg) {
//     // socket.publish(mac, { msg: `Rebooting now! ${msg}` })
//     console.log(`Turning off HDMI ${msg}`);
//   });
// });

// reboot.start();
// hdmi.start();

const createMainWindow = () => {
  // win = new BrowserWindow({
  //   width: 1920,
  //   height: 1080,
  //   webPreferences: {
  //     plugins: true,
  //   },
  // });
  const display = screen.getPrimaryDisplay();
  mainWindow = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.size.width * 0.75, // + 1,
    height: display.size.height * 0.75,
    // fullscreen: true,
    // focusable: false, // On Linux: false makes the window stop interacting with wm, so the window will always stay on top in all workspaces.
  });
  // debugger;
  mainWindow.loadURL(
    // 'https://docs.google.com/presentation/d/e/2PACX-1vSFVVS4yw0fOsf6667kFgh7iLzm2Y-rQEcSdx5L6qccDEz8lgNZYhSj3uiJvoIQQz7VrnaGNudpAA8H/pub?start=true&loop=true&delayms=3000'
    'https://display.edugolo.be'
  );

  // win.setFullScreen(true);
  // debugger;

  // Hide cursor in webpage
  mainWindow.webContents.on('dom-ready', (event) => {
    let css = '* { cursor: none !important; }';
    mainWindow.webContents.insertCSS(css);
  });
  // mainWindow.webContents.openDevTools();
};

const createConsoleWindow = () => {
  consoleWindow = new BrowserWindow({
    parent: mainWindow,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegrationInWorker: true,
      contextIsolation: true,
    },
  });
  consoleWindow.loadFile(path.join(__dirname, 'top.html'));
  consoleWindow.webContents.openDevTools();
};

// Suppress GetVSyncParametersIfAvailable() errors
// app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu');

app.on('ready', () => {
  createMainWindow();

  createConsoleWindow();
});
