import { setLogger } from "grpc";
import _ from "lodash";

import cfg from "../configLoader";
const allowedUserIds = _.get(cfg, `telegram.allowedUserIds`);
const allowedGroupIds = _.get(cfg, `telegram.allowedGroupIds`);

import logger from "../common/logger";

export class TelegramValidator {
  constructor() {}

  validateUserId(msg, userId) {
    if (!_.isNil(userId) && allowedUserIds.indexOf(userId) >= 0) {
      logger.info(
        `Authorized user: ${userId} - ${_.get(msg, "from.username")}`
      );
      return true;
    } else {
      logger.info(
        `Unauthorized user: ${userId} - ${_.get(msg, "from.username")}!!!`
      );
      return false;
    }
  }

  validateGroupId(msg, groupId) {
    if (!_.isNil(groupId)) {
      if (allowedGroupIds.indexOf(groupId) >= 0) {
        logger.info(
          `Authorized group: ${groupId} - ${_.get(msg, "chat.title")}`
        );
        return true;
      } else {
        logger.info(
          `Unauthorized group: ${groupId} - ${_.get(msg, "chat.title")}`
        );
        return false;
      }
    }
  }

  validateSource(msg) {
    let type = _.get(msg, "chat.type");
    logger.info(`Detected chat type ${type}`);
    switch (type) {
      case "private": {
        let userId = _.get(msg, "from.id");
        return this.validateUserId(msg, userId);
      }
      case "supergroup":
      case "group": {
        let groupId = _.get(msg, "chat.id");
        return this.validateGroupId(msg, groupId);
      }
      default: {
        return false;
      }
    }
  }
}
