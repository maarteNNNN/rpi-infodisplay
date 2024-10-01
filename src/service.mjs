import * as sysInfo from 'systeminformation';

export default class InstanceService {
  constructor(config, actions, socket) {
    this.config = config
    this.actions = actions
    this.socket = socket
    this.instance = {}
    this.serial = null
    this.interval = null
    this.subscription = null

    this.disconnect()
  }

  async connect() {
    for await (const event of this.socket.listener('connect')) {
      await this.identify()
      await this.heartbeat()
    }
  }

  async disconnect() {
    for await (const event of this.socket.listener('disconnect')) {
      console.error(`[${new Date().toISOString()} WARN] Disconnected from socket`, event)
      clearInterval(this.interval)
      this.subscription.unsubscribe()
    }
  }

  async identify() {
    const systemInfo = await InstanceService.systemInfo()

    this.serial = systemInfo.serial

    console.log(`[${new Date().toISOString()} INFO] Identifying`)
    this.instance = (await this.socket.invoke('instance/identify', {
      // systemInfo: {
      //   serial: 'test',
      //   system: {
      //     manufacturer: 'test',
      //     model: 'pi'
      //   }
      // },
      systemInfo,
      config: this.config,
    })).data.instance.data

    this.subscribe()

    return this.instance
  }

  async subscribe() {
    console.log(`[${new Date().toISOString()} INFO] Subscribing to ${this.channel}`)

    this.subscription = this.socket.subscribe(
      this.channel
    )


    for await (let data of this.subscription) {
      console.log(`[${new Date().toISOString()} INFO] Receiving data`, data)

      if (!this.actions[data.action]) {
        console.error(`[${new Date().toISOString()} ERROR] Action does not exist!`)
        continue
      }

      this.actions[data.action](data);
    }
  }

  async heartbeat() {
    this.interval = setInterval(() => {
      console.log(`[${new Date().toISOString()} DEBUG] Heartbeat`)
      this.socket.transmit('instance/heartbeat', { serialNumber: this.serial, type: this.config.type })
    }, 1000);
  }


  static async systemInfo() {
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

  get channel() {
    if (!this.instance.id) {
      return ''
    } else {
      return `instance/channel:${this.instance.id}`
    }
  }

  async actionHandler() {
    for await (const event of this.socket.listener('connect')) {
      console.log(`Connected to server with socket id ${socket.id}`);
      console.log(`Authenticated?: ${event.isAuthenticated}`);

      // const systemInfo = await InstanceService.systemInfo();

      // Subscribe to private channel, where actions can be tranmitted to
      (async () => {
        for await (let data of socket.subscribe(
          // 'private'/<module>:<id>
          // `devices/channel:${channel}`
          // `instance/channel:${systemInfo.serial}`
          'instance/channel:test'
        )) {
          try {
            actions[data.action](data);
          } catch (e) {
            console.error(e);
          }
        }
        console.log('subscribed from private channel');
      })();
    }
  }
}
