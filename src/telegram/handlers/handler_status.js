import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { BotState } from '../bot_state';

module.exports = class HandlerStatus extends HandlerBase {
  handleMessage(context) {
    logger.info(`Handling status command`);
    let reply = `Status - Home Bot is alive\nEnabled - ${
      BotState.getInstance().enabled ? 'Yes' : 'No'
    }`;
    this.sendMessage({ context, msg: reply });
  }
};
