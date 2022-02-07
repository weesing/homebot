import axios from 'axios';
import _ from 'lodash';
import { AssetDefines } from './asset_defines';

export class BTCLib {
  async getPrices() {
    const elements = [
      { key: 'XAU', name: 'Gold' },
      { key: 'XPT', name: 'Platinum' },
      { key: 'XPD', name: 'Palladium' },
      { key: 'XAG', name: 'Silver' }
    ];

    const msg = axios
      .get(
        `https://services.bullionstar.com/spot-chart/graph/get?currency=SGD&period=TYPE_1D&width=250&height=215&timeZoneId=Asia%2FSingapore&weightUnit=g`
      )
      .then((response) => {
        let result = `*Precious Metals Prices:*
        `;
        for (const element of elements) {
          const elemValue = response.data[element.key].value;
          result += `${element.name} - SGD$${elemValue * 100}
          `;
        }
        result = result.replace(`.`, `\\.`);
        return result;
      });
    return msg;
  }
}
