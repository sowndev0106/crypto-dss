export interface TrendIndicators {
    ema9: number | null;
    ema21: number | null;
    ema50: number | null;
    ema200: number | null;
    dema9: number | null;
    tema9: number | null;
    macd: { value: number | null; signal: number | null; histogram: number | null };
    adx: number | null;
    psar: number | null;
    ichimoku: {
        tenkan: number | null;
        kijun: number | null;
        senkouA: number | null;
        senkouB: number | null;
    };
}

export interface MomentumIndicators {
    rsi: number | null;
    stochRsiK: number | null;
    stochRsiD: number | null;
    stochK: number | null;
    stochD: number | null;
    williamsR: number | null;
    cci: number | null;
    roc: number | null;
}

export interface VolatilityIndicators {
    bbUpper: number | null;
    bbMiddle: number | null;
    bbLower: number | null;
    atr: number | null;
}

export interface VolumeIndicators {
    obv: number | null;
    vwap: number | null;
    mfi: number | null;
    cmf: number | null;
}

export interface CandlestickPatterns {
    doji: boolean;
    hammer: boolean;
    bullishEngulfing: boolean;
    bearishEngulfing: boolean;
    morningStar: boolean;
    eveningStar: boolean;
}

export interface AllIndicators {
    trend: TrendIndicators;
    momentum: MomentumIndicators;
    volatility: VolatilityIndicators;
    volume: VolumeIndicators;
    patterns: CandlestickPatterns;
}
