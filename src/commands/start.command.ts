import { Markup } from 'telegraf';
import { Update } from 'telegraf/types';
import { BotContext, UserDBModel, UserRole } from '../models/index.js';
import { UserDBService } from '../services/index.js';
import { showProductKeyboard } from '../keyboards/index.js';

export async function StartCommand(context: BotContext) {
    if (context.user && context.user.role !== UserRole.New) {
        await context.reply(`Glad to see you again, ${context.user.first_name}!`);
        await showProductKeyboard(context);
        return;
    }

    const messageUpdate = context.update as Update.MessageUpdate;
    const messageFrom = messageUpdate.message.from;
    const userId = messageFrom.id.toString();

    context.user = {
        id: userId,
        role: UserRole.New,
        username: messageFrom.username,
        first_name: messageFrom.first_name,
        last_name: messageFrom.last_name,
    } as UserDBModel;
    await new UserDBService(context.logger).createWithCustomId(userId, context.user);

    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('User', 'set_role_user'),
        Markup.button.callback('Analyst', 'set_role_analyst'),
    ]);

    context.replyWithHTML(`Hello, ${context.user.first_name}! I am a bot for analyzing trading on DEX exchanges.\n<b>Choose your role:</b>`, keyboard);
}
