import _ from "lodash";
import { HandlerBase } from "./handler_base.js";
import cfg from "../../configLoader.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { TelegramUtil } from "../telegram_util.js";
import logger from "../../common/logger.js";
import TrafficAnalyzerLib from "../../lib/traffic_analyzer.js";

const DELETE_AFTER_MS = 30000;
const WOODLANDS_PROMPT = `The still image provided is a snapshot showing the traffic density towards Johor and towards Woodlands. 
        
Please give your analysis of the traffic density in 3 levels: "light", "medium" and "dense" for the direction towards Johor and towards Woodlands.

Your final result should be in JSON form such as: {"towards-johor":"dense","towards-woodlands":"light"}

Your final response should ONLY contain the JSON.`;
const TUAS_PROMPT = `The still image provided is a snapshot showing the traffic density towards Johor and towards Tuas. 
        
Please give your analysis of the traffic density in 3 levels: "light", "medium" and "dense" for the direction towards Johor and towards Tuas.

Your final result should be in JSON form such as: {"towards-johor":"dense","towards-tuas":"light"}

Your final response should ONLY contain the JSON.`;

export class HandlerCheckpointLiveCams extends HandlerBase {
    constructor({ botInstance }) {
        super({ botInstance });
        this.trafficAnalyzer = new TrafficAnalyzerLib();
    }

    async retrieveAndSendFromUrl({ urlInfo, context, analyzerPrompt }) {
        const { id, url, analyze } = urlInfo;
        const fileName = `${id}.png`;
        const filePath = path.resolve(path.join(__dirname, fileName));
        logger.info(`Retrieving snapshot from ${url} into ${filePath}`);
        const imageFileWriteStream = fs.createWriteStream(filePath);
        const response = await axios.get(url, {
            responseType: "stream",
        });
        response.data.pipe(imageFileWriteStream);
        await new Promise((resolve, reject) => {
            imageFileWriteStream.on("finish", async () => {
                logger.info(
                    `Finished streaming snapshot image into ${filePath}. Sending to chat...`
                );
                // finished writing file, send the image.
                const telegramUtil = new TelegramUtil();
                await telegramUtil.sendPhoto({
                    bot: this.botInstance,
                    context,
                    caption: `${url}`,
                    imagePath: filePath,
                    deleteAfterMs: DELETE_AFTER_MS,
                });
                if (analyze) {
                    const response = await this.trafficAnalyzer.getAnalysis({
                        user_prompt: analyzerPrompt,
                        trafficSnapshotFilePath: filePath,
                    });
                    console.log(response);
                }
                resolve();
            });
            imageFileWriteStream.on("error", async () => {
                reject();
            });
        });
    }

    async sendCheckpointLiveCams(context) {
        const LIVE_CAMERA_CONFIG_PATH = "lta.live-camera";

        const WOODLANDS_KEY = "woodlands.urls";
        const TUAS_KEY = "tuas.urls";

        const WOODLANDS_URLS = _.get(
            cfg,
            `${LIVE_CAMERA_CONFIG_PATH}.${WOODLANDS_KEY}`
        );
        const TUAS_URLS = _.get(cfg, `${LIVE_CAMERA_CONFIG_PATH}.${TUAS_KEY}`);

        await this.sendMessage({
            context,
            msg: `[Fetching Woodlands Cameras...]`,
            deleteAfterMs: DELETE_AFTER_MS,
        });
        for (const urlInfo of WOODLANDS_URLS) {
            await this.retrieveAndSendFromUrl({
                urlInfo,
                context,
                analyzerPrompt: WOODLANDS_PROMPT,
            });
        }
        await this.sendMessage({
            context,
            msg: `[Fetching Tuas Cameras...]`,
            deleteAfterMs: DELETE_AFTER_MS,
        });
        for (const urlInfo of TUAS_URLS) {
            await this.retrieveAndSendFromUrl({
                urlInfo,
                context,
                analyzerPrompt: TUAS_PROMPT,
            });
        }
        await this.sendMessage({
            context,
            msg: `Deleting messages after ${DELETE_AFTER_MS / 1000} secs...`,
            deleteAfterMs: DELETE_AFTER_MS,
        });
    }

    async handleMessage(context) {
        return await this.sendCheckpointLiveCams(context);
    }
}

module.exports = HandlerCheckpointLiveCams;
