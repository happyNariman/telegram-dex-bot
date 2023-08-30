import { NarrowedBotContext } from '../models/index.js';
import { productList } from '../keyboards/index.js';

export async function StartProductAction(context: NarrowedBotContext) {

    const matchRole = context.match[1];
    const selectedProduct = productList.find(p => p.callback_data === context.callbackQueryData);

    if (selectedProduct)
        await context.reply(selectedProduct.text);

    switch (matchRole) {
        case 'dex_transactions':
            context.scene.enter('dex-transactions');
            return;

        default:
            context.reply('Unknown command.');
            return;
    }
}
