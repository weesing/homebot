import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import cfg from '../configLoader';
import logger from '../common/logger';

export class SpaceoutLib {
  async getData() {
    const url = `${cfg.spaceout.url}?query=${cfg.spaceout.paramsAll}`;
    var dataAll = await axios.post(url).then((response) => {
      return response.data.data.facilities;
    });
    dataAll = dataAll.filter(
      (data) => !_.isNil(data.id) && !_.isNil(data.name) && !_.isNil(data.band)
    );
    const now = moment().unix();
    const finalData = [];
    // Filter by time
    for (const data of dataAll) {
      const createdAt = moment(data.createdAt).unix();
      const diff = now - createdAt;
      var ignore = false;
      if (diff > 86400) {
        ignore = true;
      }
      if (!ignore) {
        for (var index = 0; index < finalData.length; ++index) {
          const final = finalData[index];
          if (data.name.toLowerCase() === final.name.toLowerCase()) {
            logger.warn(
              `${data.name}(${data.createdAt}) conflicts with ${final.name}(${final.createdAt}`
            );
            const finalCreatedAt = moment(final.createdAt).unix();
            if (finalCreatedAt > createdAt) {
              ignore = true;
            } else {
              console.log(`Removing old entry for ${finalData[index].name}`);
              finalData.splice(index, 1);
            }
            break;
          }
        }
      }
      if (!ignore) {
        logger.info(`Added entry for ${data.name} ${data.band} (${data.createdAt})`);
        finalData.push(data);
      }
    }
    return finalData;
  }
}
