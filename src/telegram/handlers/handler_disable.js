import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { BotState } from '../bot_state';

module.exports = class HandlerDisable extends HandlerBase {
  async handleMessage(context) {
    logger.info(`Handling bot disable command`);
    this.sendMessage({ context, msg: `Bot is now disabled` });
    BotState.getInstance().enabled = false;
  }
};
