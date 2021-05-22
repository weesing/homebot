import { HandlerBase } from './handler_base';
import logger from '../../common/logger';

module.exports = class HandlerHelp extends HandlerBase {
  constructor(args) {
    super(args);
  }

  handleMessage(context) {
    logger.info(`Handling welcome command`);
    let welcomeString = `Welcome!\n\nThis is a private bot. This is not meant for public use, or I will have access to all your messages`;
    this.sendMessage({ context, msg: welcomeString });
    let helpString = `Available commands:\n`;
    helpString += `/broadcast - Broadcast leading message onto our Home Google Minis (e.g. broadcast wake up everyone)\n`;
    helpString += `/status - Check the status of the bot.\n`;
    helpString += `/enable or /disable - Set the reactions of the bot.\n`;
    helpString += `/deviceon or /deviceoff - Turn devices on/off through Google Assistant.`;
    this.sendMessage({ context, msg: helpString });
  }
};
