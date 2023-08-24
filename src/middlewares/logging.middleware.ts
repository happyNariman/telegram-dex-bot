import { logger } from '../core/index.js';
import { BotContext } from '@models/index.js';

export function LoggingMiddleware(context: BotContext, next: () => Promise<void>) {
    context.logger = logger.child({ requestId: context.update.update_id });
    context.logger.debug(`Received ${context.updateType}`, { contextUpdate: context.update });
    return next();
}
