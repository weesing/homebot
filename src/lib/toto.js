import axios from "axios";
import { JSDOM } from "jsdom";
import logger from "../common/logger";
import util from "util";
import dayjs from "dayjs";
import _ from "lodash";
import { cfg } from "../configLoader";
import { SheetsGoogleAuth } from "../google/sheetsGoogleAuth";

export class TotoLib {
    SPREADSHEET_NAME = `HomeBot Sheet`;
    SHEET_NAME = `Sheet1`;
    ALL_DATA_RANGE = `${this.SHEET_NAME}!A:J`;
    RES_DRAW_NUMBER_INDEX = 0;
    RES_RAW_DATA_INDEX = 9;
    RAW_DATA_COL = `J`;
    WINNING_NUMBERS_RANGE = `${this.SHEET_NAME}!D:I`;

    constructor() {
        const googleServiceAccountCreds = cfg.googleapi.service_account;
        this.sheetsGoogleAuth = new SheetsGoogleAuth(googleServiceAccountCreds);

        this.initializePersistence();
    }

    async initializePersistence() {
        this.sheetsGoogleAuth
            .getSheet(this.SPREADSHEET_NAME)
            .then((existingSheet) => {
                if (_.isNil(existingSheet)) {
                    existingSheet = this.sheetsGoogleAuth.createNewSheet(
                        this.SPREADSHEET_NAME
                    );
                } else {
                    logger.info(
                        `Existing sheet ID ${existingSheet.spreadsheetId} found.`
                    );
                }
            });
    }

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
        logger.info("Get Latest Toto Results");

        const singaporePoolsUrl = `https://www.singaporepools.com.sg`;
        const queryStr = `/en/product/sr/Pages/toto_results.aspx`;
        const { data: htmlString } = await axios.get(
            `${singaporePoolsUrl}${queryStr}`
        );
        const dom = new JSDOM(htmlString);
        const targetDivId = `.divSingleDraw`;
        let $ = require("jquery")(dom.window);
        const allTableElements = $(`${targetDivId}`).find(`table`).toArray();
        let findTableTitles = {
            "Winning Numbers": `winningNumbers`,
            "Additional Number": `additionalNumber`,
            "Group 1 Prize": `group1Prize`,
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
        data.drawDate = $(`${targetDivId}`)
            .find(drawDateClass)
            .get(0).innerHTML;
        data.drawNumber = $(`${targetDivId}`)
            .find(drawNumberClass)
            .get(0).innerHTML;

        const rawDrawNumber = parseInt(_.last(_.split(data.drawNumber, " ")));
        data.rawDrawNumber = rawDrawNumber;
        data.rawDrawDateUnixMs = dayjs(data.drawDate).valueOf();

        const { data: nextDrawHtml } = await axios.get(
            `${singaporePoolsUrl}/DataFileArchive/Lottery/Output/toto_next_draw_estimate_en.html`
        );
        const nextDrawDom = new JSDOM(nextDrawHtml);
        $ = require("jquery")(nextDrawDom.window);
        const nextDrawDateClass = `.toto-draw-date`;
        data.nextDrawDate = $(nextDrawDateClass).get(0).innerHTML;
        data.nextJackpot = $(":root").find(`span`).get(0).innerHTML;

        logger.info(`data - ${util.inspect(data, { depth: 99 })}`);

        return data;
    }

    async findAllDrawNumbers(spreadsheetName) {
        return this.sheetsGoogleAuth
            .getSheet(spreadsheetName)
            .then(async (spreadsheetInfo) => {
                const allDataReadRes =
                    await this.sheetsGoogleAuth.sheets.spreadsheets.values.get({
                        spreadsheetId: spreadsheetInfo.spreadsheetId,
                        majorDimension: "COLUMNS",
                        range: this.ALL_DATA_RANGE,
                    });
                if (!_.isNil(allDataReadRes.data.values)) {
                    const drawNumbers =
                        allDataReadRes.data.values[this.RES_DRAW_NUMBER_INDEX];
                    const rawDataObjectStrs =
                        allDataReadRes.data.values[this.RES_RAW_DATA_INDEX];
                    const drawNumberRawDataMap = {};
                    for (let i = 0; i < drawNumbers.length; ++i) {
                        const drawNumber = drawNumbers[i];
                        const rawDataObjectStr = rawDataObjectStrs[i];
                        drawNumberRawDataMap[drawNumber] = {
                            rowNum: i,
                            rawDataObjectStr,
                        };
                    }
                    return drawNumberRawDataMap;
                } else {
                    return {};
                }
            });
    }

