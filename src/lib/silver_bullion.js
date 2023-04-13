import _ from "lodash";
import axios from "axios";
import logger from "../common/logger";
import { JSDOM } from "jsdom";

export class SilverBullionLib {
  getSellingPrice($) {
    const buyLis = $(`.price_table_tier`).toArray();
    for (const li of buyLis) {
      const innerDivs = $(li).find($("div")).toArray();
      for (const div of innerDivs) {
        if (div.innerHTML.trim() === "Tier 1") {
          const parentDiv = $(div).parent();
          const tier1Divs = $(parentDiv).find("div").toArray();
          if (tier1Divs.length >= 2) {
            const result = tier1Divs[1].innerHTML.trim();
            logger.info(`Selling at ${result}`);
            return result;
          }
        }
      }
    }
    return `<i>Unavailable</i>`;
  }

  getBuyingBackPrice($) {
    const sellLis = $(`.red-skin`).toArray();
    for (const li of sellLis) {
      const divs = $(li).find($(".sgi-price-buyback")).toArray();
      for (const div of divs) {
        const result = div.innerHTML.trim();
        logger.info(`Buying back at ${result}`);
        return result;
      }
    }
    return `<i>Unavailable</i>`;
  }

  getStock($) {
    const addItemToCartForm = $(`.sgi-item-add`).toArray();
    if (addItemToCartForm.length === 0) {
      return '0';
    }

    for(const form of addItemToCartForm) {
      const itemAvailablePs = $(form).find(`.item-available`).toArray();
      if (itemAvailablePs.length > 0) {
        const stockString = itemAvailablePs[0].innerHTML.trim();
        const regex = /^In\-Stock: (\d+) bar[s]?$/;
        if (regex.test(stockString)) {
          const result = regex.exec(stockString)[1];
          logger.info(`In stock ${result}`);
          return result;
        }
      }
    }
    return `<i>Unavailable</i>`;
  }

  async getPrices() {
    const pamp100gUrl = "https://www.silverbullion.com.sg";
    logger.info(`Collecting info from ${pamp100gUrl}`);
    const pamp100Path = "/Product/Detail/Gold_100_gram_PAMP_Suisse_cast_bar";
    const { data: htmlString } = await axios.get(
      `${pamp100gUrl}${pamp100Path}`
    );

    const dom = new JSDOM(htmlString);
    const $ = require("jquery")(dom.window);

    let pamp100gPrice = this.getSellingPrice($);
    let pamp100gBuyBack = this.getBuyingBackPrice($);
    let pamp100gStock = this.getStock($);

    return {
      pamp100gPrice,
      pamp100gBuyBack,
      pamp100gStock
    };
  }
}

module.exports = SilverBullionLib;
