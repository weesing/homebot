import _ from 'lodash';
import { HandlerBase } from './handler_base';
import logger from '../../common/logger';
import { cfg } from '../../configLoader';
import { AssetDefines } from '../../lib/asset_defines';
import {
  CMD_BACK_TO_MAIN,
  CMD_BROADCAST,
  CMD_BROADCAST_MESSAGE,
  CMD_BTC,
  CMD_DEVICES,
  CMD_DEVICE_CONTROL,
  CMD_DEVICE_OFF,
  CMD_DEVICE_ON,
  CMD_GENERATE_UUID,
  CMD_CAMERA_SNAPSHOT,
  CMD_TOGGLE_DOORLOCK
} from '../../lib/command_defines';
import { HandlerDeviceSwitchBase } from './handler_deviceswitch';
import { HandlerBroadcast } from './handler_broadcast';
import { HandlerBTCPrice } from './handler_btcprice';
import { HandlerUUID } from './handler_uuid';
import { HandlerCameraSnapshot } from './handler_camerasnapshot';
import { HandlerToggleDoorlock } from './handler_toggledoorlock';

export class HandlerMenu extends HandlerBase {
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
      case CMD_BROADCAST: {
        this.handleBroadcast(context);
        break;
      }
      case CMD_BROADCAST_MESSAGE: {
        this.handleBroadcastMessage(context);
        break;
      }
      case CMD_DEVICES: {
        this.handleDeviceList(context);
        break;
      }
      case CMD_DEVICE_CONTROL: {
        this.handleDeviceControl(context);
        break;
      }
      case CMD_DEVICE_ON: {
        this.handleDeviceSwitch(context, 'activate');
        break;
      }
      case CMD_DEVICE_OFF: {
        this.handleDeviceSwitch(context, 'deactivate');
        break;
      }
      case CMD_BTC: {
        this.handleBTC(context);
        break;
      }
      case CMD_GENERATE_UUID: {
        this.handleGenerateUUID(context);
        break;
      }
      case CMD_CAMERA_SNAPSHOT: {
        this.handleCameraSnapshot(context);
        break;
      }
      case CMD_TOGGLE_DOORLOCK: {
        this.handleToggleDoorlock(context);
        break;
      }
      case CMD_BACK_TO_MAIN: {
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
        command: CMD_BROADCAST_MESSAGE,
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
          command: CMD_BACK_TO_MAIN
        })
      }
    ]);

    var replyMarkup = {
      inline_keyboard: buttonList
    };
    this.editMarkupMessage({ context, replyMarkup });
  }

  async handleBroadcastMessage(context) {
    const data = JSON.parse(context.data);
    const messageIndex = parseInt(data.message);
    const message = this.broadcastMessages[messageIndex];
    const broadcastHandler = new HandlerBroadcast({
      botInstance: this.botInstance
    });
    await broadcastHandler.broadcastMessage(context, message);
  }

  async handleDeviceList(context) {
    logger.info(`Handling devices`);
    var buttonList = [];
    for (const [i, message] of this.devices.entries()) {
      const buttonCallbackData = {
        command: CMD_DEVICE_CONTROL,
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
          command: CMD_BACK_TO_MAIN
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
            command: CMD_DEVICE_ON,
            device: deviceIndex
          })
        }
      ],
      [
        {
          text: `${AssetDefines.deviceOffIcon} Off`,
          callback_data: JSON.stringify({
            command: CMD_DEVICE_OFF,
            device: deviceIndex
          })
        }
      ],
      [
        {
          text: `${AssetDefines.backIcon} Back`,
          callback_data: JSON.stringify({
            command: CMD_DEVICES
          })
        },
        {
          text: `${AssetDefines.upIcon} Back to main`,
          callback_data: JSON.stringify({
            command: CMD_BACK_TO_MAIN
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

    const deviceSwitchHandler = new HandlerDeviceSwitchBase({
      botInstance: this.botInstance
    });
    await deviceSwitchHandler.switchDevice(context, state, device);
  }

  async handleToggleDoorlock(context) {
    const handlerToggleDoorlock = new HandlerToggleDoorlock({
      botInstance: this.botInstance
    });
    await handlerToggleDoorlock.handleMessage(context);
  }

  async handleCameraSnapshot(context) {
    const handlerCameraSnapshot = new HandlerCameraSnapshot({
      botInstance: this.botInstance
    });
    await handlerCameraSnapshot.handleMessage(context);
  }

  async handleBTC(context) {
    const btcPriceHandler = new HandlerBTCPrice({
      botInstance: this.botInstance
    });
    await btcPriceHandler.handleMessage(context);
  }

  async handleGenerateUUID(context) {
    const generateUUIDHandler = new HandlerUUID({
      botInstance: this.botInstance
    });
    await generateUUIDHandler.handleMessage(context);
  }

  get mainMenuInlineKeyboard() {
    return JSON.stringify({
      inline_keyboard: [
        [
          {
            text: `${AssetDefines.broadcastIcon} Broadcast message`,
            callback_data: JSON.stringify({
              command: CMD_BROADCAST
            })
          }
        ],
        [
          {
            text: `${AssetDefines.controlDevicesIcon} Control Devices`,
            callback_data: JSON.stringify({
              command: CMD_DEVICES
            })
          }
        ],
        [
          {
            text: `${AssetDefines.cameraSnapshotIcon} Camera Snapshot`,
            callback_data: JSON.stringify({
              command: CMD_CAMERA_SNAPSHOT
            })
          }
        ],
        [
          {
            text: `${AssetDefines.lockIcon} Toggle Doorlock`,
            callback_data: JSON.stringify({
              command: CMD_TOGGLE_DOORLOCK
            })
          }
        ],
        [
          {
            text: `${AssetDefines.bitcoinIcon} Bitcoin Prices`,
            callback_data: JSON.stringify({
              command: CMD_BTC
            })
          },
          {
            text: `${AssetDefines.uuidIcon} Generate UUID`,
            callback_data: JSON.stringify({
              command: CMD_GENERATE_UUID
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
}

module.exports = HandlerMenu;
