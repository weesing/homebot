import _ from "lodash";
import path from "path";
import { cfg } from "../configLoader";
import TelegramBot from "node-telegram-bot-api";
import logger from "../common/logger";
import util from "util";
import { exit } from "process";
import moment from "moment";

export class BotLogic {
  static _instance;
  static POLLING_RESTART_DELAY = 5000;
  static POLLING_CHECK_INTERVAL = 5000;
  static RESTART_AFTER_POLLS = 100;

  static getInstance() {
    if (_.isNil(BotLogic._instance)) {
      logger.info(`Creating new BotLogic instance...`);
      BotLogic._instance = new BotLogic();
    }
    return BotLogic._instance;
  }

  constructor() {
    this.initialize();
  }

  async initialize() {
    this.pollingCheckIntervalId = 0;
    this.pollsCheckCount = 0;
    this.pollsSinceLastRestart = 0;
    this.logicStartTime = moment().unix();

    logger.info(`++++++++ Initializing BotLogic, started at ${this.logicStartTime}`);
    if (this.isInitalized) {
      logger.info("Has been initialized before! Skipping");
      return;
    }

    await this.initializeTelegramBot();
    await this.initializeEvents();

    this.isInitalized = true;
    logger.info("++++++++ Initialization completed");
  }

  handlePollingError() {
    logger.info(`Bot is not polling anymore!!! Exiting app..`);
    exit(1);
  }

  /**
   * Polling checks are done every POLLING_CHECK_INTERVAL ms.
   */
  async checkBotPollingStatus() {
    ++this.pollsCheckCount;

    let secondsSinceLastPrint = moment().unix() - this.logicStartTime;
    if (!this.bot.isPolling()) {
      this.handlePollingError();
    } else if (this.pollsCheckCount >= BotLogic.RESTART_AFTER_POLLS) {
      // Force reinitialization after a while.
      logger.info(
        `Bot is restarting polling after ${secondsSinceLastPrint}s and ${this.pollsCheckCount} poll checks...`
      );
      // reinit
      exit(1);
    }

    if (this.pollsCheckCount % 10 === 0) {
      logger.info(
        `Polling count - ${this.pollsCheckCount}, lifetime - ${secondsSinceLastPrint}s`
      );
    }
  }

  async startPollingCheckInterval() {
    await this.stopPollingCheckInterval();

    logger.info(`Starting polling check interval.`);
    this.pollingCheckIntervalId = setInterval(async () => {
      await this.checkBotPollingStatus();
    }, BotLogic.POLLING_CHECK_INTERVAL);
  }

  async stopPollingCheckInterval() {
    if (this.pollingCheckIntervalId !== 0) {
      logger.info(`Stopping polling check interval.`);
      clearInterval(this.pollingCheckIntervalId);
      this.pollingCheckIntervalId = 0;
    }
  }

  async initializeTelegramBot() {
    logger.info(`  creating new Telegram Bot`);
    this.secret = _.get(cfg, `telegram.token`);
    this.bot = new TelegramBot(this.secret, { polling: true });
    logger.info(`  Bot created.`);
    this.startPollingCheckInterval();
    logger.info(`  done`);
  }

  async initializeEvents() {
    logger.info("   events registration in progress...");
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
        cmdMatch: /\/preciousmetals/,
      },
      { clazzPath: `./handlers/handler_toto`, cmdMatch: /\/toto/ },
      { clazzPath: `./handlers/handler_uuid`, cmdMatch: /\/uuid/ },
      { clazzPath: `./handlers/handler_menu`, cmdMatch: /\/m/ },
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
    this.bot.on("polling_error", (err) => {
      logger.error("Telegram Bot polling error occurred!");
      logger.error(err);
      this.handlePollingError();
    });
    this.bot.on("error", (err) => {
      logger.error("Telegram Bot (general) error occurred!");
      logger.error(err);
      exit(1);
    });
    logger.info("   done");
  }
}
