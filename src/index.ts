import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
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
import { showProductKeyboard } from './keyboards/index.js';

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
bot.command('products', context => showProductKeyboard(context));
bot.help(HelpCommand);


// Register actions
bot.action(/^set_role_(.*)$/, SetRoleAction);
bot.action(/^product_(.*)$/, StartProductAction);


// Start bot
logger.info(`Starting bot... environment: ${process.env.NODE_ENV}`);
bot.launch()
    .catch(error => logger.error(`Error starting the bot: ${error}`));


// Start http server
const app = express();
app.get('/', (req, res) => {
    res.send('Hello, I\'m <a href="https://t.me/dex_analysis_bot">@dex_analysis_bot</a>!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
