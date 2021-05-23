import { CoinDeskLib } from "./coin_desk";

export class BTCLib {
  async getPrices(context, sendMessage = null) {
    const coinDeskLib = new CoinDeskLib();
    const currencies = ['USD', 'SGD'];
    const rates = await coinDeskLib.getPrices(currencies);
    let msg = '';
    for (const currency of currencies) {
      const rateInfo = rates[currency];
      if (rateInfo) {
        msg += `\nBTC Current price ${currency} ${rateInfo.rate} - ${rateInfo.updatedTime}`;
      }
    }
    if (sendMessage) {
      sendMessage({ context, msg });
    }
    return rates;
  }
}