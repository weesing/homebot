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

export class HandlerCheckpointLiveCams extends HandlerBase {
    constructor({ botInstance }) {
        super({ botInstance });
        this.trafficAnalyzer = new TrafficAnalyzerLib();
    }

    async retrieveAndSendFromUrl({ snapshotURL, context }) {
        const fileName = `temp.png`;
        const filePath = path.resolve(path.join(__dirname, fileName));
        logger.info(`Retrieving snapshot from ${snapshotURL} into ${filePath}`);
        const imageFileWriteStream = fs.createWriteStream(filePath);
        const response = await axios.get(snapshotURL, {
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
                    caption: `${snapshotURL}`,
                    imagePath: filePath,
                    deleteAfterMs: DELETE_AFTER_MS,
                });
                const prompt = `You are a traffic analyst that assist in evaluating traffic conditions. 

                The still image provided is a snapshot showing the traffic density towards the causeway and towards BKE. 
                
                Please give your analysis of the traffic density in 3 levels: "light", "medium" and "dense" for the direction towards johor and from johor.
                
                Your final result should be in JSON form such as: {"towards-causeway":"dense","towards-bke":"light"}
                
                Your final response should ONLY contain the JSON.`;
                await this.trafficAnalyzer.getAnalysis({user_prompt: prompt, trafficSnapshotFilePath: filePath});
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
        for (const url of WOODLANDS_URLS) {
            await this.retrieveAndSendFromUrl({ snapshotURL: url, context });
        }
        await this.sendMessage({
            context,
            msg: `[Fetching Tuas Cameras...]`,
            deleteAfterMs: DELETE_AFTER_MS,
        });
        for (const url of TUAS_URLS) {
            await this.retrieveAndSendFromUrl({ snapshotURL: url, context });
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
