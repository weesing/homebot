import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

export class CoinDeskLib {
  async getPrices(currencies = ['USD', 'SGD']) {
    const promises = [];
    for (const currency of currencies) {
      promises.push(
        axios
          .get(`https://api.coindesk.com/v1/bpi/currentprice/${currency}.json`)
          .then((response) => {
            return { response, currency };
          })
      ); //test
    }

    return await Promise.all(promises).then((results) => {
      const rates = {};
      for (const result of results) {
        const response = result.response;
        const currency = result.currency;
        const data = response.data;
        let updatedTime = moment(data.updatedISO);
        const formattedDate = updatedTime.format(`DD-MM-YYYY hh:mm:ss`);
        let rate = data.bpi[currency].rate;
        rates[currency] = {
          rate,
          updatedTime: formattedDate
        };
      }
      return rates;
    });
  }
}
