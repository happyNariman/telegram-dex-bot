import { logger } from '../core/index.js';
import { BotContext } from '@models/index.js';

export function LoggingMiddleware(context: BotContext, next: () => Promise<void>) {
    logger.info(`Received update: ${JSON.stringify(context.update)}`);
    return next();
}
