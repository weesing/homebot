import _ from 'lodash';
import { HandlerBase } from './handler_base';
import cfg from '../../configLoader';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { TelegramUtil } from '../telegram_util';
import logger from '../../common/logger';

export class HandlerCameraSnapshot extends HandlerBase {
  async sendCameraSnapshot(context) {
    await this.sendMessage({ context, msg: `Just a minute...` });
    const snapshotURL = _.get(cfg, 'snapshot.url');
    const tempFile = './image.jpeg';
    const tempPath = path.resolve(path.join(__dirname, tempFile));
    logger.info(`Retrieving snapshot from ${snapshotURL} into ${tempPath}`);
    const imageFileWriteStream = fs.createWriteStream(tempPath);
    const response = await axios.get(snapshotURL, { responseType: 'stream' });
    response.data.pipe(imageFileWriteStream);
    await new Promise((resolve, reject) => {
      imageFileWriteStream.on('finish', async () => {
        logger.info(
          `Finished streaming snapshot image into ${tempPath}. Sending to chat...`
        );
        // finished writing file, send the image.
        const telegramUtil = new TelegramUtil();
        await telegramUtil.sendPhoto({
          bot: this.botInstance,
          context,
          caption: `Here it is :)`,
          imagePath: tempPath
        });
        resolve();
      });
      imageFileWriteStream.on('error', async () => {
        reject();
      });
    });
  }

  async handleMessage(context) {
    return await this.sendCameraSnapshot(context);
  }
}

module.exports = HandlerCameraSnapshot;
