import axios from 'axios';
import { JSDOM } from 'jsdom';
import logger from '../common/logger';
import util from 'util';

export class TotoLib {
  extractTdValues($, tableElem) {
    let results = [];
    const tdElements = $(tableElem).find(`td`).toArray();
    for (const tdElem of tdElements) {
      results.push(tdElem.innerHTML.trim());
    }
    logger.info(results);
    return results;
  }

  async getLatestTotoResults() {
    logger.info('Get Latest Toto Results');

    const singaporePoolsUrl = `https://www.singaporepools.com.sg`;
    const queryStr = `/en/product/sr/Pages/toto_results.aspx`;
    const { data: htmlString } = await axios.get(
      `${singaporePoolsUrl}${queryStr}`
    );
    const dom = new JSDOM(htmlString);
    const targetDivId = `.divSingleDraw`;
    const $ = require('jquery')(dom.window);
    const allTableElements = $(`${targetDivId}`).find(`table`).toArray();
    let findTableTitles = {
      'Winning Numbers': `winningNumbers`,
      'Additional Number': `additionalNumber`,
      'Group 1 Prize': `group1Prize`
    };
    let titles = Object.keys(findTableTitles);
    let data = {};
    for (const tableElem of allTableElements) {
      const thElements = $(tableElem).find(`th`).toArray();
      for (const thElem of thElements) {
        const titleIndex = titles.indexOf(thElem.innerHTML.trim());
        if (titleIndex >= 0) {
          const title = titles[titleIndex];
          logger.info(`FOUND ${title}`);
          const objectKey = findTableTitles[title];
          data[objectKey] = this.extractTdValues($, tableElem);
        }
      }
    }
    const drawDateClass = `.drawDate`;
    const drawNumberClass = `.drawNumber`;
    data.drawDate = $(`${targetDivId}`).find(drawDateClass).get(0).innerHTML;
    data.drawNumber = $(`${targetDivId}`)
      .find(drawNumberClass)
      .get(0).innerHTML;
    logger.info(`data - ${util.inspect(data, { depth: 99 })}`);

    return data;
  }
}

module.exports = TotoLib;
