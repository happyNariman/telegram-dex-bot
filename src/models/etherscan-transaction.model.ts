export interface EtherscanTransactionResponse<Model extends EtherscanTransactionBaseModel> {
    status: string;
    message: string;
    result?: Model[];
}

export enum EtherscanTransactionType {
    Transaction = 'transaction',
    InternalTransaction = 'internalTransaction',
    TokenTransaction = 'tokenTransaction',
    TokenNFTTransaction = 'tokenNFTTransaction',
}

export interface EtherscanTransactionBaseModel {
    transactionType: EtherscanTransactionType;

    blockNumber: number;
    timeStamp: Date;
    hash: string;
    blockHash: string;
    from: string;
    to: string;
    value: bigint;
    contractAddress: string;
    isError?: string; // from EtherscanTransactionModel

    //* don't need
    //nonce: string;
    //transactionIndex: string;
    //gas: string;
    //gasPrice: string;
    //input: string;
    //cumulativeGasUsed: string;
    //gasUsed: string;
    //confirmations: string;
}

export interface EtherscanTransactionModel extends EtherscanTransactionBaseModel {
    //txreceipt_status: string;
    //methodId: string;
    //functionName: string;
}

export interface EtherscanTokenTransactionModel extends EtherscanTransactionBaseModel {
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: number;
}

export interface EtherscanInternalTransactionModel extends EtherscanTransactionBaseModel {
    type: string;
    traceId: string;
    isError: string;
    errCode: string;
}
