import { InfuraProvider, ethers } from 'ethers';
import { Logger } from 'winston';

export class EthersService {
    private provider: InfuraProvider;
    private signer: ethers.Wallet;
    private network: string;

    constructor(private logger: Logger) {
        if (process.env.NODE_ENV === 'production') {
            this.network = 'ethereum';
        } else {
            this.network = 'sepolia';
        }

        this.provider = new InfuraProvider(this.network, process.env.INFURA_API_KEY);
        this.signer = new ethers.Wallet(`${process.env.WALLET_PRIVATE_KEY}`, this.provider);
    }

    getBalance(walletAddress: string): Promise<bigint> {
        return this.provider.getBalance(walletAddress);
    }

}
