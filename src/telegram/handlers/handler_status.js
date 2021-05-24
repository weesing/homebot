import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { BotState } from '../bot_state';

export class HandlerStatus extends HandlerBase {
  async handleMessage(context) {
    logger.info(`Handling status command`);
    let reply = `Status - Home Bot is alive\nEnabled - ${
      BotState.getInstance().enabled ? 'Yes' : 'No'
    }`;
    this.sendMessage({ context, msg: reply });
  }
};

module.exports = HandlerStatus;