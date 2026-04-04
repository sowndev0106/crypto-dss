export interface FearGreedData {
    value: number;
    label: string;
}

export interface MarketContext {
    fearGreedIndex: FearGreedData | null;
    btcDominance: number | null;
    fundingRate: number | null;
}

export interface OrderBookEntry {
    price: number;
    quantity: number;
}

export interface OrderBookData {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    spread: number;
    spreadPercent: number;
}

export interface VolumeProfileBucket {
    priceLevel: number;
    volume: number;
}
