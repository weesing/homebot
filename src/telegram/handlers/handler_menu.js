import _ from 'lodash';
import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { cfg } from '../../configLoader';
import { GoogleAssistantHelper } from '../../googleassistant/assistantHelper';
import { BTCLib } from '../../lib/btc';
import { AssetDefines } from '../../lib/asset_defines';
import { v4 as uuidV4 } from 'uuid';

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
      case 'generate_uuid': {
        this.handleGenerateUUID(context);
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
        text: `${AssetDefines.backIcon} Back`,
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
        text: `${AssetDefines.backIcon} Back`,
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
          text: `${AssetDefines.deviceOnIcon} On`,
          callback_data: JSON.stringify({
            command: `device_on`,
            device: deviceIndex
          })
        }
      ],
      [
        {
          text: `${AssetDefines.deviceOffIcon} Off`,
          callback_data: JSON.stringify({
            command: `device_off`,
            device: deviceIndex
          })
        }
      ],
      [
        {
          text: `${AssetDefines.backIcon} Back`,
          callback_data: JSON.stringify({
            command: `devices`
          })
        },
        {
          text: `${AssetDefines.upIcon} Back to main`,
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
    let reply = `${
      AssetDefines.okHandIcon
    } ${state.toUpperCase()} device ${device}`;
    this.sendMessage({ context, msg: reply });
    logger.info(reply);
    let assistantHelper = new GoogleAssistantHelper();
    assistantHelper.device(state, device);
  }

  async handleBTC(context) {
    const btcLib = new BTCLib();
    btcLib.getPrices(context, this.sendMessage.bind(this));
  }

  async handleGenerateUUID(context) {
    let uuid = uuidV4();
    uuid = uuid.replace(/-/g, '\\-');
    logger.info(`Generated UUID ${uuid}`);
    const msg = `\`\`\`${uuid}\`\`\``;
    logger.info(msg);
    const opts = {
      parse_mode: 'MarkdownV2'
    };
    this.sendMessage({ context, msg, opts });
    const link = `[uuidgenerator\\.net](https://www.uuidgenerator.net/)`;
    this.sendMessage({ context, msg: link, opts });
  }

  get mainMenuInlineKeyboard() {
    return JSON.stringify({
      inline_keyboard: [
        [
          {
            text: `${AssetDefines.broadcastIcon} Broadcast message`,
            callback_data: JSON.stringify({
              command: `broadcast`
            })
          }
        ],
        [
          {
            text: `${AssetDefines.controlDevicesIcon} Control Devices`,
            callback_data: JSON.stringify({
              command: `devices`
            })
          }
        ],
        [
          {
            text: `${AssetDefines.cameraSnapshotIcon} Camera Snapshot [ WIP ]`,
            callback_data: JSON.stringify({
              command: `camera_snapshot`
            })
          }
        ],
        [
          {
            text: `${AssetDefines.bitcoinIcon} Bitcoin Prices`,
            callback_data: JSON.stringify({
              command: `btc`
            })
          },
          {
            text: `${AssetDefines.uuidIcon} Generate UUID`,
            callback_data: JSON.stringify({
              command: 'generate_uuid'
            })
          }
        ]
      ]
    });
  }

  async backToMainMenu(context) {
    var replyMarkup = this.mainMenuInlineKeyboard;
    this.editMarkupMessage({ context, replyMarkup });
  }

  async handleMessage(context) {
    var opts = {
      reply_markup: this.mainMenuInlineKeyboard
    };
    this.sendMessage({ context, msg: `Choose your action:`, opts });
  }
};
