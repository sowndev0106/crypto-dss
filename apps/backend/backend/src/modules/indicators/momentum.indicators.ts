import { RSI, StochasticRSI, Stochastic, WilliamsR, CCI, ROC } from 'technicalindicators';
import { MomentumIndicators } from 'shared-types';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';

export function calcMomentum(candles: OhlcvEntity[]): MomentumIndicators {
    const reversed = [...candles].reverse();
    const closes = reversed.map(c => parseFloat(c.close as unknown as string));
    const highs = reversed.map(c => parseFloat(c.high as unknown as string));
    const lows = reversed.map(c => parseFloat(c.low as unknown as string));

    let rsi: number | null = null;
    try {
        const r = RSI.calculate({ period: 14, values: closes });
        rsi = r.length > 0 ? r[r.length - 1] : null;
    } catch { rsi = null; }

    let stochRsiK: number | null = null;
    let stochRsiD: number | null = null;
    try {
        const r = StochasticRSI.calculate({
            rsiPeriod: 14,
            stochasticPeriod: 14,
            kPeriod: 3,
            dPeriod: 3,
            values: closes,
        });
        if (r.length > 0) {
            const last = r[r.length - 1];
            stochRsiK = last.k ?? null;
            stochRsiD = last.d ?? null;
        }
    } catch { stochRsiK = null; stochRsiD = null; }

    let stochK: number | null = null;
    let stochD: number | null = null;
    try {
        const r = Stochastic.calculate({
            period: 14,
            signalPeriod: 3,
            high: highs,
            low: lows,
            close: closes,
        });
        if (r.length > 0) {
            const last = r[r.length - 1];
            stochK = last.k ?? null;
            stochD = last.d ?? null;
        }
    } catch { stochK = null; stochD = null; }

    let williamsR: number | null = null;
    try {
        const r = WilliamsR.calculate({ period: 14, high: highs, low: lows, close: closes });
        williamsR = r.length > 0 ? r[r.length - 1] : null;
    } catch { williamsR = null; }

    let cci: number | null = null;
    try {
        const r = CCI.calculate({ period: 20, high: highs, low: lows, close: closes });
        cci = r.length > 0 ? r[r.length - 1] : null;
    } catch { cci = null; }

    let roc: number | null = null;
    try {
        const r = ROC.calculate({ period: 12, values: closes });
        roc = r.length > 0 ? r[r.length - 1] : null;
    } catch { roc = null; }

    return { rsi, stochRsiK, stochRsiD, stochK, stochD, williamsR, cci, roc };
}
