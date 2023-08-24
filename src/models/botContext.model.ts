import { Logger } from "winston";
import { Context } from "telegraf";
import { UserDBModel } from "./user-db.model.js";

export interface BotContext extends Context {
    logger: Logger;
    user: UserDBModel;
}
