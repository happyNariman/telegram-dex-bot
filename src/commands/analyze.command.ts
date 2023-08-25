import { Message } from 'typegram';
import { Update } from 'telegraf/types';
import { ethers } from 'ethers';
import firebase from 'firebase-admin';
import { BotContext, UserRole } from '../models/index.js';
import { ExcelService, RequestDBService } from '../services/index.js';

export async function AnalyzeCommand(context: BotContext) {
    if (context.updateType !== 'message')
        throw new Error('Invalid type');

    const user = context.user;
    const allowedRequestCounts = user.role === UserRole.Analyst ? 20 : 5;
    const messageUpdate = context.update as Update.MessageUpdate;
    const message = messageUpdate.message as Message.TextMessage;
    const requestDBService = new RequestDBService(context.logger);
    const excelService = new ExcelService(context.logger);

    const requestCounts = await requestDBService.getCountUserRequestsByDate(context.user.id, new Date());

    if (requestCounts >= allowedRequestCounts) {
        context.reply('You have reached the request limit for today.');
        return;
    }

    const args = message.text?.split(' ') ?? [];
    if (args.length !== 3 || !ethers.isAddress(args[1]) || args[2] !== 'eth') {
        context.reply('Use the format: /analyze <wallet address> eth');
        return;
    }

    const walletAddress = args[1];
    const tokenName = args[2];

    try {
        //const data: string[][] = [];
        const data = [
            ['BTC', '0x123abc', 'ETH', '0x456def', '2023-08-25', '0x789ghi', 'Uniswap'],
            ['ETH', '0x456def', 'BTC', '0x123abc', '2023-08-26', '0x789ghi', 'Sushiswap']
        ];
        const currentDateWithoutTime = getCurrentDateWithoutTime();
        const worksheetTitle = 'Analysis as of ' + currentDateWithoutTime;

        const excelStream = await excelService.generateFile(worksheetTitle, excelTitleColumns, data, headersWidths);
        await context.replyWithDocument({ source: excelStream, filename: `${walletAddress}__${tokenName}__${currentDateWithoutTime}.xlsx` });

        await requestDBService.create(context.user.id, {
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            walletAddress: walletAddress,
            tokenName: tokenName
        });

        context.reply('Analysis completed. Remaining requests: ' + (allowedRequestCounts - (requestCounts + 1)));
    } catch (error) {
        context.reply('error ');
        context.logger.error('error', { error });
    }


}

const excelTitleColumns = [
    'Coin Ticker A',
    'Coin A contract address',
    'Coin Ticker B',
    'Coin B contract address',
    'Transaction Date',
    'Pool contract address for this pair',
    'Dex type'
];
const headersWidths = [{ width: 15 }, { width: 30 }, { width: 15 }, { width: 30 }, { width: 25 }, { width: 30 }, { width: 15 }];

function getCurrentDateWithoutTime(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}