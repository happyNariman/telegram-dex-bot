import { ethers } from 'ethers';

import { logger } from '../../core/logger.js';
import { EthersService } from './ethers.service.js';

export class UniswapService {
    private ethersService: EthersService;
    private uniswapV2RouterAddress: string;
    private uniswapV3RouterAddress: string;

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.uniswapV2RouterAddress = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
            this.uniswapV3RouterAddress = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad';
        } else {
            this.uniswapV2RouterAddress = '0x86dcd3293c53cf8efd7303b57beb2a3f671dde98';
            this.uniswapV3RouterAddress = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad';
        }

        this.ethersService = new EthersService();
    }

    async getTransactions(walletAddress: string): Promise<ethers.TransactionResponse[]> {
        try {
            const transactions = await this.ethersService.getHistory(walletAddress);

            const dexTrades = transactions.filter(transaction =>
                [this.uniswapV3RouterAddress, this.uniswapV2RouterAddress].some(routerAddress =>
                    transaction.to == routerAddress || transaction.from == routerAddress)
            );

            return transactions;
        } catch (error: any) {
            logger.error('Error fetching transactions: ', { error, walletAddress });
            throw new Error('Error fetching transactions: ' + error?.message ?? error);
        }
    }
}
