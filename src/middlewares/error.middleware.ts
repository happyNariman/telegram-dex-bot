import { BotContext } from '@models/index.js';

export function ErrorMiddleware(error: unknown, context: BotContext) {
    context.logger.error('Error:', { error });
    context.reply('An error has occurred. Please try again later.');
}
