import { HandlerBase } from './handler_base';
import { SpaceoutLib } from '../../lib/spaceout';

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
    msg = msg.replace('-', '\-')
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerSpaceout;
