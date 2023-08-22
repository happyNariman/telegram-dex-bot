declare module 'process' {
    global {
        namespace NodeJS {
            interface ProcessEnv {
                NODE_ENV: 'development' | 'production' | 'test';
                TELEGRAM_BOT_TOKEN: string;
            }
        }
    }
}