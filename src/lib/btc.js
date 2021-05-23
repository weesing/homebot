import { CoinDeskLib } from './coin_desk';

export class BTCLib {
  async getPrices(context, sendMessage = null) {
    const coinDeskLib = new CoinDeskLib();
    const currencies = ['USD', 'SGD'];
    const rates = await coinDeskLib.getPrices(currencies);
    let msg = `*BTC Current Price:*
`;
    for (const currency of currencies) {
      const rateInfo = rates[currency];
      let rate = rateInfo.rate.toString();
      rate = rate.replace(`.`, `\\.`);
      console.log(rate);
      if (rateInfo) {
        const emoji = '\u{20BF}';
        msg += `${emoji} _${currency}_ $*${rate}*
`;
      }
    }
    if (sendMessage) {
      const opts = {
        parse_mode: 'MarkdownV2'
      }
      sendMessage({ context, msg, opts });
    }
    return rates;
  }
}
