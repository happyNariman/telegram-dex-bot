import axios from 'axios';
import { Logger } from 'winston';
import {
    EtherscanTransactionResponse,
    EtherscanTransactionModel,
    EtherscanTokenTransactionModel,
    EtherscanTransactionBaseModel,
    EtherscanTransactionType
} from '../../models/index.js';

export class EtherscanService {

    constructor(private logger: Logger) { }

    async getTransactions(params: { network: string, address: string }): Promise<EtherscanTransactionModel[]> {
        if (!params || !params.address)
            throw new Error('Address must be provided.');
        if (!params.network)
            throw new Error('Network must be provided.');

        const loadParams = {
            action: 'txlist',
            module: 'account',
            address: params.address
        };
        const result = await this._loadTransactions<EtherscanTransactionModel>(params.network, loadParams,
            (tx: any, index, array) => {
                tx.transactionType = EtherscanTransactionType.Transaction;
                tx.timeStamp = new Date(parseInt(tx.timeStamp) * 1000);
                tx.value = BigInt(tx.value);
                return tx;
            });

        return result;
    }

    async getTokenTransactions(params: { network: string, address?: string, contractaddress?: string }): Promise<EtherscanTokenTransactionModel[]> {
        if (!params || (!params.address && !params.contractaddress))
            throw new Error('At least one of \'address\' or \'contractaddress\' must be provided.');
        if (!params.network)
            throw new Error('Network must be provided.');

        const loadParams = {
            action: 'tokentx',
            module: 'account',
            address: params.address,
            contractaddress: params.contractaddress
        };
        const result = await this._loadTransactions<EtherscanTokenTransactionModel>(params.network, loadParams,
            (tx: any, index, array) => {
                tx.transactionType = EtherscanTransactionType.TokenTransaction;
                tx.timeStamp = new Date(parseInt(tx.timeStamp) * 1000);
                tx.tokenDecimal = Number(tx.tokenDecimal);
                tx.value = BigInt(tx.value);
                return tx;
            });

        return result;
    }

    private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    private async _loadTransactions<T extends EtherscanTransactionBaseModel>(
        network: string,
        params: EtherscanTransactionParameters,
        mapFn: (value: T, index: number, array: T[]) => T
    ): Promise<T[]> {
        let allResults: T[] = [];
        params.apikey = `${process.env.ETHERSCAN_API_KEY}`;
        params.offset = 9999;
        params.sort = 'desc';
        params.page = 1;

        while (true) {
            try {
                const response = await axios.get<EtherscanTransactionResponse<any>>(this.getApiUrl(network), {
                    params: params
                });

                const results = response.data.result;
                this.logger.debug(`${params.action}. page: ${params.page}; results.length: ${results?.length}`);

                if (!results || results.length === 0)
                    break;

                allResults = allResults.concat(results.map(mapFn));
                params.page++;

                if (results.length < 9999)
                    break;
                else
                    await this.delay(300);

            } catch (error) {
                const message = error instanceof Error ? error.message : error;
                this.logger.error(`Error etherscan ${params.action}: ${message}`, { error, params });
                throw new Error(`Error etherscan ${params.action}: ${message}`);
            }
        }

        return allResults;
    }

    private getApiUrl(network: string) {
        if (network === 'eth')
            return 'https://api.etherscan.io/api';
        else if (network === 'goerli')
            return 'https://api-goerli.etherscan.io/api';
        else if (network === 'sepolia')
            return 'https://api-sepolia.etherscan.io/api';
        else
            throw new Error('Invalid network');
    }

}

interface EtherscanTransactionParameters {
    action: string;
    module: string;
    address?: string;
    contractaddress?: string;
    apikey?: string;
    offset?: number;
    page?: number;
    sort?: string;
}
