import _ from 'lodash';
import { HandlerBase } from './handler_base';
import cfg from '../../configLoader';
import axios from 'axios';
import logger from '../../common/logger';

export class HandlerToggleDoorlock extends HandlerBase {
  async toggleDoorlock(context) {
    await this.sendMessage({ context, msg: `Toggling Door Lock...` });
    const doorlockProtocol = _.get(cfg, `doorlock.protocol`);
    const doorlockURL = _.get(cfg, `doorlock.url`);
    const doorlockPort = _.get(cfg, `doorlock.port`);
    const doorlockAPIPath = _.get(cfg, `doorlock.api_path`);
    const apiKey = _.get(cfg, `doorlock.api_key`);
    const response = await axios.post(
      `${doorlockProtocol}://${doorlockURL}:${doorlockPort}${doorlockAPIPath}`,
      null,
      { headers: { api_key: apiKey } }
    );
    const status = _.get(response, `data.status`);
    await this.sendMessage({ context, msg: `Door is now ${status}` });
    return status;
  }

  async handleMessage(context) {
    return await this.toggleDoorlock(context);
  }
}

module.exports = HandlerToggleDoorlock;
