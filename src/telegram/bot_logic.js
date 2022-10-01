import _ from 'lodash';
import path from 'path';
import { cfg } from '../configLoader';
import TelegramBot from 'node-telegram-bot-api';
import logger from '../common/logger';
import util from 'util';
import { exit } from 'process';

export class BotLogic {
  static _instance;

  static POLLING_RESTART_DELAY = 5000;
  static POLLING_CHECK_INTERVAL = 5000;
  pollingCheckIntervalId = 0;

  static getInstance() {
    if (_.isNil(BotLogic._instance)) {
      logger.info(`Creating new BotLogic instance...`);
      BotLogic._instance = new BotLogic();
    }
    return BotLogic._instance;
  }

  constructor() {
    this.pollingCheckIntervalId = 0;
    this.initialize();
  }

  initialize() {
    logger.info('++++++++ Initializing BotLogic');
    if (this.isInitalized) {
      logger.info('Has been initialized before! Skipping');
      return;
    }

    this.initializeTelegramBot();
    this.initializeEvents();

    this.isInitalized = true;
    logger.info('++++++++ Initialization completed');
  }

  handlePollingError() {
    if (this.pollingCheckIntervalId > 0) {
      clearInterval(this.pollingCheckIntervalId);
      this.pollingCheckIntervalId = 0;
    }
    log.info(
      `Bot is not polling, attempting to restart polling in ${
        BotLogic.POLLING_RESTART_DELAY / 1000
      }s...`
    );
    setTimeout(() => {
      log.info(`Attempting to restart polling now...`);
      this.bot.startPolling({ restart: true });
      this.startPollingCheckInterval();
      log.info(`Bot polling started`);
    }, BotLogic.POLLING_RESTART_DELAY);
  }

  checkBotPollingStatus() {
    if (!this.bot.isPolling()) {
      this.handlePollingError();
    } else {
      log.info(`Bot is still polling...`);
    }
  }

  startPollingCheckInterval() {
    this.pollingCheckIntervalId = setInterval(() => {
      this.checkBotPollingStatus();
    }, BotLogic.POLLING_CHECK_INTERVAL);
  }

  initializeTelegramBot() {
    logger.info(`  creating new Telegram Bot`);
    this.secret = _.get(cfg, `telegram.token`);
    this.bot = new TelegramBot(this.secret, { polling: true });
    this.startPollingCheckInterval();
    logger.info(`  done`);
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
      { clazzPath: `./handlers/handler_btcprice`, cmdMatch: /\/btcprice/ },
      {
        clazzPath: `./handlers/handler_precious_metals`,
        cmdMatch: /\/preciousmetals/
      },
      { clazzPath: `./handlers/handler_uuid`, cmdMatch: /\/uuid/ },
      { clazzPath: `./handlers/handler_menu`, cmdMatch: /\/m/ }
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
    this.bot.on('polling_error', (err) => {
      logger.error('Telegram Bot polling error occurred!');
      logger.error(err);
      // exit(1);
    });
    this.bot.on('error', (err) => {
      logger.error('Telegram Bot (general) error occurred!');
      logger.error(err);
      exit(1);
    });
    logger.info('   done');
  }
}
