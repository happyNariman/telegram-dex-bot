import { InfuraProvider, Networkish, BlockTag } from 'ethers';
import fetch from 'node-fetch';
import { logger } from '../../../core/logger.js';

// https://ethereum.stackexchange.com/questions/147756/read-transaction-history-with-ethers-v6-1-0
export class CustomInfuraProvider extends InfuraProvider {

    private url: string;

    constructor(_network?: Networkish, projectId?: null | string, projectSecret?: null | string) {
        super(_network, projectId, projectSecret);

        if (process.env.NODE_ENV === 'production') {
            this.url = 'https://api.etherscan.io/api';
        } else {
            this.url = 'https://api-sepolia.etherscan.io/api';
        }
    }

    async getHistory(address: string, startBlock?: BlockTag, endBlock?: BlockTag): Promise<any[]> {
        const queryParams = new URLSearchParams({
            action: 'txlist',
            address: address,
            module: 'account',
            startblock: (startBlock ? startBlock : 0).toString(),
            endblock: (endBlock ? endBlock : 99999999).toString(),
            apikey: `${process.env.ETHERSCAN_API_KEY}`,
            page: '1',
            offset: '10',
            sort: 'desc'
        });

        const response = await fetch(`${this.url}?${queryParams.toString()}`);
        if (!response.ok) {
            logger.error(`Request getHistory failed with status: ${response.status}`, { queryParams });
            throw new Error(`Request getHistory failed with status: ${response.status}`);
        }

        const data: any = await response.json();
        return data.result;
    }
}
