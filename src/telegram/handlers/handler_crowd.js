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
      data.filter((facility) => facility.band > 0),
      ['band', 'name'],
      ['desc', 'asc']
    );
    let bands = [];
    for (let facility of crowded) {
      let bandNum = parseInt(facility.band);
      if (_.isNil(bands[bandNum])) {
        bands[bandNum] = [];
      }

      bands[bandNum].push(facility);
    }

    const opts = {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true
    };
    let crowdedStr = ``;
    let currBand = 1;
    while (!_.isNil(bands[currBand])) {
      let thisBand = bands[currBand];
      if (_.isEmpty(thisBand)) {
        crowdedStr = `\u{1F7E6}  _Everywhere is empty / not opened_`;
      } else {
        crowdedStr = thisBand
          .map(
            (facility) =>
              `${
                facility.band >= 2
                  ? facility.band >= 3
                    ? '\u{1f7e4}'
                    : '\u{1f534}'
                  : '\u{1f7e0}'
              }  ${
                facility.band >= 2 ? '*' + facility.name + '*' : facility.name
              } (${moment(facility.createdAt).format('hh:mm A')})`
          )
          .toString();
      }
      crowdedStr = crowdedStr
        .replace(/\-/g, `\\-`)
        .replace(/\(/g, `\\(`)
        .replace(/\)/g, `\\)`)
        .replace(/\,/g, `\n`);
      defaultLogger.info(crowdedStr);
      let msg = `BAND ${currBand}\n\n${crowdedStr}`;
      await this.sendMessage({ context, msg, opts });
      ++currBand;
    }
    let footer = `Data retrieved from \\- [SpaceOut](https://www.spaceout.gov.sg)`;
    await this.sendMessage({ context, msg: footer, opts });
  }
}

module.exports = HandlerCrowd;
