export class TelegramUtil {
  reply(ctx, msg) {
    ctx.reply(msg).catch((e) => {
      console.error(util.inspect(e), `Error caught!`);
    });
    return;
  }
}
