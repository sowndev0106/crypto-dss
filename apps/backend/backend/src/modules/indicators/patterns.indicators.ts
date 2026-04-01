import { CandlestickPatterns } from 'shared-types';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';

export function calcPatterns(candles: OhlcvEntity[]): CandlestickPatterns {
    // candles are DESC (newest first), take last 3 most recent
    const recent = candles.slice(0, 3).reverse(); // chronological order: [oldest, middle, newest]

    const result: CandlestickPatterns = {
        doji: false,
        hammer: false,
        bullishEngulfing: false,
        bearishEngulfing: false,
        morningStar: false,
        eveningStar: false,
    };

    if (recent.length === 0) return result;

    const parse = (c: OhlcvEntity) => ({
        open: parseFloat(c.open as unknown as string),
        high: parseFloat(c.high as unknown as string),
        low: parseFloat(c.low as unknown as string),
        close: parseFloat(c.close as unknown as string),
    });

    const curr = parse(recent[recent.length - 1]);
    const prev = recent.length >= 2 ? parse(recent[recent.length - 2]) : null;
    const first = recent.length >= 3 ? parse(recent[0]) : null;

    // Doji: body < 10% of range
    const currRange = curr.high - curr.low;
    const currBody = Math.abs(curr.open - curr.close);
    if (currRange > 0 && currBody / currRange < 0.1) {
        result.doji = true;
    }

    // Hammer: lower shadow >= 2 * body, upper shadow <= 0.1 * body, bullish context (close > open)
    if (currBody > 0) {
        const upperShadow = curr.high - Math.max(curr.open, curr.close);
        const lowerShadow = Math.min(curr.open, curr.close) - curr.low;
        if (lowerShadow >= 2 * currBody && upperShadow <= 0.1 * currBody && curr.close > curr.open) {
            result.hammer = true;
        }
    }

    if (prev) {
        const prevBody = Math.abs(prev.open - prev.close);
        const prevBullish = prev.close > prev.open;
        const prevBearish = prev.close < prev.open;
        const currBullish = curr.close > curr.open;
        const currBearish = curr.close < curr.open;

        // Bullish Engulfing: current bullish, completely engulfs previous bearish
        if (currBullish && prevBearish && curr.open < prev.close && curr.close > prev.open) {
            result.bullishEngulfing = true;
        }

        // Bearish Engulfing: current bearish, completely engulfs previous bullish
        if (currBearish && prevBullish && curr.open > prev.close && curr.close < prev.open) {
            result.bearishEngulfing = true;
        }

        // Morning Star: 3-candle (bearish, small body, bullish)
        if (first) {
            const firstBearish = first.close < first.open;
            const firstBody = Math.abs(first.open - first.close);
            const smallBody = prevBody < firstBody * 0.3;

            if (firstBearish && smallBody && currBullish) {
                result.morningStar = true;
            }

            // Evening Star: 3-candle (bullish, small body, bearish)
            const firstBullish = first.close > first.open;
            if (firstBullish && smallBody && currBearish) {
                result.eveningStar = true;
            }
        }
    }

    return result;
}
