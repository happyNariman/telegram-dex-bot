import { createLogger, transports, format } from 'winston';

const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.timestamp(),
        format.metadata(),
        format.printf(({ level, message, metadata }) => {
            const metaString = metadata && Object.keys(metadata).length > 1 ? `\n${JSON.stringify(metadata, null, 2)}` : '';
            const requestIdStr = metadata.requestId ? ` [${metadata.requestId}]` : '';
            return `[${metadata?.timestamp}] [${level}]${requestIdStr}: ${message}${metaString}`;
        })
    ),
    transports: [
        //new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/bot.log', level: 'debug' }),
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple(),
    }));
    logger.level = 'info';
}

export { logger };
