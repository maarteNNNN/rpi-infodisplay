const { app, BrowserWindow, dialog, screen } = require('electron');
const path = require('path');
const scClient = require('socketcluster-client');
const macaddress = require('macaddress');
const ip = require('ip');
const os = require('os');
const sh = require('child_process');
const cron = require('node-cron');

dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};

/**
 * At 07:30 on every day-of-week from Monday through Friday
 * in every month from January through June
 * and every month from September through December. */
const reboot = cron.schedule('30 7 * JAN-JUN,SEP-DEC MON-FRI', () => {
  console.log('Reboot');
  sh.exec('sudo /sbin/shutdown -r now', function (msg) {
    socket.publish(mac, { msg: `Rebooting now! ${msg}` });
  });
});

/**
 * At 17:00 on every day-of-week from Monday through Friday
 * in every month from January through June
 * and every month from September through December.
 */
const hdmi = cron.schedule('0 17 * JAN-JUN,SEP-DEC MON-FRI', () => {
  console.log('Turn off HDMI');
  sh.exec('sudo tvservice -o', function (msg) {
    // socket.publish(mac, { msg: `Rebooting now! ${msg}` })
    console.log(`Turning off HDMI ${msg}`);
  });
});

reboot.start();
hdmi.start();

// Suppress GetVSyncParametersIfAvailable() errors
// app.commandLine.appendSwitch('disable-gpu-compositing');
// app.commandLine.appendSwitch('disable-gpu');

app.on('ready', () => {
  // win = new BrowserWindow({
  //   width: 1920,
  //   height: 1080,
  //   webPreferences: {
  //     plugins: true,
  //   },
  // });
  let display = screen.getPrimaryDisplay();
  win = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.size.width, // + 1,
    height: display.size.height,
    fullscreen: true,
    focusable: false, // On Linux: false makes the window stop interacting with wm, so the window will always stay on top in all workspaces.
  });
  // debugger;
  win.loadURL(
    'https://docs.google.com/presentation/d/e/2PACX-1vSFVVS4yw0fOsf6667kFgh7iLzm2Y-rQEcSdx5L6qccDEz8lgNZYhSj3uiJvoIQQz7VrnaGNudpAA8H/pub?start=true&loop=true&delayms=3000'
  );

  // win.setFullScreen(true);
  // debugger;

  // Hide cursor in webpage
  win.webContents.on('dom-ready', (event) => {
    let css = '* { cursor: none !important; }';
    win.webContents.insertCSS(css);
  });

  // win.webContents.openDevTools();
});
