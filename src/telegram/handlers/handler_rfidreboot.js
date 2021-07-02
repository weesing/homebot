import _ from 'lodash';
import { HandlerBase } from './handler_base';
import cfg from '../../configLoader';
import axios from 'axios';
import logger from '../../common/logger';

export class HandlerRFIDReboot extends HandlerBase {
  async rebootRFID(context) {
    const doorlockProtocol = _.get(cfg, `doorlock.protocol`);
    const doorlockURL = _.get(cfg, `doorlock.url`);
    const doorlockPort = _.get(cfg, `doorlock.port`);
    const doorlockAPIPath = _.get(cfg, `doorlock.api_path.rfid_reboot`);
    const apiKey = _.get(cfg, `doorlock.api_key`);
    await axios.post(
      `${doorlockProtocol}://${doorlockURL}:${doorlockPort}${doorlockAPIPath}`,
      null,
      { headers: { api_key: apiKey } }
    );
    await this.sendMessage({ context, msg: `RFID rebooted` });
  }

  async handleMessage(context) {
    return await this.rebootRFID(context);
  }
}

module.exports = HandlerRFIDReboot;
