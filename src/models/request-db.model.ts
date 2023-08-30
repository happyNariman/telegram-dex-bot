import { Timestamp } from 'firebase-admin/firestore';

export interface RequestDBModel {
    timestamp: Timestamp;
    walletAddress: string;
    network: string;
}
