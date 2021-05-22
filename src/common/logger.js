import pino from "pino";

const defaultLogger = pino({
  prettyPrint: {
    levelFirst: true,
    translateTime: true
  }
});
defaultLogger.info(`Initialized logger`);

export default defaultLogger;
