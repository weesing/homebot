import { HandlerBase } from './handler_base';
import { BTCLib } from '../../lib/btc';

export class HandlerBTCPrice extends HandlerBase {
  async handleMessage(context) {
    const btcLib = new BTCLib();
    const msg = await btcLib.getPrices();
    const opts = {
      parse_mode: 'MarkdownV2'
    };
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerBTCPrice;
