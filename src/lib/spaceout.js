import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import cfg from '../configLoader';

export class SpaceoutLib {
  async getData() {
    const url = cfg.spaceout.url;
    const data = await axios.post(url).then((response) => {
    });
  }
}
