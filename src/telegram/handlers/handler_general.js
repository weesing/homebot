import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { TelegramValidator } from '../validator';

module.exports = class HandlerGeneral extends HandlerBase {
  async handleMessage(context) {
    logger.info(`on text ${util.inspect(context, { depth: 10 })}`);
    return super.handleMessage(context);
  }
};
