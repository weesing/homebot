import { HandlerBase } from './handler_base';
import { SpaceoutLib } from '../../lib/spaceout';
import defaultLogger from '../../common/logger';
import _ from 'lodash';
import moment from 'moment';

export class HandlerCrowd extends HandlerBase {
  async handleMessage(context) {
    const spaceoutLib = new SpaceoutLib();
    const data = await spaceoutLib.getData();

    var crowded = _.orderBy(
      data.filter((facility) => facility.band > 1),
      ['band', 'name'],
      ['desc', 'asc']
    );
    let crowdedStr = crowded
      .map(
        (facility) =>
          `${facility.band > 2 ? '\u{1F7E4}' : '\u{1F7E2}'} ${
            facility.band > 2 ? '**' + facility.name + '**' : facility.name
          } (${moment(facility.createdAt).format('hh:mm A')})`
      )
      .toString();
    const opts = {
      parse_mode: 'MarkdownV2'
    };
    defaultLogger.info(crowdedStr);
    defaultLogger.info(typeof crowdedStr);
    crowdedStr = crowdedStr
      .replace(/\-/g, `\\-`)
      .replace(/\(/g, `\\(`)
      .replace(/\)/g, `\\)`)
      .replace(/\,/g, `\n`);
    defaultLogger.info(crowdedStr);
    let msg = `${crowdedStr}\n\n[SpaceOut](https://www.spaceout.gov.sg)`;
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerCrowd;
