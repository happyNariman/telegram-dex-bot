import { Logger } from 'winston';
import { EtherscanService } from './etherscan.service.js';
import { EtherscanTransactionModel } from '@models/index.js';

export class UniswapService {
    static readonly V3_ROUTER_ADDRESS = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad';
    static readonly V2_ROUTER_ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';

    private etherscanService: EtherscanService;
    private allowedAdresses: string[] = [
        UniswapService.V3_ROUTER_ADDRESS,
        UniswapService.V2_ROUTER_ADDRESS
    ];

    constructor(private logger: Logger) {
        if (process.env.NODE_ENV === 'production') {

        } else {
            this.allowedAdresses.push('0x86dcd3293c53cf8efd7303b57beb2a3f671dde98'); // sepolia uniswapV2Router
        }

        this.etherscanService = new EtherscanService(logger);
    }

    async analyzeTransactions(address: string): Promise<any[]> {
        const result: any = [];

        const [dexTransactions, tokenAllTransactions] = await Promise.all([
            this.etherscanService.getTransactions({ address })
                .then(trxs => trxs.filter(trx =>
                    this.allowedAdresses.some(routerAddress =>
                        trx.to == routerAddress || trx.from == routerAddress))),
            this.etherscanService.getTokenTransactions({ address })
        ]);

        // const dexTransactions = transactions.filter(transaction =>
        //     this.allowedAdresses.some(routerAddress =>
        //         transaction.to == routerAddress || transaction.from == routerAddress)
        // );

        const transactionHashes = dexTransactions.reduce((hashes, item) => {
            hashes[item.hash] = true;
            return hashes;
        }, {} as Record<string, boolean>);

        const tokenTransactions = tokenAllTransactions.filter(trx => transactionHashes[trx.hash]);


        this.logger.info('\n\ntransactions', { length: dexTransactions.length, dexTransactions });
        this.logger.info('\n\ntokenTransactions', { length: tokenTransactions.length, tokenTransactions });


        return dexTransactions;
    }

}
