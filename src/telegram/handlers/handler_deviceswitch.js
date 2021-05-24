import { GoogleAssistantHelper } from "../../googleassistant/assistantHelper";
import { HandlerBase } from "./handler_base";
import { AssetDefines } from '../../lib/asset_defines';
import logger from '../../common/logger';

export class HandlerDeviceSwitchBase extends HandlerBase {
  constructor(args) {
    super(args);
  }

  async handleMessage(context, command, device) {
    if (device.length > 0) {
      if (!this.validateEnable(context)) {
        return;
      }
      let reply = `${AssetDefines.okHandIcon} ${command.toUpperCase()} device ${device}`;
      this.sendMessage({ context, msg: reply });
      logger.info(reply);
      let assistantHelper = new GoogleAssistantHelper();
      assistantHelper.device(command, device);
    }
  }
}