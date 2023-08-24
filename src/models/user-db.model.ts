export interface UserDBModel {
    /** Telegram user id */
    id: string;
    /** Telegram username */
    username?: string;
    /** Telegram user first name */
    first_name: string;
    /** User's or bot's last name */
    last_name?: string;
    /** User's role */
    role: UserRole;
}

export enum UserRole {
    New = 'new',
    User = 'user',
    Analyst = 'analyst'
}
