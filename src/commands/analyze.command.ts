import { Message, Telegram } from 'typegram';
import { BotContext } from "@models/index.js";

export async function AnalyzeCommand(context: BotContext) {
    if (!context.from || !context.from.id) {
        throw new Error("Invalid context");
    }

    //if (context.message?.type !== 'text') return next()

    const users: any = {};
    const userId = context.from.id;
    const user = users[userId];

    if (!user) {
        context.reply("Выберите роль: /user или /analyst");
        return;
    }

    if (user.requestsLeft <= 0) {
        context.reply("Вы исчерпали лимит запросов на сегодня.");
        return;
    }

    //const msg = context.message instanceof TextMessage ? context.message : undefined;
    console.log('AnalyzeCommand', context.message);

    const args = (context.message as any).text?.split(' ') ?? [];
    if (args.length !== 3 || args[2] !== 'eth') {
        context.reply("Используйте формат: /analyze <адрес кошелька> eth");
        return;
    }

    const walletAddress = args[1];
    // Здесь выполняйте запросы к блокчейну через ethers.js и анализируйте торги пользователя
    // Создание Excel документа и отправка его пользователю

    user.requestsLeft -= 1;
    context.reply("Выполнен анализ. Осталось запросов: " + user.requestsLeft);
}