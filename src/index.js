const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const scClient = require("socketcluster-client");
const macaddress = require("macaddress");
const ip = require("ip");
const os = require("os");
const sh = require("child_process");
const cron = require("node-cron");

dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};

const reboot = cron.schedule("30 7 * JAN-JUN,SEP-DEC MON-FRI", () => {
  console.log("Reboot");
  sh.exec("sudo /sbin/shutdown -r now", function (msg) {
    socket.publish(mac, { msg: `Rebooting now! ${msg}` });
  });
});

const hdmi = cron.schedule("0 17 * JAN-JUN,SEP-DEC MON-FRI", () => {
  console.log("Turn off HDMI");
  sh.exec("sudo tvservice -o", function (msg) {
    // socket.publish(mac, { msg: `Rebooting now! ${msg}` })
    console.log(`Turning off HDMI ${msg}`);
  });
});

reboot.start();
hdmi.start();

app.on("ready", () => {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      plugins: true,
    },
  });
  win.loadURL(
    "https://docs.google.com/presentation/d/e/2PACX-1vSFVVS4yw0fOsf6667kFgh7iLzm2Y-rQEcSdx5L6qccDEz8lgNZYhSj3uiJvoIQQz7VrnaGNudpAA8H/pub?start=true&loop=true&delayms=3000"
  );
  win.setFullScreen(true);

  win.webContents.on("dom-ready", (event) => {
    let css = "* { cursor: none !important; }";
    win.webContents.insertCSS(css);
  });
});
