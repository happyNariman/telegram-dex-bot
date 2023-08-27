export interface AnalysisTransactionModel {
    hash: string;
    //blockNumber: number;

    /** Dex type */
    dexType: string;
    /** Transaction Date */
    timeStamp: Date;

    /** Coin A contract address */
    fromContractAddress: string;
    /** Coin Ticker A */
    fromSymbol: string;
    //fromValue: number;

    /** Coin B contract address */
    toContractAddress: string;
    /** Coin Ticker B */
    toSymbol: string;
    //toValue: number;

    /** Pool contract address for this pair */
    poolContractAddress: string;
}
