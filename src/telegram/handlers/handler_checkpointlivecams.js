import _ from "lodash";
import { HandlerBase } from "./handler_base";
import cfg from "../../configLoader";
import axios from "axios";
import fs from "fs";
import path from "path";
import { TelegramUtil } from "../telegram_util";
import logger from "../../common/logger";

export class HandlerCheckpointLiveCams extends HandlerBase {
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
                });
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

        await this.sendMessage({ context, msg: `Fetching Woodlands Cameras` });
        for (const url of WOODLANDS_URLS) {
            await this.retrieveAndSendFromUrl({ snapshotURL: url, context });
        }
        await this.sendMessage({ context, msg: `Fetching Tuas Cameras` });
        for (const url of TUAS_URLS) {
            await this.retrieveAndSendFromUrl({ snapshotURL: url, context });
        }
    }

    async handleMessage(context) {
        return await this.sendCheckpointLiveCams(context);
    }
}

module.exports = HandlerCheckpointLiveCams;
