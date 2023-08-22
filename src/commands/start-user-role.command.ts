import { BotContext } from "@models/index.js";

export function StartUserRoleCommand(context: BotContext) {
    if (!context.from || !context.from.id) {
        throw new Error("Invalid context");
    }

    const users: any = {};
    const userId = context.from.id;
    users[userId] = { role: 'Пользователь', requestsLeft: 5 };
    context.reply("Вы в роли пользователя. Можете начать анализ с /analyze <адрес кошелька> eth");
}
