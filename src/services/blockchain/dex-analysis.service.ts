import { Logger } from 'winston';
import { EtherscanService } from './etherscan.service.js';
import { EtherscanTransactionBaseModel, EtherscanTokenTransactionModel, AnalysisTransactionModel, EtherscanTransactionType } from '../../models/index.js';

export class DexAnalysisService {
    static readonly V3_ROUTER_ADDRESS = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad';
    static readonly V2_ROUTER_ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
    static readonly NETWORK_TOKEN_NAME = 'Ethereum';
    static readonly NETWORK_TOKEN_SYMBOL = 'ETH';
    static readonly NETWORK_TOKEN_DECIMAL = 18;

    private etherscanService: EtherscanService;
    private allowedAdresses: string[] = [
        DexAnalysisService.V3_ROUTER_ADDRESS,
        DexAnalysisService.V2_ROUTER_ADDRESS
    ];

    constructor(private logger: Logger) {
        if (process.env.NODE_ENV === 'production') {

        } else {
            this.allowedAdresses.push('0x86dcd3293c53cf8efd7303b57beb2a3f671dde98'); // sepolia uniswapV2Router
        }

        this.etherscanService = new EtherscanService(logger);
    }

    async analyzeTransactions(address: string, network: string): Promise<AnalysisTransactionModel[]> {
        address = address.toLowerCase();
        const result: AnalysisTransactionModel[] = [];

        const [tokenAllTransactions, hashMapTransactions] = await Promise.all([
            this.etherscanService.getTokenTransactions({ address, network }),
            this.etherscanService.getTransactions({ address, network })
                .then(txs => txs.filter(tx =>
                    this.allowedAdresses.some(routerAddress =>
                        tx.to == routerAddress || tx.from == routerAddress)))
                .then(txs => {
                    const hashMaps = new Map<string, EtherscanTransactionBaseModel[]>();
                    txs.forEach(tx => hashMaps.set(tx.hash, [tx]));
                    return hashMaps;
                }),
        ]);

        tokenAllTransactions.forEach(tx => {
            if (hashMapTransactions.has(tx.hash)) {
                hashMapTransactions.get(tx.hash)!.push(tx);
            }
        });


        hashMapTransactions.forEach((txs, hash) => {

            const initialCollectorTransactionData: CollectorTransactionDataModel = {
                blockNumber: txs[0].blockNumber,
                timeStamp: txs[0].timeStamp,
                dexType: 'Uniswap',
                hash: hash,
                from: [],
                to: []
            };

            const collectorTransaction = txs.reduce<CollectorTransactionDataModel>((accumulator, tx) => {
                if (!tx.value || tx.isError === '1')
                    return accumulator;

                const tokenTransaction = tx.transactionType === EtherscanTransactionType.TokenTransaction ? tx as EtherscanTokenTransactionModel : null;
                const symbol = tokenTransaction?.tokenSymbol ?? DexAnalysisService.NETWORK_TOKEN_SYMBOL;
                const collectorInternalTransaction: CollectorInternalTransactionModel = {
                    from: tx.from,
                    to: tx.to,
                    contractAddress: tx.contractAddress,
                    tokenName: tokenTransaction?.tokenName ?? DexAnalysisService.NETWORK_TOKEN_NAME,
                    tokenSymbol: symbol,
                    tokenDecimal: tokenTransaction?.tokenDecimal ?? DexAnalysisService.NETWORK_TOKEN_DECIMAL,
                    value: tx.value
                };

                if (tx.from === address) // outgoing transaction
                    accumulator.from.push(collectorInternalTransaction);
                else if (tx.to === address) // incoming transaction
                    accumulator.to.push(collectorInternalTransaction);
                else
                    this.logger.error('\n\n !!! Unknown transaction', { tx });

                return accumulator;
            }, initialCollectorTransactionData);

            if (collectorTransaction.from.length === 0)
                return;

            //this.logger.info('\n\n\n item', { collectorTransaction });

            result.push({
                hash: collectorTransaction.hash,
                dexType: collectorTransaction.dexType,
                timeStamp: collectorTransaction.timeStamp,
                fromContractAddress: [...new Set(collectorTransaction.from.map(p => p.contractAddress))].join(', '),
                fromSymbol: [...new Set(collectorTransaction.from.map(p => p.tokenSymbol))].join(', '),
                toContractAddress: [...new Set(collectorTransaction.to.map(p => p.contractAddress))].join(', '),
                toSymbol: [...new Set(collectorTransaction.to.map(p => p.tokenSymbol))].join(', '),
                poolContractAddress: [...new Set(collectorTransaction.to.map(p => p.from))].join(', '),
            } as AnalysisTransactionModel);
        });

        return result;
    }

}

interface CollectorTransactionDataModel {
    hash: string;
    blockNumber: number;
    timeStamp: Date;
    dexType: string;

    from: CollectorInternalTransactionModel[];
    to: CollectorInternalTransactionModel[];

}

interface CollectorInternalTransactionModel {
    from: string;
    to: string;
    contractAddress: string;

    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: number;
    value: bigint;
}
