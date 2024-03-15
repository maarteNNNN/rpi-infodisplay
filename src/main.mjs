import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  screen,
  desktopCapturer,
  session,
} from 'electron';
import * as scClient from 'socketcluster-client';
import * as sysInfo from 'systeminformation';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow = null;
let infoWindow = null;

const getSystemInfo = async () => {
  const si = await sysInfo.get({
    cpu: 'manufacturer, brand, vendor, family, model, revision',
    osInfo: 'platform, distro, release, codename, kernel, arch, serial', //'platform, release',
    system: 'manufacturer, model',
    networkInterfaces: 'iface, ifaceName, ip4, mac, type, default',
  });
  si.defaultNetworkInterface = si.networkInterfaces.find((iface) => {
    return iface.default === true;
  });
  delete si.networkInterfaces;
  return {
    serial: si.osInfo.serial,
    system: si,
  };
};

const systemInfo = await getSystemInfo();
const config = JSON.parse(await readFile('./config.json', 'utf-8'));

const socket = scClient.create({
  host: config.controller ?? 'localhost:8000',
  // hostname: '10.21.10.80',
  // port: config.display.controller.port ?? '8000',
  // hostname: 'api.dev.edugolo.be',
  // port: 443,
  // secure: true,
  // // Only necessary during debug if using a self-signed certificate
  // wsOptions: { rejectUnauthorized: false },
  autoReconnectOptions: {
    initialDelay: 1000, // in milliseconds
    maxDelay: 2000, // in milliseconds
  },
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
      let result;
      try {
        result = await socket.invoke('devices/announce', {
          systemInfo,
          config,
        });
      } catch (error) {
        console.error(error);
      }
    })();

    (async () => {
      for await (let data of socket.subscribe(
        `devices/channel:${systemInfo.serial}`
      )) {
        console.log(data);
        try {
          actions[data.action](data);
        } catch (e) {
          console.error(e);
        }
      }
    })();
    (async () => {
      for await (let data of socket.subscribe(`devices/channel:all`)) {
        console.log(data);
        try {
          actions[data.action](data.payload);
        } catch (e) {
          console.error('error');
        }
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
    // console.log(event.error);
  }
})();

const actions = {
  changeUrl: (data) => {
    mainWindow.loadURL(data.payload.url);
  },
  reload: () => {
    console.log('reload');
    mainWindow.reload();
  },
  reboot: () => {
    console.log('reboot');
  },
  toggleDevtools: () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.webContents.closeDevTools();
    }
  },
  // showDeviceProps: async () => {
  //   setInfoText(JSON.stringify(device, null, 2));
  // },
  toggleInfoWindow: () => {
    if (!infoWindow.isVisible()) {
      setInfoText(
        JSON.stringify({ config: config, device: systemInfo }, null, 2)
      );
      infoWindow.show();
    } else {
      infoWindow.hide();
    }
  },
  locate: async () => {
    console.log('locate');
    setInfoText('locate');
  },
  getScreenshot: async (data) => {
    console.log('getScreenshot', data);
    const image = await mainWindow.webContents.capturePage();
    // const sources = await desktopCapturer.getSources({
    //   types: ['screen'],
    //   thumbnailSize: { width: 600, height: 400 },
    // });
    // const image = sources[0].thumbnail;
    try {
      // await writeFile('./screenshot.png', image.toPNG());

      socket.transmitPublish(`devices/confirmationChannel:${data.messageId}`, {
        message: 'confirmation ',
        image: image.toPNG(),
      });
      // debugger;
    } catch (error) {
      console.log('here', error);
    }

    // console.log(image);
    // debugger;
  },
  disconnect: () => {
    socket.disconnect();
  },
};

const setInfoText = (text) => {
  infoWindow.webContents.send('setInfoText', text);
};

// dialog.showErrorBo

const createMainWindow = () => {
  const display = screen.getPrimaryDisplay();
  mainWindow = new BrowserWindow({
    // x: 20, // display.bounds.x,
    // y: 20, // display.bounds.y,
    // width: display.size.width + 1,
    // height: display.size.height,
    fullscreen: config.fullscreen ?? true,
    frame: config.frame ?? false,
    // focusable: false, // On Linux: false makes the window stop interacting with wm, so the window will always stay on top in all workspaces.
  });
  // debugger;
  // mainWindow.setFullScreen(true);
  mainWindow.loadURL(config.url ?? 'https://edugolo.be');

  // Hide cursor in webpage
  mainWindow.webContents.on('dom-ready', (event) => {
    let css = '* { cursor: none !important; }';
    mainWindow.webContents.insertCSS(css);
  });
  // mainWindow.webContents.openDevTools();
};

const createConsoleWindow = () => {
  infoWindow = new BrowserWindow({
    parent: mainWindow,
    // x: mainWindow.getBounds().x,
    // y: mainWindow.getBounds().y,
    // width: mainWindow.getBounds().width,
    // height: mainWindow.getBounds().height + 50,
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
  // infoWindow.webContents.openDevTools();
};

// Suppress GetVSyncParametersIfAvailable() errors
// app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu');

app.on('ready', async () => {
  createMainWindow();
  createConsoleWindow();
  // device = await getDeviceInfo();
  // await setupWebsocket();
  console.log('App ready');
});

app.on('before-quit', async (e) => {
  try {
    e.preventDefault();
    // debugger;
    await socket.invoke('devices/goodbye', { serial: systemInfo.serial });
    app.exit();
  } catch (error) {
    console.error(error);
  }
});
