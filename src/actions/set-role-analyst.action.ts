import { BotContext, UserRole } from '../models/index.js';
import { UserDBService } from '../services/index.js';

export async function SetRoleAnalystAction(context: BotContext) {
    const userDBService = new UserDBService(context.logger);

    context.user.role = UserRole.Analyst;
    await userDBService.update(context.user.id, context.user);

    context.reply('You have 20 requests for analysis per day.\nTo analyze, send a message in the following format "/analyze <wallet address> eth"');
}
