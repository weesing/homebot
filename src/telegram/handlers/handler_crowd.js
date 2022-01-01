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

    const opts = {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true
    };
    if (_.isEmpty(crowded)) {
      await this.sendMessage({
        context,
        msg: '\u{1F7E6} _No facilities are crowded/opened_',
        opts
      });
      return;
    }

    let bands = [];
    for (let facility of crowded) {
      let bandNum = parseInt(facility.band);
      if (_.isNil(bands[bandNum])) {
        bands[bandNum] = [];
      }

      bands[bandNum].push(facility);
    }

    let currBand = 1;
    const FACILITIES_LIMIT_PER_MSG = 80;
    // Process individual bands
    while (!_.isNil(bands[currBand])) {
      let thisBand = bands[currBand];
      let msgs = [];
      if (_.isEmpty(thisBand)) {
        // Do nothing
      } else {
        // Slice the facilities into FACILITIES_LIMIT_PER_MSG sizes so as not to exceed telegram message size limit
        let start = 0;
        let slice = thisBand.slice(start, start + FACILITIES_LIMIT_PER_MSG);
        while (!_.isEmpty(slice)) {
          msgs.push(
            slice
              .map(
                (facility) =>
                  `${
                    facility.band >= 2
                      ? facility.band >= 3
                        ? '\u{1f7e4}'
                        : '\u{1f534}'
                      : '\u{1f7e0}'
                  }  ${
                    facility.band >= 2
                      ? '*' + facility.name + '*'
                      : facility.name
                  } (${moment(facility.createdAt).format('hh:mmA DD/MM')})`
              )
              .toString()
          );
          start = start + FACILITIES_LIMIT_PER_MSG + 1;
          slice = thisBand.slice(start, start + FACILITIES_LIMIT_PER_MSG);
        }
      }
      // Print each of the message slices
      for (let msg of msgs) {
        let escMsg = msg
          .replace(/\-/g, `\\-`)
          .replace(/\(/g, `\\(`)
          .replace(/\)/g, `\\)`)
          .replace(/\,/g, `\n`);
        defaultLogger.info(`Printing for band ${currBand} ${escMsg}`);
        await this.sendMessage({ context, msg: escMsg, opts });
      }
      ++currBand;
    }
    let footer = `Data retrieved from \\- [SpaceOut](https://www.spaceout.gov.sg)`;
    await this.sendMessage({ context, msg: footer, opts });
  }
}

module.exports = HandlerCrowd;
