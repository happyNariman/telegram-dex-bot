import { Logger } from 'winston';
import { EthersService } from './ethers.service.js';
import { EtherscanTransactionModel } from '@models/index.js';

export class UniswapService {
    static readonly V3_ROUTER_ADDRESS = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad';
    static readonly V2_ROUTER_ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';

    private ethersService: EthersService;
    private allowedAdresses: string[] = [
        UniswapService.V3_ROUTER_ADDRESS,
        UniswapService.V2_ROUTER_ADDRESS
    ];

    constructor(private logger: Logger) {
        if (process.env.NODE_ENV === 'production') {

        } else {
            this.allowedAdresses.push('0x86dcd3293c53cf8efd7303b57beb2a3f671dde98'); // sepolia uniswapV2Router
        }

        this.ethersService = new EthersService(logger);
    }

    async getTransactions(walletAddress: string): Promise<EtherscanTransactionModel[]> {
        try {
            const transactions = await this.ethersService.getHistory(walletAddress);

            const dexTrades = transactions.filter(transaction =>
                this.allowedAdresses.some(routerAddress =>
                    transaction.to == routerAddress || transaction.from == routerAddress)
            );

            return dexTrades;
        } catch (error: any) {
            this.logger.error('Error fetching transactions: ', { error, walletAddress });
            throw new Error('Error fetching transactions: ' + error?.message ?? error);
        }
    }
}
