import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

export class BinanceLib {
  async getPrices(symbols = ['BTCUSDC']) {
    const promises = [];
    for (const symbol of symbols) {
      promises.push(
        axios
          .get(`https://api.binance.com/api/v3/avgPrice?symbol=${symbol}`)
          .then((response) => {
            return { response, currency: symbol };
          })
      );
    }

    return await Promise.all(promises).then((results) => {
      const rates = {};
      for (const result of results) {
        const response = result.response;
        const data = response.data;
        let closeTime = moment(data.closeTime);
        const formattedDate = closeTime.format(`DD-MM-YYYY hh:mm:ss`);
        let rate = Math.round(data.price * 100) / 100;
        const currency = result.currency;
        rates[currency] = {
          rate,
          updatedTime: formattedDate
        };
      }
      return rates;
    });
  }
}
