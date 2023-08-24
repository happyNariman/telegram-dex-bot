import dotenv from 'dotenv';
dotenv.config();

import { Telegraf } from 'telegraf';
import { BotContext } from './models/index.js';
import { logger } from './core/index.js';
import { LoggingMiddleware, SecurityMiddleware, ErrorMiddleware } from './middlewares/index.js';
import {
    StartCommand,
    StartUserRoleCommand,
    StartAnalystRoleCommand,
    AnalyzeCommand,
    HelpCommand
} from './commands/index.js';
import { initFirebase } from './services/db/index.js';

initFirebase();

const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN as string);

// Register middlewares
bot.use(
    LoggingMiddleware,
    SecurityMiddleware
);
bot.catch(ErrorMiddleware);


// Register commands
bot.start(StartCommand);
bot.command('user', StartUserRoleCommand);
bot.command('analyst', StartAnalystRoleCommand);
bot.command('analyze', AnalyzeCommand);
bot.help(HelpCommand);


// Start bot
try {
    logger.info(`Starting bot... environment: ${process.env.NODE_ENV}`);
    await bot.launch();
} catch (error) {
    logger.error(`Error starting the bot: ${error}`);
}
