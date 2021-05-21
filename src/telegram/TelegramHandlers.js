import { GoogleAssistantHelper } from "../googleassistant/assistantHelper";
import fs from "fs";
import _ from "lodash";
import superagent from "superagent";
import { v4 as uuidv4 } from "uuid";
import { cfg } from "../configLoader";
import { TelegramUtil } from "./TelegramUtil";

export class TelegramHandlers {
  constructor() {
    this.enabled = true;
    this.util = new TelegramUtil();
  }

  welcome(ctx) {
    let welcomeString = `Welcome!\n\nThis is a private bot. This is not meant for public use, or I will have access to all your messages`;
    // ctx.reply(welcomeString);
    this.util.reply(ctx, welcomString);
    let helpString = `1) Use the word 'broadcast' to broadcast stuff onto our Home Google Minis (e.g. broadcast wake up everyone)\n`;
    helpString += `2) Use the command '/status' to check the status of the bot.\n`;
    helpString += `3) Use the commands '/enable' or '/disable' to set the reactions of the bot.\n`;
    helpString += `4) Use the commands '/deviceon' or /deviceoff' to turn devices on/off through Google Assistant.`;
    // ctx.reply(helpString);
    this.util.reply(ctx, helpString);
  }

  handleStatus(ctx) {
    let reply = `Status - Home Bot is alive\nEnabled - ${
      this.enabled ? "Yes" : "No"
    }`;
    // ctx.reply(reply);
    this.util.reply(ctx, reply);
  }

  handleEnable(ctx) {
    console.log(`Bot is now enabled`);
    // ctx.reply(`Bot is now enabled`);
    this.util.reply(ctx, `Bot is now enabled`);
    this.enabled = true;
  }

  handleDisable(ctx) {
    console.log(`Bot is now disabled`);
    // ctx.reply(`Bot is now disabled`);
    this.util.reply(ctx, `Bot is now disabled`);
    this.enabled = false;
  }

  validateEnable(ctx) {
    if (!this.enabled) {
      // ctx.reply('Bot is disabled');
      this.util.reply(ctx, `Bot is disabled`);
      return;
    }
    return this.enabled;
  }

  extractCommandArguments(ctx, command) {
    let fullText = _.get(ctx, "update.message.text");
    let commandIndex = fullText.toLowerCase().indexOf(command);
    if (commandIndex === 0) {
      let message = fullText.slice(command.length).trim();
      if (message.length > 0) {
        return message;
      }
    }
    return "";
  }

  assistantBroadcast(msg) {
    let assistantHelper = new GoogleAssistantHelper();
    assistantHelper.broadcast(msg);
  }

  handleBroadcast(ctx) {
    let cmdArgs = this.extractCommandArguments(ctx, "/broadcast");
    if (cmdArgs.length > 0) {
      if (!this.validateEnable(ctx)) {
        return;
      }
      this.util.reply(ctx, `Broadcasting ${cmdArgs} on Google Home Minis`);
      // ctx.reply(`Broadcasting ${cmdArgs} on Google Home Minis`);
      this.assistantBroadcast(cmdArgs);
    }
  }

  handleDeviceOn(ctx) {
    let cmdArgs = this.extractCommandArguments(ctx, "/deviceon");
    this.handleDeviceSwitch(ctx, "Activate", cmdArgs);
  }

  handleDeviceOff(ctx) {
    let cmdArgs = this.extractCommandArguments(ctx, "/deviceoff");
    this.handleDeviceSwitch(ctx, "Deactivate", cmdArgs);
  }

  handleDeviceSwitch(ctx, command, cmdArgs) {
    if (cmdArgs.length > 0) {
      if (!this.validateEnable(ctx)) {
        return;
      }
      let reply = `${command} device ${cmdArgs}`;
      // ctx.reply(reply);
      this.util.reply(ctx, reply);
      console.log(reply);
      let assistantHelper = new GoogleAssistantHelper();
      assistantHelper.device(command, cmdArgs);
    }
  }

  handleMenuRequest(ctx) {}

  async handleCamSnapshot(ctx) {
    let { protocol, host, path, download_path, username, password } = _.get(
      cfg,
      "snapshot"
    );
    let fileName = `${download_path}${uuidv4()}.jpg`;
    console.log(`Start writing to file ${fileName}`);

    let stream = fs.createWriteStream(fileName);
    console.log(`Stream opened...`);

    let creds =
      _.isNil(username) || username === "" ? "" : `${username}:${password}@`;
    let url = `${protocol}://${creds}${host}${path}`;

    console.log(`Downloading from ${protocol}://${host}${path}`);

    superagent.get(url).pipe(stream);

    stream.on("finish", () => {
      console.log(`Stream finished on ${fileName}`);
    });
    stream.on("close", () => {
      console.log(`Stream closed on ${fileName}, sending snapshot`);
      ctx
        .replyWithPhoto(
          {
            source: fileName,
          },
          {
            caption: `Here's your snapshot!`,
          }
        )
        .then((res) => {
          fs.unlinkSync(fileName);
        });
    });

    return;
  }
}
