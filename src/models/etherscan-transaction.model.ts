export interface EtherscanTransactionResponse<Model extends EtherscanTransactionBaseModel> {
    status: string;
    message: string;
    result?: Model[];
}

export interface EtherscanTransactionBaseModel {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
}

export interface EtherscanTransactionModel extends EtherscanTransactionBaseModel {
    isError: string;
    txreceipt_status: string;
    methodId: string;
    functionName: string;
}

export interface EtherscanTokenTransactionModel extends EtherscanTransactionBaseModel {
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
}

export interface EtherscanInternalTransactionModel extends EtherscanTransactionBaseModel {
    type: string;
    traceId: string;
    isError: string;
    errCode: string;
}
