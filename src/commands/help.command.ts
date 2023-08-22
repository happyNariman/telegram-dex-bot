import { BotContext } from "@models/index.js";

export function HelpCommand(context: BotContext) {
    context.reply("Доступные команды:\n/start - начать взаимодействие\n/help - получить справку\n/user - выбрать роль пользователя\n/analyst - выбрать роль аналитика\n/analyze <адрес кошелька> eth - выполнить анализ");
}
