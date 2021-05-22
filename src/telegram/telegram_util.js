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
    logger.info(`Retrieved ID ${chatId}`);
    return chatId;
  }

  sendMessage({ bot, context, msg }) {
    const chatId = this.getReplyId(context);
    bot.sendMessage(chatId, msg);
  }
}
