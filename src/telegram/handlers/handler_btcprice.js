import { HandlerBase } from './handler_base';
import { BTCLib } from '../../lib/btc';

module.exports = class HandlerBTCPrice extends HandlerBase {
  async handleMessage(context) {
    const btcLib = new BTCLib();
    btcLib.getPrices(context, this.sendMessage.bind(this));
  }
};
