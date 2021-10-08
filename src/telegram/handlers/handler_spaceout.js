import { HandlerBase } from './handler_base';
import { SpaceoutLib } from '../../lib/spaceout';
import defaultLogger from '../../common/logger';

export class HandlerSpaceout extends HandlerBase {
  async handleMessage(context) {
    const spaceoutLib = new SpaceoutLib();
    const data = await spaceoutLib.getData();

    const crowded = data.filter((facility) => facility.band > 1);
    let msg = crowded
      .map(
        (facility) =>
          `${facility.name} : ${facility.band} (${facility.createdAt})\n`
      )
      .toString();
    const opts = {
      parse_mode: 'MarkdownV2'
    };
    msg = msg.replace('-', '\\-');
    msg = msg.replace('(', '\\(');
    msg = msg.replace(')', '\\)');
    defaultLogger.info(msg);
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerSpaceout;
