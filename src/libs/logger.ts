import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

winston.addColors(colors);

const log = winston.createLogger({
  levels,
  level: level(),
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.metadata(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(
      (info) =>
        `[${info.timestamp}] ${info.level}: ${info.message} ${JSON.stringify(
          info.metadata,
          null,
          level() === 'debug' ? 2 : undefined,
        )}`,
    ),
  ),
  transports: [new winston.transports.Console({ handleExceptions: true, level: 'info' })],
});

export default log;
