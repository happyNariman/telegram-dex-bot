import { BotContext } from "@models/index.js";

export function StartAnalystRoleCommand(context: BotContext) {
    if (!context.from || !context.from.id) {
        throw new Error("Invalid context");
    }

    const users: any = {};
    const userId = context.from.id;
    users[userId] = { role: 'Аналитик', requestsLeft: 20 };
    context.reply("Вы в роли аналитика. Можете начать анализ с /analyze <адрес кошелька> eth");
}
