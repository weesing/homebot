import _ from 'lodash';
import path from 'path';
import TelegrafInlineMenu from 'telegraf-inline-menu';
import { TelegramHandlers } from './telegram_handlers';
import { TelegramUtil } from './telegram_util';
import { cfg } from '../configLoader';
import TelegramBot from 'node-telegram-bot-api';
import logger from '../common/logger';
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
    const commands = [
      { clazzPath: `./handlers/handler_help`, cmdMatch: /\/help/ },
      { clazzPath: `./handlers/handler_status`, cmdMatch: /\/status/ },
      { clazzPath: `./handlers/handler_deviceon`, cmdMatch: /\/deviceon/ },
      { clazzPath: `./handlers/handler_deviceoff`, cmdMatch: /\/deviceoff/ },
      { clazzPath: `./handlers/handler_enable`, cmdMatch: /\/enable/ },
      { clazzPath: `./handlers/handler_disable`, cmdMatch: /\/disable/ },
      { clazzPath: `./handlers/handler_broadcast`, cmdMatch: /\/broadcast/ },
    ];
    for (const command of commands) {
      const handlerClazzPath = path.resolve(
        path.join(__dirname, command.clazzPath)
      );
      logger.info(`Instantiating handler class in file - ${handlerClazzPath}`);
      const handlerClazz = require(handlerClazzPath);
      const handlerInstance = new handlerClazz({ botInstance: this.bot });
      const handlerFn = handlerInstance.handle.bind(handlerInstance);
      let matchCommandRegex = command.cmdMatch;
      if (matchCommandRegex) {
        logger.info(
          `Binding command '${matchCommandRegex}' to ${util.inspect(
            handlerClazz
          )}`
        );
        this.bot.onText(matchCommandRegex, handlerFn);
      }
    }
    this.bot.onText(/\/m/, (context) => logger.info(`Displaying menu...`));
    this.bot.onText(/\/menu/, (context) => logger.info(`Displaying menu...`));
    // this.bot.onText(
    //   "snapshot",
    //   async (ctx, next) => await this.handlers.handleCamSnapshot(ctx)
    // );
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
        },
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
      },
    });
    onOffMenu.simpleButton('Off', 'off', {
      doFunc: (ctx) => {
        let deviceName = this.extractDeviceName(ctx);
        if (!_.isNil(deviceName)) {
          this.handlers.handleDeviceSwitch(ctx, 'Deactivate', deviceName);
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
