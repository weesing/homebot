import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import cfg from '../configLoader';

export class SpaceoutLib {
  async getData() {
    const url = `${cfg.spaceout.url}?query=${cfg.spaceout.paramsAll}`;
    const data = await axios.post(url).then(response => {
      return response.data.data.facilities;
    });
    for (const facility of data) {
      // Get each real-time data
      let facUrl = `${
        cfg.spaceout.url
      }?query=${cfg.spaceout.paramsFacility.replace('${id}', facility.id)}`;
      const facData = await axios.post(facUrl).then(response => {
        return response.data.data.facility
      });
      facility.band = facData.band;
      facility.createdAt = facData.createdAt;
    }
    return data;
  }
}
