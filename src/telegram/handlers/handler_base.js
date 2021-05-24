import _ from 'lodash';
import TelegramBot from 'node-telegram-bot-api';
import { BotState } from '../bot_state';
import { TelegramUtil } from '../telegram_util';
import { TelegramValidator } from '../validator';
import { GoogleAssistantHelper } from '../../googleassistant/assistantHelper';
import logger from '../../common/logger';
import util from 'util';

export class HandlerBase {
  constructor({ botInstance }) {
    if (_.isNil(botInstance) || !(botInstance instanceof TelegramBot)) {
      throw new Error(`botInstance is required and must be 'TelegramBot' type`);
    }
    this.botInstance = botInstance;
  }

  sendMessage({ context, msg, opts }) {
    TelegramUtil.instance.sendMessage({
      bot: this.botInstance,
      context,
      msg,
      opts
    });
  }

  editMarkupMessage({ context, replyMarkup }) {
    TelegramUtil.instance.editMarkupMessage({
      bot: this.botInstance,
      context,
      replyMarkup
    });
  }

  async handleMessage(context) {
    // to be implemented by children
  }

  async handle(context) {
    logger.info(`received message: ${util.inspect(context, { depth: 10 })}`);
    let validator = new TelegramValidator();
    const isValid = validator.validateSource(context);
    if (!isValid) {
      logger.info(`Unauthorized usage of bot.`);
      return;
    }
    logger.info(`Validated source, handling message...`);
    return await this.handleMessage(context);
  }

  validateEnable(context) {
    if (!BotState.getInstance().enabled) {
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
}
