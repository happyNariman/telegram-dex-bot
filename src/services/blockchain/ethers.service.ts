import { ethers } from 'ethers';

import { logger } from '../../core/logger.js';
import { CustomInfuraProvider } from './providers/index.js';

export class EthersService {
    private provider: CustomInfuraProvider;
    private signer: ethers.Wallet;
    private network: string;

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.network = 'ethereum';
        } else {
            this.network = 'sepolia';
        }

        this.provider = new CustomInfuraProvider(this.network, process.env.INFURA_API_KEY);
        this.signer = new ethers.Wallet(`${process.env.WALLET_PRIVATE_KEY}`, this.provider);
    }

    async getHistory(walletAddress: string): Promise<ethers.TransactionResponse[]> {
        try {
            const transactions = await this.provider.getHistory(walletAddress);
            return transactions;
        } catch (error: any) {
            logger.error('Error fetching History transactions: ', { error, walletAddress });
            throw new Error('Error fetching History transactions: ' + error?.message ?? error);
        }
    }
}
