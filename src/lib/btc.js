import { BinanceLib } from './binance';
import { AssetDefines } from './asset_defines';

export class BTCLib {
  async getPrices() {
    const currencies = ['BTCUSDC'];
    const binanceLib = new BinanceLib();
    const rates = await binanceLib.getPrices(currencies);
    let msg = `
█████▀▀▀▀▀█████
██▀──▄─▄────▀██
█───▀█▀▀▀▀▄───█
█────█▄▄▄▄▀───█
█────█────█───█
██▄─▀▀█▀█▀──▄██
█████▄▄▄▄▄█████

*BTC Current Price:*
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
    return msg;
  }
}
