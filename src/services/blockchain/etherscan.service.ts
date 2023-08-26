import axios from 'axios';
import { Logger } from 'winston';
import { EtherscanTransactionResponse, EtherscanTransactionModel, EtherscanTokenTransactionModel, EtherscanTransactionBaseModel } from '@models/index.js';

export class EtherscanService {

    private url: string;

    constructor(private logger: Logger) {
        if (process.env.NODE_ENV === 'production') {
            this.url = 'https://api.etherscan.io/api';
        } else {
            this.url = 'https://api-sepolia.etherscan.io/api';
        }
    }

    async getTransactions(params: { address: string }): Promise<EtherscanTransactionModel[]> {
        if (!params || !params.address)
            throw new Error('Address must be provided.');

        const result = await this._loadTransactions<EtherscanTransactionModel>({
            action: 'txlist',
            module: 'account',
            address: params.address
        });

        return result;
    }

    async getTokenTransactions(params: { address?: string, contractaddress?: string }): Promise<EtherscanTokenTransactionModel[]> {
        if (!params || (!params.address && !params.contractaddress))
            throw new Error('At least one of \'address\' or \'contractaddress\' must be provided.');

        const result = await this._loadTransactions<EtherscanTokenTransactionModel>({
            action: 'tokentx',
            module: 'account',
            address: params.address,
            contractaddress: params.contractaddress
        });

        return result;
    }

    private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    private async _loadTransactions<T extends EtherscanTransactionBaseModel>(params: EtherscanTransactionParameters): Promise<T[]> {
        let allResults: T[] = [];
        params.apikey = `${process.env.ETHERSCAN_API_KEY}`;
        params.offset = 9999;
        params.sort = 'desc';
        params.page = 1;

        while (true) {
            try {
                const response = await axios.get<EtherscanTransactionResponse<T>>(this.url, {
                    params: params
                });

                const results = response.data.result;
                this.logger.debug(`${params.action}. page: ${params.page}; results.length: ${results?.length}`);

                if (!results || results.length === 0)
                    break;

                allResults = allResults.concat(results);
                params.page++;

                if (results.length < 9999)
                    break;
                else
                    await this.delay(300);

            } catch (error) {
                const message = error instanceof Error ? error.message : error;
                this.logger.error(`Error etherscan ${params.action}: ${message}`, { error, params });
                throw new Error('Error etherscan ${params.action}: ' + message);
            }
        }

        return allResults;
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
