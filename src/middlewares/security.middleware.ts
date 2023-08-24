import { Update, Message, CallbackQuery, User } from 'typegram';
import { BotContext, UserRole } from '../models/index.js';
import { UserDBService } from '../services/index.js';

export async function SecurityMiddleware(context: BotContext, next: () => Promise<void>) {
    let telegramUser: User | undefined;
    let message: Message.TextMessage | undefined;

    switch (context.updateType) {
        case 'message':
            message = (context.update as Update.MessageUpdate).message as Message.TextMessage;
            telegramUser = message.from;
            break;

        case 'callback_query':
            const callbackQuery = (context.update as Update.CallbackQueryUpdate).callback_query as CallbackQuery;
            telegramUser = callbackQuery.from;
            break;
    }

    if (!telegramUser?.id) {
        context.logger.warn('User id is not defined');
        context.reply('Sorry, I can\'t recognize you');
        return;
    }

    if (telegramUser?.is_bot) {
        context.logger.warn('Bot tried to use this bot');
        context.reply('This bot does not support other bots.');
        return;
    }

    context.sendChatAction('typing');

    const userDBService = new UserDBService();
    let user = await userDBService.getById(telegramUser.id.toString());
    const isAllowedStartCommand = message && (message.text.startsWith('/start') || message.text.startsWith('/help'));

    if (user) {
        context.user = user;

        if (user.role === UserRole.New) {
            if (message && !isAllowedStartCommand) {
                context.reply('You need to choose a role: /user or /analyst\nDetails: /help');
                return;
            }
        }
    } else if (!isAllowedStartCommand) {
        context.reply('Access is denied. Start from the /start');
        return;
    }

    return next();
}
