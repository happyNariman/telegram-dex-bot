import { ethers } from 'ethers';
import firebase from 'firebase-admin';
import { BotContext, UserRole } from '../models/index.js';
import { ExcelService, RequestDBService, DexAnalysisService } from '../services/index.js';

export async function AnalyzeCommand(context: BotContext) {
    if (context.updateType !== 'message')
        throw new Error('Invalid type');

    const args = context.messageText?.split(' ') ?? [];
    if (args.length !== 3 || !ethers.isAddress(args[1]) || args[2] !== 'eth') {
        context.reply('Use the format: /analyze <wallet address> eth');
        return;
    }

    const walletAddress = args[1];
    const network = args[2];

    await AnalyzeCommandAndReplyWithDocument(context, walletAddress, network);
}

export async function AnalyzeCommandAndReplyWithDocument(context: BotContext, walletAddress: string, network: string) {
    const requestDBService = new RequestDBService(context.logger);
    const excelService = new ExcelService(context.logger);

    const allowedRequestCounts = context.user.role === UserRole.Analyst ? 20 : 5;
    const requestCounts = await requestDBService.getCountUserRequestsByDate(context.user.id, new Date());

    if (requestCounts >= allowedRequestCounts) {
        context.reply('You have reached the request limit for today.');
        // TODO: calc next date
        return;
    }

    context.reply('Analysis started. Please wait excel file...');
    context.sendChatAction('upload_document');

    try {
        const data: string[][] = await collectData(context, walletAddress, network);
        const currentDateWithoutTime = getCurrentDateWithoutTime();
        const worksheetTitle = 'Analysis as of ' + currentDateWithoutTime;

        const excelStream = await excelService.generateFile(worksheetTitle, excelTitleColumns, data, headersWidths);
        await context.replyWithDocument({ source: excelStream, filename: `${walletAddress}__${network}__${currentDateWithoutTime}.xlsx` });

        await requestDBService.create(context.user.id, {
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            walletAddress: walletAddress,
            network: network
        });

        await context.reply('✅ Analysis completed.');
        await context.reply(`${allowedRequestCounts - (requestCounts + 1)} requests left for the next ${hoursUntilEndOfDayUTC()} hours.`);
    } catch (error) {
        context.reply('❌ An error has occurred. Please try again later.');
        context.logger.error('error dex-transactions', { error, walletAddress, network });
    }
}

function hoursUntilEndOfDayUTC(): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const timeDiffMilliseconds = 24 * 60 * 60 * 1000 - (now.getTime() - today.getTime());
    return Math.round(timeDiffMilliseconds / 3600000);
}


async function collectData(context: BotContext, walletAddress: string, network: string): Promise<string[][]> {
    const transactions = await new DexAnalysisService(context.logger).analyzeTransactions(walletAddress, network);
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