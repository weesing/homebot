import { HandlerDeviceSwitchBase } from './handler_deviceswitch';

export class HandlerDeviceOn extends HandlerDeviceSwitchBase {
  constructor(args) {
    super(args);
  }

  async handleMessage(context) {
    let device = this.extractCommandArguments(context, '/deviceon');
    return await this.switchDevice(context, 'Activate', device);
  }
}

module.exports = HandlerDeviceOn;
