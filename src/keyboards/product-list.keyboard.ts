import { Markup } from 'telegraf';

const productsKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('🔍 DEX Transaction List', 'product_dex_transactions'),
]);

export { productsKeyboard };
