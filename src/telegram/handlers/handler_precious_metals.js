import _ from 'lodash';
import { HandlerBase } from './handler_base';
import { BullionStarLib } from '../../lib/bullion_star';
import { AssetDefines } from '../../lib/asset_defines';

export class HandlerPreciousMetals extends HandlerBase {
  async handleMessage(context) {
    const elements = [
      { key: 'XAU', name: 'Gold', icon: `${AssetDefines.goldIcon}` },
      { key: 'XAG', name: 'Silver', icon: `${AssetDefines.silverIcon}` },
      { key: 'XPT', name: 'Platinum', icon: `${AssetDefines.platinumIcon}` },
      { key: 'XPD', name: 'Palladium', icon: `${AssetDefines.palladiumIcon}` }
    ];

    const bullionStarLib = new BullionStarLib();
    const data = await bullionStarLib.getPrices();

    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SGD'
    });

    /*
      Sample data
      spotPrices": {
        "XAU": {
          "value": "SGD 78.34",
          "percent": "+0.18%",
          "signum": 1
        },
        "XPT": {
          "value": "SGD 43.90",
          "percent": "-1.28%",
          "signum": -1
        },
        "XPD": {
          "value": "SGD 97.20",
          "percent": "-1.89%",
          "signum": -1
        },
        "XAG": {
          "value": "SGD 0.98",
          "percent": "+1.03%",
          "signum": 1
        }
      }
     */
    let msg = `<u><b>Precious Metals Prices (100g)</b></u>

`;
    for (const element of elements) {
      const elemData = data.spotPrices[element.key];
      let elemValue = _.round(parseFloat(elemData.value.split(` `)[1]), 2);
      elemValue = formatter.format(elemValue * 100);
      let line = `${element.icon} ${element.name} <b>${elemValue}</b>
`;
      msg += line;
    }

    const pampData = data.pamp100g;
    msg += `
<u>100g PAMP Gold Cast Bar</u>
Price - ${pampData.price}
Buying - ${pampData.buying}
Stock - ${pampData.stock}
`;

    msg += `
<i>Last Updated on: ${data.lastUpdateDate}</i> from <a href="https://bullionstar.com">https://www.bullionstar.com</a>`;

    const opts = {
      parse_mode: 'HTML'
    };
    this.sendMessage({ context, msg, opts });
  }
}

module.exports = HandlerPreciousMetals;
