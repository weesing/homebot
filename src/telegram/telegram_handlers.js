import { GoogleAssistantHelper } from '../googleassistant/assistantHelper';
import fs from 'fs';
import _ from 'lodash';
import util from 'util';
import superagent from 'superagent';
import { v4 as uuidv4 } from 'uuid';
import { cfg } from '../configLoader';
import { TelegramUtil } from './telegram_util';
import logger from '../common/logger';
import TelegramBot from 'node-telegram-bot-api';
import { TelegramValidator } from './validator';
import { BotState } from './bot_state';

export class TelegramHandlers {
  constructor({ botInstance = null }) {
    this.util = new TelegramUtil();
    if (_.isNil(botInstance) || !(botInstance instanceof TelegramBot)) {
      throw new Error('A bot instance is required');
    }
    this.botInstance = botInstance;
  }

  sendMessage({ context, msg }) {
    this.util.sendMessage({
      bot: this.botInstance,
      context,
      msg
    });
  }

  handleGeneralMessage(context) {
    logger.info(`on text ${util.inspect(context, { depth: 10 })}`);
    let validator = new TelegramValidator();
    if (!validator.validateSource(context)) {
      return;
    }
  }

  welcome(context) {
    logger.info(`Handling welcome command`);
    let welcomeString = `Welcome!\n\nThis is a private bot. This is not meant for public use, or I will have access to all your messages`;
    // ctx.reply(welcomeString);
    this.sendMessage({ context, msg: welcomeString });
    let helpString = `Available commands:\n`;
    helpString += `/broadcast - Broadcast leading message onto our Home Google Minis (e.g. broadcast wake up everyone)\n`;
    helpString += `/status - Check the status of the bot.\n`;
    helpString += `/enable or /disable - Set the reactions of the bot.\n`;
    helpString += `/deviceon or /deviceoff - Turn devices on/off through Google Assistant.`;
    // ctx.reply(helpString);
    this.sendMessage({ context, msg: helpString });
  }

  handleStatus(context) {
    logger.info(`Handling status command`);
    let reply = `Status - Home Bot is alive\nEnabled - ${
      BotState.getInstance().enabled ? 'Yes' : 'No'
    }`;
    this.sendMessage({ context, msg: reply });
  }

  handleEnable(context) {
    logger.info(`Handling bot enable command`);
    this.sendMessage({ context, msg: `Bot is now enabled` });
    BotState.getInstance().enabled = true;
  }

  handleDisable(context) {
    logger.info(`Handling bot disable command`);
    this.sendMessage({ context, msg: `Bot is now disabled` });
    BotState.getInstance().enabled = false;
  }

  validateEnable(context) {
    if (!BotState.getInstance().enabled) {
      // ctx.reply('Bot is disabled');
      this.sendMessage({ context, msg: `Bot is disabled` });
      return;
    }
    return BotState.getInstance().enabled;
  }

  extractCommandArguments(context, command) {
    let fullText = _.get(context, `text`);
    let commandIndex = fullText.toLowerCase().indexOf(command);
    if (commandIndex === 0) {
      let message = fullText.slice(command.length).trim();
      if (message.length > 0) {
        return message;
      }
    }
    return '';
  }

  assistantBroadcast(msg) {
    let assistantHelper = new GoogleAssistantHelper();
    assistantHelper.broadcast(msg);
  }

  handleBroadcast(context) {
    let cmdArgs = this.extractCommandArguments(context, '/broadcast');
    if (cmdArgs.length > 0) {
      if (!this.validateEnable(context)) {
        return;
      }
      this.sendMessage({
        context,
        msg: `Broadcasting ${cmdArgs} on Google Home Minis`
      });
      // ctx.reply(`Broadcasting ${cmdArgs} on Google Home Minis`);
      this.assistantBroadcast(cmdArgs);
    }
  }

  handleDeviceOn(context) {
    let cmdArgs = this.extractCommandArguments(context, '/deviceon');
    this.handleDeviceSwitch(context, 'Activate', cmdArgs);
  }

  handleDeviceOff(context) {
    let cmdArgs = this.extractCommandArguments(context, '/deviceoff');
    this.handleDeviceSwitch(context, 'Deactivate', cmdArgs);
  }

  handleDeviceSwitch(context, command, cmdArgs) {
    if (cmdArgs.length > 0) {
      if (!this.validateEnable(context)) {
        return;
      }
      let reply = `${command} device ${cmdArgs}`;
      // ctx.reply(reply);
      this.sendMessage({ context, msg: reply });
      logger.info(reply);
      let assistantHelper = new GoogleAssistantHelper();
      assistantHelper.device(command, cmdArgs);
    }
  }

  handleMenuRequest(ctx) {}

  async handleCamSnapshot(ctx) {
    let { protocol, host, path, download_path, username, password } = _.get(
      cfg,
      'snapshot'
    );
    let fileName = `${download_path}${uuidv4()}.jpg`;
    console.log(`Start writing to file ${fileName}`);

    let stream = fs.createWriteStream(fileName);
    console.log(`Stream opened...`);

    let creds =
      _.isNil(username) || username === '' ? '' : `${username}:${password}@`;
    let url = `${protocol}://${creds}${host}${path}`;

    console.log(`Downloading from ${protocol}://${host}${path}`);

    superagent.get(url).pipe(stream);

    stream.on('finish', () => {
      console.log(`Stream finished on ${fileName}`);
    });
    stream.on('close', () => {
      console.log(`Stream closed on ${fileName}, sending snapshot`);
      ctx
        .replyWithPhoto(
          {
            source: fileName
          },
          {
            caption: `Here's your snapshot!`
          }
        )
        .then((res) => {
          fs.unlinkSync(fileName);
        });
    });

    return;
  }
}
