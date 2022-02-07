import axios from 'axios';
import _ from 'lodash';

export class BullionStarLib {
  async getPrices() {
    const bullionStarUrl = `https://services.bullionstar.com`;
    const queryStr = `/spot-chart/graph/get?currency=SGD&period=TYPE_1D&width=250&height=215&timeZoneId=Asia%2FSingapore&weightUnit=g`;
    const response = await axios.get(`${bullionStarUrl}${queryStr}`);
    return response.data;
  }
}

module.exports = BullionStarLib;
