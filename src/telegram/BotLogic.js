import _ from "lodash";
import { Telegraf } from "telegraf";
import TelegrafInlineMenu from "telegraf-inline-menu";
import { TelegramValidator } from "./TelegramValidator";
import { TelegramHandlers } from "./TelegramHandlers";
import { TelegramUtil } from "./TelegramUtil";
import { cfg } from "../configLoader";
import TelegramBot from 'node-telegram-bot-api';
import logger from '../logger';

export class BotLogic {
  static _instance;

  static getInstance() {
    if (_.isNil(BotLogic._instance)) {
      logger.log(`Creating new BotLogic instance...`);
      BotLogic._instance = new BotLogic();
    }
    return BotLogic._instance;
  }

  constructor() {    
    this.initialize();
    this.util = new TelegramUtil();
  }

  initialize() {
    logger.log("++++++++ Initializing BotLogic");
    if (this.isInitalized) {
      logger.log("Has been initialized before! Skipping");
      return;
    }

    this.initializeTelegraf();
    // this.initializeTelegramBot();
    this.initializeHandlers();
    this.initializeEvents();
    this.initializeMenu();

    this.isInitalized = true;
    logger.log("++++++++ Initialization completed");
  }

  // initializeTelegramBot() {
  //   logger.log(`  creating new Telegram Bot`);
  //   this.secret = _.get(cfg, `telegram.token`);
  //   this.bot = new TelegramBot(this.secret, { polling: true });
  //   logger.log(`  done`);
  // }

  initializeTelegraf() {
    logger.log("   creating new Telegraf...");
    this.secret = _.get(cfg, `telegram.token`);
    this.bot = new Telegraf(this.secret);
    logger.log("   done");
  }

  initializeHandlers() {
    this.handlers = new TelegramHandlers();
  }

  initializeEvents() {
    logger.log("   events registration in progress...");
    this.bot.command("help", (ctx) => this.handlers.welcome(ctx));
    this.bot.on("text", (ctx, next) => {
      let validator = new TelegramValidator();
      if (!validator.validateSource(ctx)) {
        return;
      }
      next();
    });
    this.bot.command("enable", (ctx, next) => this.handlers.handleEnable(ctx));
    this.bot.command("disable", (ctx, next) =>
      this.handlers.handleDisable(ctx)
    );
    this.bot.command("status", (ctx, next) => this.handlers.handleStatus(ctx));
    this.bot.command("broadcast", (ctx, next) =>
      this.handlers.handleBroadcast(ctx)
    );
    this.bot.command("deviceon", (ctx, next) =>
      this.handlers.handleDeviceOn(ctx)
    );
    this.bot.command("deviceoff", (ctx, next) =>
      this.handlers.handleDeviceOff(ctx)
    );
    this.bot.command(
      "snapshot",
      async (ctx, next) => await this.handlers.handleCamSnapshot(ctx)
    );
    // this.bot.on("text", (ctx, next) => this.handlers.handleText(ctx));
    this.bot.launch();
    logger.log("   done");
  }

  extractDeviceName(ctx) {
    let deviceName = _.split(ctx.match, ":");
    deviceName = deviceName[deviceName.length - 2];
    if (_.isNil(deviceName)) {
      this.util.reply(
        ctx,
        `ERROR: Unknown device name, this is ctx.match - ${ctx.match}`
      );
      // ctx.reply(`ERROR: Unknown device name, this is ctx.match - ${ctx.match}`);
      return undefined;
    }
    return deviceName;
  }

  initializeMenu(ctx) {
    const menu = new TelegrafInlineMenu((ctx) => `Hey ${ctx.from.first_name}!`);
    const onOffMenu = new TelegrafInlineMenu((ctx) => `On / Off:`);
    const broadcastMenu = new TelegrafInlineMenu((ctx) => `Choose message:`);
    const devicesMenu = new TelegrafInlineMenu((ctx) => `Choose device:`);

    menu.setCommand("m");
    menu.setCommand("menu");

    menu.submenu(`Broadcast message`, `Broadcast message`, broadcastMenu);
    let broadcastMessages = _.get(cfg, "telegram.constants.broadcast_messages");
    for (const [i, message] of broadcastMessages.entries()) {
      broadcastMenu.simpleButton(message, i.toString(), {
        doFunc: (ctx) => {
          // ctx.reply(`Broadcasting '${message}'`);
          this.util.reply(ctx, `Broadcasting '${message}'`);
          this.handlers.assistantBroadcast(message);
        },
      });
    }

    menu.submenu(`Control Devices`, `ctrldev`, devicesMenu);
    let devices = _.get(cfg, "telegram.constants.devices");
    for (const [i, device] of devices.entries()) {
      devicesMenu.submenu(device, device, onOffMenu);
    }
    onOffMenu.simpleButton("On", "on", {
      doFunc: (ctx) => {
        let deviceName = this.extractDeviceName(ctx);
        if (!_.isNil(deviceName)) {
          this.handlers.handleDeviceSwitch(ctx, "Activate", deviceName);
        }
      },
    });
    onOffMenu.simpleButton("Off", "off", {
      doFunc: (ctx) => {
        let deviceName = this.extractDeviceName(ctx);
        if (!_.isNil(deviceName)) {
          this.handlers.handleDeviceSwitch(ctx, "Deactivate", deviceName);
        }
        return true;
      },
    });

    menu.simpleButton(`Camera Snapshot`, `cam_snapshot`, {
      doFunc: (ctx) => {
        this.handlers.handleCamSnapshot(ctx);
        return true;
      },
    });

    this.bot.use(
      menu.init({
        backButtonText: `< Back`,
        mainMenuButtonText: `<< Back to Main Menu <<`,
      })
    );
  }
}
