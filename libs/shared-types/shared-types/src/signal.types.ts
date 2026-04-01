export enum SignalType {
    BUY = 'BUY',
    SELL = 'SELL',
    HOLD = 'HOLD',
}

export enum Timeframe {
    ONE_MINUTE = '1m',
    FIVE_MINUTES = '5m',
    FIFTEEN_MINUTES = '15m',
    ONE_HOUR = '1h',
    FOUR_HOURS = '4h',
    ONE_DAY = '1d',
}

export interface SignalResult {
    id: number;
    symbol: string;
    timeframe: Timeframe;
    createdAt: Date;
    signal: SignalType;
    confidence: number;
    ruleSignal: SignalType | null;
    deepseekSignal: SignalType | null;
    deepseekReasoning: string | null;
    indicators: import('./indicator.types').AllIndicators;
}
