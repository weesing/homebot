import _ from 'lodash';
import logger from '../common/logger';

export class TelegramUtil {
  static get instance() {
    if (_.isNil(TelegramUtil._instance)) {
      TelegramUtil._instance = new TelegramUtil();
    }

    return TelegramUtil._instance;
  }

  getReplyId(context) {
    let chatId;
    let type = _.get(context, 'chat.type');
    switch (type) {
      case 'private': {
        chatId = _.get(context, 'from.id');
        break;
      }
      case 'supergroup':
      case 'group': {
        chatId = _.get(context, 'chat.id');
        break;
      }
    }
    if (_.isNil(chatId)) {
      chatId = _.get(context, `message.chat.id`);
    }
    logger.info(`Retrieved ID ${chatId}`);
    return chatId;
  }

  getMessageId(context) {
    let messageId = context.messageId;
    if (!messageId && context.message) {
      messageId = context.message.message_id;
    }
    return messageId;
  }

  async sendMessage({ bot, context, msg, opts = null }) {
    const chatId = this.getReplyId(context);
    if (_.isNil(opts)) {
      return await bot.sendMessage(chatId, msg);
    }
    return await bot.sendMessage(chatId, msg, opts);
  }

  async editMarkupMessage({ bot, context, replyMarkup }) {
    const chatId = this.getReplyId(context);
    const messageId = this.getMessageId(context);
    return await bot.editMessageReplyMarkup(replyMarkup, {
      chat_id: chatId,
      message_id: messageId
    });
  }

  async sendPhoto({ bot, context, caption, imagePath }) {
    const chatId = this.getReplyId(context);
    return await bot.sendPhoto(chatId, imagePath);
  }
}
