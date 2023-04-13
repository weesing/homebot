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

`;

    const opts = {
      parse_mode: 'HTML'
    };
    this.sendMessage({ context, msg, opts });
    this.sendMessage({
      context,
      msg: `<u><b>Next Draw</b></u>
<em>${nextDrawDate} ----- ${nextJackpot}</em>
5555555555555555555555555555555555555
5555555555555555555555555555555555555
██555██5██5555██55█████55████████5██5
██555██5██5555██5██555██5555██5555██5
███████5██5555██5███████5555██5555██5
██555██5██5555██5██555██5555██5555555
██555██55██████55██555██5555██5555██5
5555555555555555555555555555555555555
5555555555555555555555555555555555555

             Good Luck!


<a href="https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx">
https://www.singaporepools.com.sg/en/product/sr/Pages/toto_results.aspx
</a>`,
      opts
    });
  }
}

module.exports = HandlerToto;
