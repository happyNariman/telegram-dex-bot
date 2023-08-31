import { Markup } from 'telegraf';
import { BotContext } from '../models/index.js';

export function showProductKeyboard(context: BotContext) {
    return context.reply('What would you like to do?', productsKeyboard);
}

const productList = [
    Markup.button.callback('🔍 DEX Transaction List', 'product_dex_transactions'),
];
const productsKeyboard = Markup.inlineKeyboard(productList);

export { productsKeyboard, productList };
