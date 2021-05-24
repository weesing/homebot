import { HandlerBase } from './handler_base';
import { BTCLib } from '../../lib/btc';

export class HandlerBTCPrice extends HandlerBase {
  async handleMessage(context) {
    const btcLib = new BTCLib();
    btcLib.getPrices(context, this.sendMessage.bind(this));
  }
};

module.exports = HandlerBTCPrice;
