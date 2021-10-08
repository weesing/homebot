import { HandlerBase } from './handler_base';
import { SpaceoutLib } from '../../lib/spaceout';
import defaultLogger from '../../common/logger';
import _ from 'lodash';

export class HandlerCrowd extends HandlerBase {
  async handleMessage(context) {
    const spaceoutLib = new SpaceoutLib();
    const data = await spaceoutLib.getData();

    const crowded = data.filter((facility) => facility.band > 1);
    let crowdedStr = crowded
      .map(
        (facility) =>
          `${facility.name} ${facility.band} (${facility.createdAt})`
      )
      .toString();
    const opts = {
      parse_mode: 'MarkdownV2'
    };
    defaultLogger.info(crowdedStr);
    defaultLogger.info(typeof(crowdedStr));
    crowdedStr = crowdedStr
        .replace(/\(/g, `\\(`)
        .replace(/\),/g, `\\)\n`);
    defaultLogger.info(crowdedStr);
    let msg = crowdedStr;
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerCrowd;
