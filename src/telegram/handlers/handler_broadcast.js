import { HandlerBase } from './handler_base';
import logger from '../../common/logger';

export class HandlerBroadcast extends HandlerBase {
  async broadcastMessage(context, broadcastMessage) {
    if (!this.validateEnable(context)) {
      return;
    }
    this.sendMessage({
      context,
      msg: `Broadcasting ${broadcastMessage} on Google Home Minis`
    });
    logger.info(`Handling broadcasting message '${broadcastMessage}'`);
    this.assistantBroadcast(broadcastMessage);
  }

  async handleMessage(context) {
    let broadcastMessage = this.extractCommandArguments(context, '/broadcast');
    if (broadcastMessage.length > 0) {
      await this.broadcastMessage(context, broadcastMessage);
    }
  }
};

module.exports = HandlerBroadcast;
