import { OhlcvEntity } from '../ohlcv/ohlcv.entity';

const MIN_CANDLES = 50;
const WINDOW = 10;
const MAX_LEVELS = 3;

export function calcSupportResistance(candles: OhlcvEntity[]): { support: number[]; resistance: number[] } {
    if (candles.length < MIN_CANDLES) {
        return { support: [], resistance: [] };
    }

    const highs = candles.map(c => parseFloat(c.high as unknown as string));
    const lows = candles.map(c => parseFloat(c.low as unknown as string));
    const closePrice = parseFloat(candles[candles.length - 1].close as unknown as string);

    const pivotHighs: number[] = [];
    const pivotLows: number[] = [];

    for (let i = WINDOW; i < candles.length - WINDOW; i++) {
        const high = highs[i];
        const low = lows[i];

        const isHighest = highs.slice(i - WINDOW, i).every(h => h <= high) &&
            highs.slice(i + 1, i + WINDOW + 1).every(h => h <= high);
        if (isHighest) pivotHighs.push(high);

        const isLowest = lows.slice(i - WINDOW, i).every(l => l >= low) &&
            lows.slice(i + 1, i + WINDOW + 1).every(l => l >= low);
        if (isLowest) pivotLows.push(low);
    }

    // Support: pivot lows below current price, sorted by distance ascending
    const support = pivotLows
        .filter(l => l < closePrice)
        .sort((a, b) => Math.abs(a - closePrice) - Math.abs(b - closePrice))
        .slice(0, MAX_LEVELS);

    // Resistance: pivot highs above current price, sorted by distance ascending
    const resistance = pivotHighs
        .filter(h => h > closePrice)
        .sort((a, b) => Math.abs(a - closePrice) - Math.abs(b - closePrice))
        .slice(0, MAX_LEVELS);

    return { support, resistance };
}
