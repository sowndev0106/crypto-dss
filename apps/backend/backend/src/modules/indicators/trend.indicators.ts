import { EMA, MACD, ADX, PSAR, IchimokuCloud } from 'technicalindicators';

function calcDEMA(period: number, values: number[]): number[] {
    const ema1 = EMA.calculate({ period, values });
    if (ema1.length < period) return [];
    const ema2 = EMA.calculate({ period, values: ema1 });
    return ema2.map((e2, i) => 2 * ema1[i + (ema1.length - ema2.length)] - e2);
}

function calcTEMA(period: number, values: number[]): number[] {
    const ema1 = EMA.calculate({ period, values });
    if (ema1.length < period) return [];
    const ema2 = EMA.calculate({ period, values: ema1 });
    if (ema2.length < period) return [];
    const ema3 = EMA.calculate({ period, values: ema2 });
    const offset1 = ema1.length - ema3.length;
    const offset2 = ema2.length - ema3.length;
    return ema3.map((e3, i) => 3 * ema1[i + offset1] - 3 * ema2[i + offset2] + e3);
}
import { TrendIndicators } from 'shared-types';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';

export function calcTrend(candles: OhlcvEntity[]): TrendIndicators {
    const reversed = [...candles].reverse();
    const closes = reversed.map(c => parseFloat(c.close as unknown as string));
    const highs = reversed.map(c => parseFloat(c.high as unknown as string));
    const lows = reversed.map(c => parseFloat(c.low as unknown as string));

    let ema9: number | null = null;
    try {
        const r = EMA.calculate({ period: 9, values: closes });
        ema9 = r.length > 0 ? r[r.length - 1] : null;
    } catch { ema9 = null; }

    let ema21: number | null = null;
    try {
        const r = EMA.calculate({ period: 21, values: closes });
        ema21 = r.length > 0 ? r[r.length - 1] : null;
    } catch { ema21 = null; }

    let ema50: number | null = null;
    try {
        const r = EMA.calculate({ period: 50, values: closes });
        ema50 = r.length > 0 ? r[r.length - 1] : null;
    } catch { ema50 = null; }

    let ema200: number | null = null;
    try {
        const r = EMA.calculate({ period: 200, values: closes });
        ema200 = r.length > 0 ? r[r.length - 1] : null;
    } catch { ema200 = null; }

    let dema9: number | null = null;
    try {
        const r = calcDEMA(9, closes);
        dema9 = r.length > 0 ? r[r.length - 1] : null;
    } catch { dema9 = null; }

    let tema9: number | null = null;
    try {
        const r = calcTEMA(9, closes);
        tema9 = r.length > 0 ? r[r.length - 1] : null;
    } catch { tema9 = null; }

    let macd: TrendIndicators['macd'] = { value: null, signal: null, histogram: null };
    try {
        const r = MACD.calculate({
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            values: closes,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });
        if (r.length > 0) {
            const last = r[r.length - 1];
            macd = {
                value: last.MACD ?? null,
                signal: last.signal ?? null,
                histogram: last.histogram ?? null,
            };
        }
    } catch { macd = { value: null, signal: null, histogram: null }; }

    let adx: number | null = null;
    try {
        const r = ADX.calculate({ period: 14, high: highs, low: lows, close: closes });
        adx = r.length > 0 ? r[r.length - 1].adx : null;
    } catch { adx = null; }

    let psar: number | null = null;
    try {
        const r = PSAR.calculate({ step: 0.02, max: 0.2, high: highs, low: lows });
        psar = r.length > 0 ? r[r.length - 1] : null;
    } catch { psar = null; }

    let ichimoku: TrendIndicators['ichimoku'] = { tenkan: null, kijun: null, senkouA: null, senkouB: null };
    try {
        const r = IchimokuCloud.calculate({
            conversionPeriod: 9,
            basePeriod: 26,
            spanPeriod: 52,
            displacement: 26,
            high: highs,
            low: lows,
        });
        if (r.length > 0) {
            const last = r[r.length - 1];
            ichimoku = {
                tenkan: last.conversion ?? null,
                kijun: last.base ?? null,
                senkouA: last.spanA ?? null,
                senkouB: last.spanB ?? null,
            };
        }
    } catch { ichimoku = { tenkan: null, kijun: null, senkouA: null, senkouB: null }; }

    return { ema9, ema21, ema50, ema200, dema9, tema9, macd, adx, psar, ichimoku };
}
