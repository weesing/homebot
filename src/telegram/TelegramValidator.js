import _ from "lodash";

import cfg from "../configLoader";
const allowedUserIds = _.get(cfg, `telegram.allowedUserIds`);
const allowedGroupIds = _.get(cfg, `telegram.allowedGroupIds`);

export class TelegramValidator {
    constructor() {

    }

    validateUserId(ctx, userId) {
        if (!_.isNil(userId) && allowedUserIds.indexOf(userId) >= 0) {
            console.log(`Authorized user: ${userId} - ${_.get(ctx, "update.message.from.username")}`);
            return true;
        } else {
            console.log(`Unauthorized user: ${userId} - ${_.get(ctx, "update.message.from.username")}!!!`);
            return false;
        }
    }

    validateGroupId(ctx, groupId) {
        if (!_.isNil(groupId)) {
            if (allowedGroupIds.indexOf(groupId) >= 0) {
                console.log(`Authorized group: ${groupId} - ${_.get(ctx, "update.message.chat.title")}`);
                return true;
            }
            else {
                console.log(`Unauthorized group: ${groupId} - ${_.get(ctx, "update.message.chat.title")}`);
                return false;
            }
        }
    }

    validateSource(ctx) {
        let type = _.get(ctx, "update.message.chat.type");
        switch (type) {
            case "private": {
                let userId = _.get(ctx, "update.message.from.id");
                return this.validateUserId(ctx, userId);
            }
            case "group": {
                let groupId = _.get(ctx, "update.message.chat.id");
                return this.validateGroupId(ctx, groupId);
            }
            default: {
                return false;
            }
        }
    }
}