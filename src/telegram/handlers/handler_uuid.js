import { HandlerBase } from './handler_base';
import { v4 as uuidV4 } from 'uuid';
import logger from '../../common/logger';

export class HandlerUUID extends HandlerBase {
  async handleMessage(context) {
    let uuid = uuidV4();
    uuid = uuid.replace(/-/g, '\\-');
    logger.info(`Generated UUID ${uuid}`);
    const msg = `\`\`\`${uuid}\`\`\``;
    logger.info(msg);
    const opts = {
      parse_mode: 'MarkdownV2'
    };
    await this.sendMessage({ context, msg, opts });
    const link = `[uuidgenerator\\.net](https://www.uuidgenerator.net/)`;
    await this.sendMessage({ context, msg: link, opts });
  }
}

module.exports = HandlerUUID;