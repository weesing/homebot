import axios from "axios";
import _ from "lodash";
import util from "util";
import logger from "../common/logger";

export class BullionStarLib {
  async getPrices() {
    const bullionStarUrl = `https://services.bullionstar.com`;
    const queryStr = `/spot-chart/graph/get?currency=SGD&period=TYPE_1D&width=250&height=215&timeZoneId=Asia%2FSingapore&weightUnit=g`;
    const { data: result } = await axios.get(`${bullionStarUrl}${queryStr}`);

    const pamp100gUrl = `https://services.bullionstar.com`;
    const pamp100gPath = `/product/v2/prices`;
    const pamp100gQueryStr = `currency=SGD&locationId=1&productIds=658&device=D`;
    const { data: responseData } = await axios.get(
      `${pamp100gUrl}${pamp100gPath}?${pamp100gQueryStr}`
    );
    const pamp100gData = _.first(responseData.products);

    logger.info(`${util.inspect(pamp100gData, { depth: 5 })}`);

    Object.assign(result, {
      pamp100g: {
        price:
          pamp100gData.status === `UNAVAILABLE` ||
          pamp100gData.prices.length === 0
            ? `<i>Unavailable</i>`
            : _.first(pamp100gData.prices).price,
        buying: pamp100gData.sellPrice,
        stock: pamp100gData.totalAvailable,
      },
    });

    return result;
  }
}

module.exports = BullionStarLib;
