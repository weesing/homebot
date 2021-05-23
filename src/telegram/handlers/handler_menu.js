import _ from 'lodash';
import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { cfg } from '../../configLoader';
import { GoogleAssistantHelper } from '../../googleassistant/assistantHelper';
import { CoinDeskLib } from '../../lib/coin_desk';
import { BTCLib } from '../../lib/btc';

module.exports = class HandlerBroadcast extends HandlerBase {
  constructor(args) {
    super(args);
    const { botInstance } = args;
    if (botInstance) {
      logger.info(`Initializing menu callback...`);
      this.initializeMenuCallback(botInstance);
      logger.info(`Menu callback initialized.`);
    }
    this.broadcastMessages = _.get(
      cfg,
      'telegram.constants.broadcast_messages'
    );
    logger.info(this.broadcastMessages);
    this.devices = _.get(cfg, 'telegram.constants.devices');
    logger.info(this.devices);
  }

  handleMenuCallback(context) {
    const data = JSON.parse(context.data);
    const command = data.command;
    logger.info(`Processing command ${command}`);
    switch (command) {
      case `broadcast`: {
        this.handleBroadcast(context);
        break;
      }
      case `broadcast_message`: {
        const messageIndex = parseInt(data.message);
        const message = this.broadcastMessages[messageIndex];
        this.assistantBroadcast(message);
        break;
      }
      case `devices`: {
        this.handleDeviceList(context);
        break;
      }
      case `device_control`: {
        this.handleDeviceControl(context);
        break;
      }
      case `device_on`: {
        this.handleDeviceSwitch(context, 'activate');
        break;
      }
      case `device_off`: {
        this.handleDeviceSwitch(context, 'deactivate');
        break;
      }
      case `btc`: {
        this.handleBTC(context);
        break;
      }
      case `back_main`: {
        this.handleBackToMain(context);
        break;
      }
    }
  }

  async initializeMenuCallback(botInstance) {
    botInstance.on(`callback_query`, (context) => {
      logger.info(`Received callback from menu`);
      logger.info(context);
      this.handleMenuCallback(context);
    });
  }

  async handleBackToMain(context) {
    logger.info(`Handling back to main`);
    this.backToMainMenu(context);
  }

  async handleBroadcast(context) {
    logger.info(`Handling broadcast with context`);
    logger.info(context);
    var buttonList = [];
    for (const [i, message] of this.broadcastMessages.entries()) {
      const buttonCallbackData = {
        command: `broadcast_message`,
        message: i
      };
      buttonList.push([
        {
          text: message,
          callback_data: JSON.stringify(buttonCallbackData)
        }
      ]);
    }
    buttonList.push([
      {
        text: `${this.backIcon} Back`,
        callback_data: JSON.stringify({
          command: `back_main`
        })
      }
    ]);

    var replyMarkup = {
      inline_keyboard: buttonList
    };
    this.editMarkupMessage({ context, replyMarkup });
  }

  async handleDeviceList(context) {
    logger.info(`Handling devices`);
    var buttonList = [];
    for (const [i, message] of this.devices.entries()) {
      const buttonCallbackData = {
        command: `device_control`,
        device: i
      };
      buttonList.push([
        {
          text: message,
          callback_data: JSON.stringify(buttonCallbackData)
        }
      ]);
    }
    buttonList.push([
      {
        text: `${this.backIcon} Back`,
        callback_data: JSON.stringify({
          command: `back_main`
        })
      }
    ]);

    var replyMarkup = {
      inline_keyboard: buttonList
    };
    this.editMarkupMessage({ context, replyMarkup });
  }

  async handleDeviceControl(context) {
    logger.info(`Handling device control`);
    logger.info(context);
    const data = JSON.parse(context.data);
    const deviceIndex = parseInt(data.device);
    const device = this.devices[deviceIndex];
    logger.info(`Controlling device ${device}`);
    var buttonList = [
      [
        {
          text: device,
          callback_data: JSON.stringify({
            command: 'fake'
          })
        }
      ],
      [
        {
          text: '\u{1F7E2} On',
          callback_data: JSON.stringify({
            command: `device_on`,
            device: deviceIndex
          })
        }
      ],
      [
        {
          text: '\u{1F534} Off',
          callback_data: JSON.stringify({
            command: `device_off`,
            device: deviceIndex
          })
        }
      ],
      [
        {
          text: `${this.backIcon} Back`,
          callback_data: JSON.stringify({
            command: `devices`
          })
        },
        {
          text: `${this.upIcon} Back to main`,
          callback_data: JSON.stringify({
            command: `back_main`
          })
        }
      ]
    ];
    var replyMarkup = {
      inline_keyboard: buttonList
    };
    this.editMarkupMessage({ context, replyMarkup });
  }

  async handleDeviceSwitch(context, state = 'deactivate') {
    const data = JSON.parse(context.data);
    const deviceIndex = parseInt(data.device);
    const device = this.devices[deviceIndex];
    if (!this.validateEnable(context)) {
      return;
    }
    let reply = `${state.toUpperCase()} device ${device}`;
    this.sendMessage({ context, msg: reply });
    logger.info(reply);
    let assistantHelper = new GoogleAssistantHelper();
    assistantHelper.device(state, device);
  }

  async handleBTC(context) {
    const btcLib = new BTCLib();
    btcLib.getPrices(context, this.sendMessage.bind(this));
  }

  get backIcon() {
    return '\u{1F448}';
  }

  get upIcon() {
    return `\u{261D}`;
  }

  get mainMenuInlineKeyboard() {
    return [
      [
        {
          text: '\u{1F399} Broadcast message',
          callback_data: JSON.stringify({
            command: `broadcast`
          })
        },
        {
          text: '\u{1F39B} Control Devices',
          callback_data: JSON.stringify({
            command: `devices`
          })
        }
      ],
      [
        {
          text: '\u{1F4F7} Camera Snapshot [ WIP ]',
          callback_data: JSON.stringify({
            command: `camera_snapshot`
          })
        },
        {
          text: `\u{20BF} Bitcoin Prices`,
          callback_data: JSON.stringify({
            command: `btc`
          })
        }
      ]
    ];
  }

  async backToMainMenu(context) {
    var replyMarkup = JSON.stringify({
      inline_keyboard: this.mainMenuInlineKeyboard,
      resize_keyboard: true
    });
    this.editMarkupMessage({ context, replyMarkup });
  }

  async handleMessage(context) {
    var opts = {
      reply_markup: JSON.stringify({
        inline_keyboard: this.mainMenuInlineKeyboard,
        resize_keyboard: true
      })
    };
    this.sendMessage({ context, msg: `Choose your action:`, opts });
  }
};
