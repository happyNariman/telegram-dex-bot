import { NarrowedBotContext, UserRole } from '../models/index.js';
import { UserDBService } from '../services/index.js';
import { productsKeyboard } from '../keyboards/index.js';

export async function SetRoleAction(context: NarrowedBotContext) {

    if (context.user.role !== UserRole.New) {
        context.reply(`You already have the ${context.user.role} role installed.`);
        return;
    }

    const matchRole = context.match[1];

    if (matchRole === 'user')
        context.user.role = UserRole.User;
    else if (matchRole === 'analyst')
        context.user.role = UserRole.Analyst;
    else {
        context.reply('Unknown role');
        return;
    }

    await new UserDBService(context.logger).update(context.user.id, context.user);

    context.reply(`You have ${context.user.role === UserRole.User ? 5 : 20} requests for analysis per day.`);
    context.reply(`What would you like to do?`, productsKeyboard);
}
