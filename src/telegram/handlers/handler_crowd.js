
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
    let crowdedStr = ``;
    if (_.isEmpty(crowded)) {
        crowdedStr = `\u{1F7E6}  _Everywhere is empty / not opened_`;
    } else {
        crowdedStr = crowded
          .map(
        (facility) =>
          `${facility.band > 2 ? '\u{1F7E5}' : '\u{1F7E7}'}  ${
            facility.band > 2 ? '*' + facility.name + '*' : facility.name
          } (${moment(facility.createdAt).format('hh:mm A')})`
      )
      .toString();
    }
    const opts = {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true
    };
    crowdedStr = crowdedStr
      .replace(/\-/g, `\\-`)
      .replace(/\(/g, `\\(`)
      .replace(/\)/g, `\\)`)
      .replace(/\,/g, `\n`);
    defaultLogger.info(crowdedStr);
    let msg = `${crowdedStr}\n\nData retrieved from \\- [SpaceOut](https://www.spaceout.gov.sg)`;
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerCrowd;
