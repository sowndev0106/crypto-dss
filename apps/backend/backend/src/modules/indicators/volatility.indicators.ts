import { BollingerBands, ATR } from 'technicalindicators';
import { VolatilityIndicators } from 'shared-types';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';

export function calcVolatility(candles: OhlcvEntity[]): VolatilityIndicators {
    const reversed = [...candles].reverse();
    const closes = reversed.map(c => parseFloat(c.close as unknown as string));
    const highs = reversed.map(c => parseFloat(c.high as unknown as string));
    const lows = reversed.map(c => parseFloat(c.low as unknown as string));

    let bbUpper: number | null = null;
    let bbMiddle: number | null = null;
    let bbLower: number | null = null;
    try {
        const r = BollingerBands.calculate({ period: 20, stdDev: 2, values: closes });
        if (r.length > 0) {
            const last = r[r.length - 1];
            bbUpper = last.upper ?? null;
            bbMiddle = last.middle ?? null;
            bbLower = last.lower ?? null;
        }
    } catch { bbUpper = null; bbMiddle = null; bbLower = null; }

    let atr: number | null = null;
    try {
        const r = ATR.calculate({ period: 14, high: highs, low: lows, close: closes });
        atr = r.length > 0 ? r[r.length - 1] : null;
    } catch { atr = null; }

    return { bbUpper, bbMiddle, bbLower, atr };
}
