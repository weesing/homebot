import _ from 'lodash';
import { Telegraf } from 'telegraf';
import TelegrafInlineMenu from 'telegraf-inline-menu';
import { TelegramValidator } from './TelegramValidator';
import { TelegramHandlers } from './TelegramHandlers';
import { TelegramUtil } from './TelegramUtil';
import { cfg } from '../configLoader';
import TelegramBot from 'node-telegram-bot-api';
import logger from '../logger';
import util from 'util';

export class BotLogic {
  static _instance;

  static getInstance() {
    if (_.isNil(BotLogic._instance)) {
      logger.info(`Creating new BotLogic instance...`);
      BotLogic._instance = new BotLogic();
    }
    return BotLogic._instance;
  }

  constructor() {
    this.initialize();
    this.util = new TelegramUtil();
  }

  initialize() {
    logger.info('++++++++ Initializing BotLogic');
    if (this.isInitalized) {
      logger.info('Has been initialized before! Skipping');
      return;
    }

    this.initializeTelegramBot();
    this.initializeHandlers();
    this.initializeEvents();
    // this.initializeMenu();

    this.isInitalized = true;
    logger.info('++++++++ Initialization completed');
  }

  initializeTelegramBot() {
    logger.info(`  creating new Telegram Bot`);
    this.secret = _.get(cfg, `telegram.token`);
    this.bot = new TelegramBot(this.secret, { polling: true });
    logger.info(`  done`);
  }

  initializeHandlers() {
    this.handlers = new TelegramHandlers({ botInstance: this.bot });
  }

  initializeEvents() {
    logger.info('   events registration in progress...');
    this.bot.on('message', (context) => {
      logger.info(`on text ${util.inspect(context, { depth: 10 })}`);
      logger.info(arguments);
      let validator = new TelegramValidator();
      if (!validator.validateSource(context)) {
        return;
      }
    });
    this.bot.onText(/\/help/, (context) => this.handlers.welcome(context));
    this.bot.onText(/\/enable/, (context) =>
      this.handlers.handleEnable(context)
    );
    this.bot.onText(/\/disable/, (context) =>
      this.handlers.handleDisable(context)
    );
    this.bot.onText(/\/status/, (context) =>
      this.handlers.handleStatus(context)
    );
    this.bot.onText(/\/broadcast/, (context) =>
      this.handlers.handleBroadcast(context)
    );
    this.bot.onText(/\/deviceon/, (context) =>
      this.handlers.handleDeviceOn(context)
    );
    this.bot.onText(/\/deviceoff/, (context) =>
      this.handlers.handleDeviceOff(context)
    );
    // this.bot.onText(
    //   "snapshot",
    //   async (ctx, next) => await this.handlers.handleCamSnapshot(ctx)
    // );
    // this.bot.on("text", (ctx, next) => this.handlers.handleText(ctx));
    this.bot.on('polling_error', (err) => logger.error(err));
    logger.info('   done');
  }

  extractDeviceName(ctx) {
    let deviceName = _.split(ctx.match, ':');
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

    menu.setCommand('m');
    menu.setCommand('menu');

    menu.submenu(`Broadcast message`, `Broadcast message`, broadcastMenu);
    let broadcastMessages = _.get(cfg, 'telegram.constants.broadcast_messages');
    for (const [i, message] of broadcastMessages.entries()) {
      broadcastMenu.simpleButton(message, i.toString(), {
        doFunc: (ctx) => {
          // ctx.reply(`Broadcasting '${message}'`);
          this.util.reply(ctx, `Broadcasting '${message}'`);
          this.handlers.assistantBroadcast(message);
        }
      });
    }

    menu.submenu(`Control Devices`, `ctrldev`, devicesMenu);
    let devices = _.get(cfg, 'telegram.constants.devices');
    for (const [i, device] of devices.entries()) {
      devicesMenu.submenu(device, device, onOffMenu);
    }
    onOffMenu.simpleButton('On', 'on', {
      doFunc: (ctx) => {
        let deviceName = this.extractDeviceName(ctx);
        if (!_.isNil(deviceName)) {
          this.handlers.handleDeviceSwitch(ctx, 'Activate', deviceName);
        }
      }
    });
    onOffMenu.simpleButton('Off', 'off', {
      doFunc: (ctx) => {
        let deviceName = this.extractDeviceName(ctx);
        if (!_.isNil(deviceName)) {
          this.handlers.handleDeviceSwitch(ctx, 'Deactivate', deviceName);
        }
        return true;
      }
    });

    menu.simpleButton(`Camera Snapshot`, `cam_snapshot`, {
      doFunc: (ctx) => {
        this.handlers.handleCamSnapshot(ctx);
        return true;
      }
    });

    this.bot.use(
      menu.init({
        backButtonText: `< Back`,
        mainMenuButtonText: `<< Back to Main Menu <<`
      })
    );
  }
}
