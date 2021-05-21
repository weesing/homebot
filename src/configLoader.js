import _ from 'lodash';
let secrets = Object.assign({}, require('../secrets/secrets.json'));
let defaultConfig = Object.assign({}, require('../config/default.json'));

let config = _.merge(defaultConfig, secrets);

export default config;
export { config };
export { config as cfg };