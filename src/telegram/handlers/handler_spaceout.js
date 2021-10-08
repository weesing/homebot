import { HandlerBase } from './handler_base';
import { SpaceoutLib } from '../../lib/spaceout';

export class HandlerSpaceout extends HandlerBase {
  async handleMessage(context) {
    const spaceoutLib = new SpaceoutLib();
    const data = await spaceoutLib.getData();

    console.log(data);
    const crowded = data.filter(facility => facility.band > 1);
console.log(crowded);
    const msg = crowded.map(facility => `${facility.id} - ${facility.name} : ${facility.band}\n`).toString();
    const opts = {
       //parse_mode: 'MarkdownV2'
    };
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerSpaceout;
