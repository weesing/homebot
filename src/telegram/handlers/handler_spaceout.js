import { HandlerBase } from './handler_base';
import { SpaceoutLib } from '../../lib/spaceout';

export class HandlerSpaceout extends HandlerBase {
  async handleMessage(context) {
    const spaceoutLib = new SpaceoutLib();
    const data = await spaceoutLib.getData();

    // const opts = {
    //   parse_mode: 'MarkdownV2'
    // };
    // this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerSpaceout;
