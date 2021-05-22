import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { BotState } from '../bot_state';

module.exports = class HandlerEnable extends HandlerBase {
  handleMessage(context) {
    logger.info(`Handling bot enable command`);
    this.sendMessage({ context, msg: `Bot is now enabled` });
    BotState.getInstance().enabled = true;
  }
};
