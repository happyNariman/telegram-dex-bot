import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/types';

let networksKeyboardList = [
    Markup.button.callback('🪙 Ethereum Mainnet', 'eth'),
    Markup.button.callback('🪙 Goerli Testnet', 'goerli'),
    Markup.button.callback('🪙 Sepolia Testnet', 'sepolia')
];

export function getNetworksKeyboard(...buttons: InlineKeyboardButton.CallbackButton[]) {
    return Markup.inlineKeyboard(networksKeyboardList.concat(buttons as any), {
        columns: 1
    });;
}

export { networksKeyboardList };