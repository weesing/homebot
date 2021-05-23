import { GoogleAssistantHelper } from "../../googleassistant/assistantHelper";
import { HandlerBase } from "./handler_base";
import logger from '../../common/logger';

export class HandlerDeviceSwitchBase extends HandlerBase {
  constructor(args) {
    super(args);
  }

  async handleMessage(context, command, cmdArgs) {
    if (cmdArgs.length > 0) {
      if (!this.validateEnable(context)) {
        return;
      }
      let reply = `${command} device ${cmdArgs}`;
      this.sendMessage({ context, msg: reply });
      logger.info(reply);
      let assistantHelper = new GoogleAssistantHelper();
      assistantHelper.device(command, cmdArgs);
    }
  }
}