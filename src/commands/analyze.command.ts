import { Message } from 'typegram';
import { Update } from 'telegraf/types';
import { ethers } from 'ethers';
import firebase from 'firebase-admin';
import { BotContext, UserRole } from '../models/index.js';
import { ExcelService, RequestDBService, DexAnalysisService } from '../services/index.js';

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

    context.reply('Analysis started. Please wait excel file...');
    context.sendChatAction('upload_document');

    const walletAddress = args[1];
    const tokenName = args[2];

    try {
        const data: string[][] = await collectData(context, walletAddress, tokenName);
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

async function collectData(context: BotContext, walletAddress: string, tokenName: string): Promise<string[][]> {
    const transactions = await new DexAnalysisService(context.logger).analyzeTransactions(walletAddress);
    const data: string[][] = [];

    for (const tx of transactions) {
        data.push([
            tx.hash,
            tx.fromSymbol,
            tx.fromContractAddress,
            tx.toSymbol,
            tx.toContractAddress,
            tx.timeStamp.toISOString(),
            tx.poolContractAddress,
            tx.dexType,
        ]);
    }

    return data;
}

const excelTitleColumns = [
    'Hash',
    'Coin Ticker A',
    'Coin A contract address',
    'Coin Ticker B',
    'Coin B contract address',
    'Transaction Date',
    'Pool contract address for this pair',
    'Dex type'
];
const headersWidths = [{ width: 5 }, { width: 15 }, { width: 50 }, { width: 15 }, { width: 50 }, { width: 25 }, { width: 50 }, { width: 15 }];

function getCurrentDateWithoutTime(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}