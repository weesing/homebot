import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import axios from 'axios';
import util from 'util';
import _ from 'lodash';
import moment from 'moment';

module.exports = class HandlerBTCPrice extends HandlerBase {
  async handleMessage(context) {
    const currencies = ['USD', 'SGD'];
    const promises = [];
    for (const currency of currencies) {
      promises.push(
        axios
          .get(`https://api.coindesk.com/v1/bpi/currentprice/${currency}.json`)
          .then((response) => {
            return { response, currency };
          })
      );
    }

    await Promise.all(promises).then((results) => {
      let msg = ``;
      for (const result of results) {
        const response = result.response;
        const currency = result.currency;
        logger.info(
          `CoinDesk responded ${response.status} - ${response.statusText}`
        );
        const data = response.data;
        logger.info(
          `Response content ${typeof data} - ${util.inspect(data, {
            depth: 10,
          })}`
        );
        let updated = moment(data.updatedISO);
        const formattedDate = updated.format(`DD-MM-YYYY hh:mm:ss`);
        let rate = data.bpi[currency].rate;
        msg += `\nBTC Current price *${currency}* ${rate} (${formattedDate})`;
      }
      this.sendMessage({ context, msg });
    });
  }
};
