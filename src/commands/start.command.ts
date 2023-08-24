import { Update } from 'typegram';
import { Markup } from 'telegraf';
import { BotContext, UserDBModel, UserRole } from '../models/index.js';
import { UserDBService } from '../services/index.js';

export async function StartCommand(context: BotContext) {
    const userDBService = new UserDBService();

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
    await userDBService.createWithCustomId(userId, context.user);

    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('User', 'set_user_role'),
        Markup.button.callback('Analyst', 'set_analyst_role'),
    ]);

    context.reply('Hello! I am a bot for analyzing trading on DEX exchanges. Details: /help\nChoose your role:', keyboard);
}
