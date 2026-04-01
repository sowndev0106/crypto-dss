import { OBV, VWAP, MFI } from 'technicalindicators';
import { VolumeIndicators } from 'shared-types';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';

export function calcVolume(candles: OhlcvEntity[]): VolumeIndicators {
    const reversed = [...candles].reverse();
    const closes = reversed.map(c => parseFloat(c.close as unknown as string));
    const highs = reversed.map(c => parseFloat(c.high as unknown as string));
    const lows = reversed.map(c => parseFloat(c.low as unknown as string));
    const volumes = reversed.map(c => parseFloat(c.volume as unknown as string));

    let obv: number | null = null;
    try {
        const r = OBV.calculate({ close: closes, volume: volumes });
        obv = r.length > 0 ? r[r.length - 1] : null;
    } catch { obv = null; }

    let vwap: number | null = null;
    try {
        const r = VWAP.calculate({ high: highs, low: lows, close: closes, volume: volumes });
        vwap = r.length > 0 ? r[r.length - 1] : null;
    } catch { vwap = null; }

    let mfi: number | null = null;
    try {
        const r = MFI.calculate({ period: 14, high: highs, low: lows, close: closes, volume: volumes });
        mfi = r.length > 0 ? r[r.length - 1] : null;
    } catch { mfi = null; }

    let cmf: number | null = null;
    try {
        const period = 20;
        if (closes.length >= period) {
            let sumMfvVol = 0;
            let sumVol = 0;
            for (let i = closes.length - period; i < closes.length; i++) {
                const range = highs[i] - lows[i];
                const mfv = range !== 0
                    ? ((closes[i] - lows[i]) - (highs[i] - closes[i])) / range
                    : 0;
                sumMfvVol += mfv * volumes[i];
                sumVol += volumes[i];
            }
            cmf = sumVol !== 0 ? sumMfvVol / sumVol : null;
        }
    } catch { cmf = null; }

    return { obv, vwap, mfi, cmf };
}
