import { HandlerBase } from './handler_base';
import { BullionStarLib } from '../../lib/bullion_star';

export class HandlerPreciousMetals extends HandlerBase {
  async handleMessage(context) {
    const bullionStarLib = BullionStarLib();
    const data = await bullionStarLib.getPrices();

    let msg = `*Precious Metals Current Price:*
`;
    for (const currency of currencies) {
      const rateInfo = rates[currency];
      let rate = rateInfo.rate.toString();
      rate = rate.replace(`.`, `\\.`);
      if (rateInfo) {
        msg += `${AssetDefines.bitcoinIcon} _${currency}_ $*${rate}*
`;
      }
    }

    const opts = {
      parse_mode: 'MarkdownV2'
    };
    this.sendMessage({ context, data, opts });
  }
}

module.exports = HandlerPreciousMetals;
