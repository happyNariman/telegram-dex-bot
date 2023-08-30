import { Markup, Scenes } from 'telegraf';
import { callbackQuery, message } from 'telegraf/filters';
import { ethers } from 'ethers';
import { BotContext } from '../models/index.js';
import { networksKeyboardList } from '../keyboards/index.js';
import { AnalyzeCommandAndReplyWithDocument } from '../commands/index.js';

interface DEXTransactionsWizardSessionData extends Scenes.WizardSessionData {
    network: string;
    address: string;
}

const cancelCallbackButton = Markup.button.callback('◀️ Cancel', '_cancel');
const cancelKeyboard = Markup.inlineKeyboard([cancelCallbackButton]);

const networksAndCancelCallbackButtons = networksKeyboardList.concat(cancelCallbackButton);
const networksAndCancelKeyboard = Markup.inlineKeyboard(networksAndCancelCallbackButtons, { columns: 1 });

const DEXTransactionsWizard = new Scenes.WizardScene<BotContext>(
    'dex-transactions',
    async context => {
        await context.reply('Please select a blockchain network:', networksAndCancelKeyboard);
        return context.wizard.next();
    },
    async context => {
        const session = context.scene.session as DEXTransactionsWizardSessionData;
        const selectedButton = networksAndCancelCallbackButtons.find(p => p.callback_data === context.callbackQueryData);

        if (!context.has(callbackQuery('data')) || !selectedButton) {
            await context.reply('Please select a blockchain network:', networksAndCancelKeyboard);
            return;
        }
        if (context.callbackQuery.data === '_cancel') {
            await context.reply('Canceled');
            return context.scene.leave();
        }

        session.network = context.callbackQuery.data;
        await context.reply(selectedButton.text);
        await context.reply('Please enter wallet address:', cancelKeyboard);
        return context.wizard.next();
    },
    async (context) => {
        const session = context.scene.session as DEXTransactionsWizardSessionData;

        if (context.callbackQueryData === '_cancel') {
            await context.reply('Canceled');
            return context.scene.leave();
        }
        if (!context.has(message('text')) || !ethers.isAddress(context.message.text)) {
            await context.reply('Wallet address is not valid, please re-enter:', cancelKeyboard);
            return;
        }

        session.address = context.message.text;

        await AnalyzeCommandAndReplyWithDocument(context, session.address, session.network);

        return context.scene.leave();
    }
);

export { DEXTransactionsWizard };
