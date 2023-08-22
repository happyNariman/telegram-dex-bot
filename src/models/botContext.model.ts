import { Context } from "telegraf";

export interface BotContext extends Context {
    myProp?: string;
    myOtherProp?: number;
}
