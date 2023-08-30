import { callbackQuery, message } from 'telegraf/filters';
import { BotContext, UserRole } from '../models/index.js';
import { UserDBService } from '../services/index.js';

export async function SecurityMiddleware(context: BotContext, next: () => Promise<void>) {
    let telegramUser = context.message?.from || context.callbackQuery?.from;

    if (context.myChatMember)
        return;

    if (!telegramUser?.id) {
        context.logger.warn('User id is not defined');
        context.reply('Sorry, I can\'t recognize you');
        return;
    }

    if (telegramUser.is_bot) {
        context.logger.warn('Bot tried to use this bot', { botId: telegramUser.id });
        context.reply('This bot does not support other bots.');
        context.banChatMember(telegramUser.id);
        return;
    }

    if (context.has(message('text')))
        context.messageText = context.message.text;
    if (context.has(callbackQuery('data')))
        context.callbackQueryData = context.callbackQuery.data;

    context.userId = telegramUser.id;
    context.sendChatAction('typing');

    context.user = (await new UserDBService(context.logger).getById(telegramUser.id.toString()))!;
    const isAllowedStartCommand = context.messageText?.startsWith('/start') || context.messageText?.startsWith('/help');

    if (context.user) {
        if (context.user.role === UserRole.New && (!context.callbackQueryData?.startsWith('set_role_') && !isAllowedStartCommand)) {
            context.reply('You need to choose a role.');
            return;
        }
    } else if (!isAllowedStartCommand) {
        context.reply('Access is denied. Start from the /start');
        return;
    }

    if (context.updateType === 'callback_query')
        context.editMessageReplyMarkup({ inline_keyboard: [] });

    return next();
}