    async fetchAndInsertTopRow() {
        const results = await this.getLatestTotoResults();
        const drawNumberRawDataMap = await this.findAllDrawNumbers(
            this.SPREADSHEET_NAME
        );

        const resultDrawNumber = results.rawDrawNumber;
        const resultRawDataObjectStr = util.inspect(results, { depth: 99 });
        if (!_.isNil(drawNumberRawDataMap[resultDrawNumber])) {
            logger.info(
                `Draw number ${resultDrawNumber} was found before, inspecting raw data...`
            );
            const { rawDataObjectStr, rowNum } =
                drawNumberRawDataMap[resultDrawNumber];
            if (rawDataObjectStr !== resultRawDataObjectStr) {
                // Need to update
                const cellRange = `${this.SHEET_NAME}!${this.RAW_DATA_COL}${rowNum + 1}:${this.RAW_DATA_COL}${rowNum + 1}`;
                await this.sheetsGoogleAuth.updateCell({
                    spreadsheetName: this.SPREADSHEET_NAME,
                    cell: cellRange,
                    values: [[resultRawDataObjectStr]],
                });
                logger.info(
                    `Draw number ${resultDrawNumber}'s raw data updated to ${resultRawDataObjectStr} - ${cellRange}`
                );
            } else {
                logger.info(
                    `Draw number ${resultDrawNumber}'s raw data unchanged.`
                );
            }
        } else {
            logger.info(
                `Recording Toto stats - ${util.inspect(results, { depth: 99 })}`
            );
            await this.sheetsGoogleAuth.insertTopRow({
                spreadsheetName: this.SPREADSHEET_NAME,
                values: [
                    results.rawDrawNumber,
                    results.rawDrawDateUnixMs,
                    results.drawDate,
                    ...results.winningNumbers,
                    util.inspect(results, { depth: 99 }),
                ],
            });
        }

        logger.info(
            `Highest Aggregated numbers - ${util.inspect(
                await this.getRecommendedNumbers(),
                { depth: 99 }
            )}`
        );
    }

    async getAllPastWinningNumbers() {
        return this.sheetsGoogleAuth
            .getSheet(this.SPREADSHEET_NAME)
            .then(async (spreadsheetInfo) => {
                const readRes =
                    await this.sheetsGoogleAuth.sheets.spreadsheets.values.get({
                        spreadsheetId: spreadsheetInfo.spreadsheetId,
                        majorDimension: "ROWS",
                        range: this.WINNING_NUMBERS_RANGE,
                    });
                return _.isNil(readRes.data.values) ? [] : readRes.data.values;
            })
            .then((values) => {
                const parsedValues = [];
                for (let row of values) {
                    parsedValues.push(row.map((numStr) => parseInt(numStr)));
                }
                return parsedValues;
            });
    }

    async aggregateNumberOccurences() {
        const numberOccurences = [];
        const allWinningNumbers = await this.getAllPastWinningNumbers();
        if (allWinningNumbers.length > 0) {
            for (let winningNumberSet of allWinningNumbers) {
                for (let winningNumber of winningNumberSet) {
                    let winningNumberData = _.find(
                        numberOccurences,
                        (occurence) => occurence.number === winningNumber
                    );
                    if (_.isNil(winningNumberData)) {
                        winningNumberData = {
                            number: winningNumber,
                            occurences: 0,
                        };
                        numberOccurences.push(winningNumberData);
                    }
                    ++winningNumberData.occurences;
                }
            }
        }
        logger.info(`---- Sorting numbers...`);
        const sortedNumberOccurences = numberOccurences.sort((left, right) => {
            if (left.occurences !== right.occurences) {
                // If occurrences are not equal, then prioritize by occurrences
                return right.occurences - left.occurences;
            } else {
                // Occurrences are equal, need logic for tie breaker.

                // Try put numbers that has a 5 as precedence (e.g. 5, 15, 25, 35, etc.). Mod 10 === 5
                let leftMod = left.number % 10;
                let rightMod = right.number % 10;
                if (leftMod === 5 && rightMod === 5) {
                    return 0;
                } else if (leftMod === 5) {
                    return -1;
                } else if (rightMod === 5) {
                    return 1;
                } else {
                    // Try put numbers that is divisible by 5 as precedence (e.g. 5, 10, 15, etc.). Mod 5 === 0
                    leftMod = left.number % 5;
                    rightMod = right.number % 5;
                    if (leftMod === 0 && rightMod === 0) {
                        return 0;
                    } else if (leftMod === 0) {
                        return -1;
                    } else if (rightMod === 0) {
                        return 1;
                    } else {
                        // Special case, try prioritize 1
                        if (left.number === 1) {
                            return -1;
                        } else if (right.number === 1) {
                            return 1;
                        }
                    }
                }
            }
        });
        logger.info(
            `--- Sorted ${util.inspect(sortedNumberOccurences, { depth: 99 })}`
        );
        return sortedNumberOccurences;
    }

    async getRecommendedNumbers(count) {
        return this.aggregateNumberOccurences().then((sortedWinningNumbers) => {
            let recommendedNumbersData = sortedWinningNumbers.splice(0, 6);
            let extraNumbersData = [];
            let lastPublish = _.last(recommendedNumbersData);
            for (let nextNumber of sortedWinningNumbers) {
                if (lastPublish.occurences === nextNumber.occurences) {
                    extraNumbersData.push(nextNumber);
                }
            }
            if (extraNumbersData.length > 0) {
                extraNumbersData = [lastPublish, ...extraNumbersData];
            }
            return {
                recommendedNumbersData,
                extraNumbersData,
            };
        });
    }
}

module.exports = TotoLib;
