import _ from 'lodash';
import logger from '../common/logger';

export class TelegramUtil {
  reply(ctx, msg) {
    ctx.reply(msg).catch((e) => {
      console.error(util.inspect(e), `Error caught!`);
    });
    return;
  }

  getReplyId(context) {
    let chatId;
    let type = _.get(context, 'chat.type');
    switch (type) {
      case 'private': {
        chatId = _.get(context, 'from.id');
        break;
      }
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
}
