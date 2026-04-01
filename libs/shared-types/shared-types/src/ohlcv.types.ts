import { Timeframe } from './signal.types';

export interface OhlcvCandle {
    symbol: string;
    timeframe: Timeframe;
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: number;
}
