import { HandlerDeviceSwitchBase } from './handler_deviceswitch';

module.exports = class HandlerDeviceOff extends HandlerDeviceSwitchBase {
  constructor(args) {
    super(args);
  }
  
  handleMessage(context) {
    let cmdArgs = this.extractCommandArguments(context, '/deviceoff');
    return super.handleMessage(context, 'Deactivate', cmdArgs);
  }
}
