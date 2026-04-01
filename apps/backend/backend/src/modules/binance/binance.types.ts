// Binance raw kline array format: [openTime, open, high, low, close, volume, closeTime, ...]
export type BinanceRawKline = [
    number,  // openTime
    string,  // open
    string,  // high
    string,  // low
    string,  // close
    string,  // volume
    number,  // closeTime
    string,  // quoteAssetVolume
    number,  // numberOfTrades
    string,  // takerBuyBaseAssetVolume
    string,  // takerBuyQuoteAssetVolume
    string,  // ignore
];
