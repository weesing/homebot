import { HandlerDeviceSwitchBase } from './handler_deviceswitch';

module.exports = class HandlerDeviceOff extends HandlerDeviceSwitchBase {
  constructor(args) {
    super(args);
  }

  async handleMessage(context) {
    let cmdArgs = this.extractCommandArguments(context, '/deviceoff');
    return await super.handleMessage(context, 'Deactivate', cmdArgs);
  }
};
