import { BotContext } from "@models/index.js";

export function StartCommand(context: BotContext) {
    context.reply("Привет! Я бот для анализа торгов на DEX-биржах. Выберите вашу роль: /user или /analyst");
}
