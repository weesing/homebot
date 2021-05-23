import { HandlerBase } from './handler_base';
import logger from '../../common/logger';

module.exports = class HandlerBroadcast extends HandlerBase {
  async handleMessage(context) {
    let cmdArgs = this.extractCommandArguments(context, '/broadcast');
    if (cmdArgs.length > 0) {
      if (!this.validateEnable(context)) {
        return;
      }
      this.sendMessage({
        context,
        msg: `Broadcasting ${cmdArgs} on Google Home Minis`
      });
      logger.info(`Handling broadcasting message '${cmdArgs}'`);
      this.assistantBroadcast(cmdArgs);
    }
  }
};
