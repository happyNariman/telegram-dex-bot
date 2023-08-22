declare module 'process' {
    global {
        namespace NodeJS {
            interface ProcessEnv {
                NODE_ENV: 'development' | 'production' | 'test';
                TELEGRAM_BOT_TOKEN: string;
                ADMIN_TELEGRAM_IDS: number[]; // Telegram account ids who are administrators

                FIREBASE_PROJECT_ID: string;
                FIREBASE_CLIENT_EMAIL: string;
                FIREBASE_PRIVATE_KEY: string;
            }
        }
    }
}