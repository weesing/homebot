import _ from 'lodash';
import { HandlerBase } from './handler_base';
import { TotoLib } from '../../lib/toto';
import util from 'util';

export class HandlerToto extends HandlerBase {
  async handleMessage(context) {
    const totoLib = new TotoLib();
    const {
      drawDate,
      drawNumber,
      winningNumbers,
      additionalNumber,
      group1Prize,
      nextDrawDate,
      nextJackpot
    } = await totoLib.getLatestTotoResults();

    let msg = `<u><b>Toto Results</b></u>
<i>${drawDate}</i> (${drawNumber})`;

    msg += `

Winning numbers - <em>${winningNumbers.join(', ')}</em>
Additional number - <em>${additionalNumber[0]}</em>
Group 1 Prize - ${group1Prize[0] || '-'}

Next Draw - <em>${nextDrawDate} ( ${nextJackpot} )</em>

`;

    msg += `<a href="https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx">`;
    msg += `https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx`;
    msg += `</a>`;

    const opts = {
      parse_mode: 'HTML'
    };
    this.sendMessage({ context, msg, opts });
    this.sendMessage({ context, msg: "GOOD LUCK!", opts });
  }
}

module.exports = HandlerToto;
