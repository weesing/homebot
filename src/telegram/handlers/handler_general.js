import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { TelegramValidator } from '../validator';

export class HandlerGeneral extends HandlerBase {
  async handleMessage(context) {
    logger.info(`on text ${util.inspect(context, { depth: 10 })}`);
    return super.handleMessage(context);
  }
};

module.exports = HandlerGeneral;