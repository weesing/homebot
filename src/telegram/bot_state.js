import _ from 'lodash';

export class BotState {
  static getInstance() {
    if (_.isNil(BotState._instance)) {
      BotState._instance = new BotState();
    }
    return BotState._instance;
  }

  constructor() {
    this.enabled = true;
  }
}
