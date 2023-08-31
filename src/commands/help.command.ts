import { BotContext } from '@models/index.js';

export function HelpCommand(context: BotContext) {
    context.reply('Available commands:\n/products - show what bot can do\n/analyze <wallet address> eth - get excel file of DEX Transactions');
}
