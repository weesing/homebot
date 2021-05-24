import { HandlerDeviceSwitchBase } from './handler_deviceswitch';

module.exports = class HandlerDeviceOn extends HandlerDeviceSwitchBase {
  constructor(args) {
    super(args);
  }

  async handleMessage(context) {
    let device = this.extractCommandArguments(context, '/deviceon');
    return await super.handleMessage(context, 'Activate', device);
  }
};
