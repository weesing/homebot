import { HandlerDeviceSwitchBase } from './handler_deviceswitch';

module.exports = class HandlerDeviceOn extends HandlerDeviceSwitchBase {
  constructor(args) {
    super(args);
  }

  handleMessage(context) {
    let cmdArgs = this.extractCommandArguments(context, '/deviceon');
    return super.handleMessage(context, 'Activate', cmdArgs);
  }
};
