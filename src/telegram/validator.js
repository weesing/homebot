import { setLogger } from 'grpc';
import _ from 'lodash';

import cfg from '../configLoader';
const allowedUserIds = _.get(cfg, `telegram.allowedUserIds`);
const allowedGroupIds = _.get(cfg, `telegram.allowedGroupIds`);
const groupMenuBlacklistAcl = _.get(cfg, `telegram.groupMenuBlacklistAcl`);

import logger from '../common/logger';

export class TelegramValidator {
  constructor() {}

  validateUserId(msg, userId) {
    if (!_.isNil(userId) && allowedUserIds.indexOf(userId) >= 0) {
      logger.info(
        `Authorized user: ${userId} - ${_.get(msg, 'from.username')}`
      );
      return true;
    } else {
      logger.info(
        `Unauthorized user: ${userId} - ${_.get(msg, 'from.username')}!!!`
      );
      return false;
    }
  }

  validateGroupId(msg, groupId) {
    if (!_.isNil(groupId)) {
      if (allowedGroupIds.indexOf(groupId) >= 0) {
        logger.info(
          `Authorized group: ${groupId} - ${_.get(msg, 'chat.title', _.get(msg, 'message.chat.title'))}`
        );
        let command = '';
        let data = _.get(msg, 'data');
        try {
          command = _.get(JSON.parse(data), 'command');
        } catch (e) {
          logger.warn(
            `Unable to parse command "${data}". Probably not a menu command`
          );
        }
        if (!_.isEmpty(command)) {
          const userId = _.get(msg, `from.id`);
          logger.info(
            `User "${userId}" attempting to execute menu command "${command}"`
          );
          const blacklistUserIds = groupMenuBlacklistAcl[command];
          logger.info(
            `Retrieved command "${command}" blacklist -> ${blacklistUserIds}`
          );
          // if no ACL is provided, default to authorized. Treat ACL as whitelist style.
          if (
            !_.isNil(blacklistUserIds) &&
            !_.isEmpty(blacklistUserIds) && // blacklist not empty, respect the blacklist.
            blacklistUserIds.indexOf(userId) >= 0 // blacklist contains user ID
          ) {
            logger.warn(
              `Unauthorized usage of command "${command}" by user "${userId}", rejecting`
            );
            return false;
          }
          logger.info(
            `Authorized usage of command "${command}" by user "${userId}", resolving command`
          );
          return true;
        }
        return true;
      } else {
        logger.info(
          `Unauthorized group: ${groupId} - ${_.get(msg, 'chat.title')}`
        );
        return false;
      }
    }
  }

  validateSource(msg) {
    let type = _.get(msg, 'chat.type', _.get(msg, 'message.chat.type'));
    logger.info(`Detected chat type ${type}`);
    switch (type) {
      case 'private': {
        let userId = _.get(msg, 'from.id');
        return this.validateUserId(msg, userId);
      }
      case 'supergroup':
      case 'group': {
        let groupId = _.get(msg, 'chat.id', _.get(msg, 'message.chat.id'));
        return this.validateGroupId(msg, groupId);
      }
      default: {
        return false;
      }
    }
  }
}
