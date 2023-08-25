import { Message } from 'typegram';
import { Update } from 'telegraf/types';
import { ethers } from 'ethers';
import firebase from 'firebase-admin';
import { BotContext, UserRole } from '../models/index.js';
import { RequestDBService } from '../services/index.js';

export async function AnalyzeCommand(context: BotContext) {
    if (context.updateType !== 'message')
        throw new Error('Invalid type');

    const user = context.user;
    const allowedRequestCounts = user.role === UserRole.Analyst ? 20 : 5;
    const messageUpdate = context.update as Update.MessageUpdate;
    const message = messageUpdate.message as Message.TextMessage;
    const requestDBService = new RequestDBService(context.logger);

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



    await requestDBService.create(context.user.id, {
        timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        walletAddress: walletAddress,
        tokenName: tokenName
    });

    context.reply('Analysis completed. Remaining requests: ' + (allowedRequestCounts - (requestCounts + 1)));
}
