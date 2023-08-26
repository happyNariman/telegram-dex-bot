import { InfuraProvider, Networkish, BlockTag } from 'ethers';
import { Logger } from 'winston';
import fetch from 'node-fetch';
import { EtherscanTransactionModel } from '@models/index.js';

// https://ethereum.stackexchange.com/questions/147756/read-transaction-history-with-ethers-v6-1-0
export class CustomInfuraProvider extends InfuraProvider {

    private url: string;

    constructor(private logger: Logger, _network?: Networkish, projectId?: null | string, projectSecret?: null | string) {
        super(_network, projectId, projectSecret);

        //if (process.env.NODE_ENV === 'production') {
        this.url = 'https://api.etherscan.io/api';
        // } else {
        //     this.url = 'https://api-sepolia.etherscan.io/api';
        // }
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getHistory(address: string): Promise<EtherscanTransactionModel[]> {
        let page = 1;
        let allResults: EtherscanTransactionModel[] = [];

        while (true) {
            try {
                const queryParams = new URLSearchParams({
                    action: 'txlist',
                    module: 'account',
                    address: address,
                    apikey: `${process.env.ETHERSCAN_API_KEY}`,
                    offset: '9999',
                    page: page.toString(),
                    sort: 'desc'
                });

                const response = await fetch(`${this.url}?${queryParams.toString()}`);
                if (!response.ok) {
                    this.logger.error(`Fetching etherscan txlist failed with status: ${response.status}`, { queryParams, response });
                    throw new Error(`Fetching etherscan failed with status: ${response.status}`);
                }

                const data: any = await response.json();
                const results = data.result;

                console.log('page: ' + page + '; results.length: ' + results?.length, !data.result ? data : null);

                if (!results || results.length === 0) {
                    break;
                }

                allResults = allResults.concat(results);
                page++;

                if (results.length < 9999) {
                    break;
                }

                await this.delay(300);

            } catch (error) {
                const message = error instanceof Error ? error.message : error;
                this.logger.error(`Error fetching etherscan txlist transactions: ${message}`, { error, address, page });
                throw new Error('Error fetching etherscan txlist transactions: ' + message);
            }
        }

        return allResults;
    }

}
