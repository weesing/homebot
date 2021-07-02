import _ from 'lodash';
import { HandlerBase } from './handler_base';
import cfg from '../../configLoader';
import axios from 'axios';
import logger from '../../common/logger';

export class HandlerDoorlockReboot extends HandlerBase {
  async rebootDoorlock(context) {
    const doorlockProtocol = _.get(cfg, `doorlock.protocol`);
    const doorlockURL = _.get(cfg, `doorlock.url`);
    const doorlockPort = _.get(cfg, `doorlock.port`);
    const doorlockAPIPath = _.get(cfg, `doorlock.api_path.lock_reboot`);
    const apiKey = _.get(cfg, `doorlock.api_key`);
    await axios.post(
      `${doorlockProtocol}://${doorlockURL}:${doorlockPort}${doorlockAPIPath}`,
      null,
      { headers: { api_key: apiKey } }
    );
    await this.sendMessage({ context, msg: `Door Lock rebooted` });
  }

  async handleMessage(context) {
    return await this.rebootDoorlock(context);
  }
}

module.exports = HandlerDoorlockReboot;
