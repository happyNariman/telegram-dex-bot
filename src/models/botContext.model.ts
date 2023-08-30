import { Logger } from "winston";
import { Context, NarrowedContext, Scenes } from "telegraf";
import { CallbackQuery, Update } from 'telegraf/types';
import { UserDBModel } from "./user-db.model.js";

export interface BotContext<S extends Scenes.WizardSessionData = Scenes.WizardSessionData> extends Context {
    logger: Logger;
    user: UserDBModel;
    userId: number;
    messageText?: string | undefined;
    callbackQueryData?: string | undefined;

    // declare session type
    session: Scenes.WizardSession<S>;
    // declare scene type
    scene: Scenes.SceneContextScene<BotContext<S>, S>;
    // declare wizard type
    wizard: Scenes.WizardContextWizard<BotContext<S>>;
}

export type NarrowedBotContext = NarrowedContext<BotContext & { match: RegExpExecArray; }, Update.CallbackQueryUpdate<CallbackQuery>>;
