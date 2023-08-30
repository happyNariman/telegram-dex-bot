import dotenv from 'dotenv';
dotenv.config();

import { Scenes, Telegraf, session } from 'telegraf';
import { BotContext } from './models/index.js';
import { logger } from './core/index.js';
import { LoggingMiddleware, SecurityMiddleware, ErrorMiddleware } from './middlewares/index.js';
import {
    StartCommand,
    AnalyzeCommand,
    HelpCommand
} from './commands/index.js';
import { SetRoleAction, StartProductAction } from './actions/index.js';
import { initFirebase } from './services/db/index.js';
import { DEXTransactionsWizard } from './wizards/index.js';

initFirebase();

const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN as string);

// Register middlewares
bot.use(
    session(),
    LoggingMiddleware,
    SecurityMiddleware,
);
bot.catch(ErrorMiddleware);


// Register wizards
const stage = new Scenes.Stage([DEXTransactionsWizard]);
bot.use(stage.middleware());


// Register commands
bot.start(StartCommand);
bot.command('analyze', AnalyzeCommand);
bot.help(HelpCommand);


// Register actions
bot.action(/^set_role_(.*)$/, SetRoleAction);
bot.action(/^product_(.*)$/, StartProductAction);


// Start bot
try {
    logger.info(`Starting bot... environment: ${process.env.NODE_ENV}`);
    await bot.launch();
} catch (error) {
    logger.error(`Error starting the bot: ${error}`);
}
