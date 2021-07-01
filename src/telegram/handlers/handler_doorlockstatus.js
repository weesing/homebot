import _ from 'lodash';
import { HandlerBase } from './handler_base';
import cfg from '../../configLoader';
import axios from 'axios';
import logger from '../../common/logger';

export class HandlerDoorlockStatus extends HandlerBase {
  async getDoorlockStatus(context) {
    const doorlockProtocol = _.get(cfg, `doorlock.protocol`);
    const doorlockURL = _.get(cfg, `doorlock.url`);
    const doorlockPort = _.get(cfg, `doorlock.port`);
    const doorlockAPIPath = _.get(cfg, `doorlock.api_path.status`);
    const apiKey = _.get(cfg, `doorlock.api_key`);
    const response = await axios.get(
      `${doorlockProtocol}://${doorlockURL}:${doorlockPort}${doorlockAPIPath}`,
      { headers: { api_key: apiKey } }
    );
    const status = _.get(response, `data.status`);
    await this.sendMessage({ context, msg: `Door is ${status}` });
    return status;
  }

  async handleMessage(context) {
    return await this.getDoorlockStatus(context);
  }
}

module.exports = HandlerDoorlockStatus;
