import { Markup } from 'telegraf';

const productList = [
    Markup.button.callback('🔍 DEX Transaction List', 'product_dex_transactions'),
];
const productsKeyboard = Markup.inlineKeyboard(productList);

export { productsKeyboard, productList };
