import { GoogleAssistant } from './googleassistant';
import _ from 'lodash';
import { cfg } from '../configLoader';
import util from 'util';
import logger from '../common/logger';

export class GoogleAssistantHelper {
  constructor() {
    let deviceCredentials = _.get(cfg, `googleapi.devicecredentials`);
    let CREDENTIALS = {
      client_id: deviceCredentials.client_id,
      client_secret: deviceCredentials.client_secret,
      refresh_token: deviceCredentials.refresh_token,
      type: 'authorized_user'
    };
    this.assistant = new GoogleAssistant(CREDENTIALS);
  }

  async broadcast(message) {
    let result = await this.assistant.assist(`Broadcast ${message}`);
    logger.info(result);
  }

  async device(command, device) {
    const commandMsg = `${command} the ${device}`;
    logger.info(`Sending command to assistant '${commandMsg}'`);
    let result = await this.assistant.assist(commandMsg);
    logger.info(result);
  }
}
