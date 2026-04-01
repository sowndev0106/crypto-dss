import { AllIndicators } from 'shared-types';

export function buildPrompt(data: Map<string, AllIndicators>): string {
    const lines: string[] = ['Multi-timeframe technical analysis for ETH/USDT:\n'];

    for (const [timeframe, indicators] of data.entries()) {
        const { trend, momentum, volatility, volume, patterns } = indicators;

        lines.push(`## Timeframe: ${timeframe}`);

        // Trend
        lines.push(
            `Trend — EMA9: ${trend.ema9 ?? 'N/A'}, EMA21: ${trend.ema21 ?? 'N/A'}, EMA50: ${trend.ema50 ?? 'N/A'}, EMA200: ${trend.ema200 ?? 'N/A'}`,
        );
        lines.push(
            `MACD: ${trend.macd.value ?? 'N/A'} | Signal: ${trend.macd.signal ?? 'N/A'} | Histogram: ${trend.macd.histogram ?? 'N/A'}`,
        );
        lines.push(`ADX: ${trend.adx ?? 'N/A'}, PSAR: ${trend.psar ?? 'N/A'}`);
        lines.push(
            `Ichimoku — Tenkan: ${trend.ichimoku.tenkan ?? 'N/A'}, Kijun: ${trend.ichimoku.kijun ?? 'N/A'}, SenkouA: ${trend.ichimoku.senkouA ?? 'N/A'}, SenkouB: ${trend.ichimoku.senkouB ?? 'N/A'}`,
        );

        // Momentum
        lines.push(
            `Momentum — RSI: ${momentum.rsi ?? 'N/A'}, StochRSI K/D: ${momentum.stochRsiK ?? 'N/A'}/${momentum.stochRsiD ?? 'N/A'}`,
        );
        lines.push(
            `Williams %R: ${momentum.williamsR ?? 'N/A'}, CCI: ${momentum.cci ?? 'N/A'}, ROC: ${momentum.roc ?? 'N/A'}`,
        );

        // Volatility
        lines.push(
            `Bollinger Bands — Upper: ${volatility.bbUpper ?? 'N/A'}, Mid: ${volatility.bbMiddle ?? 'N/A'}, Lower: ${volatility.bbLower ?? 'N/A'}, ATR: ${volatility.atr ?? 'N/A'}`,
        );

        // Volume
        lines.push(
            `Volume — OBV: ${volume.obv ?? 'N/A'}, VWAP: ${volume.vwap ?? 'N/A'}, MFI: ${volume.mfi ?? 'N/A'}, CMF: ${volume.cmf ?? 'N/A'}`,
        );

        // Patterns
        const activePatterns: string[] = [];
        if (patterns.doji) activePatterns.push('Doji');
        if (patterns.hammer) activePatterns.push('Hammer');
        if (patterns.bullishEngulfing) activePatterns.push('Bullish Engulfing');
        if (patterns.bearishEngulfing) activePatterns.push('Bearish Engulfing');
        if (patterns.morningStar) activePatterns.push('Morning Star');
        if (patterns.eveningStar) activePatterns.push('Evening Star');
        lines.push(`Patterns: ${activePatterns.length > 0 ? activePatterns.join(', ') : 'None'}`);

        lines.push('');
    }

    lines.push(
        'Based on this multi-timeframe analysis, provide a trading signal for ETH/USDT. Respond ONLY with valid JSON: {"signal": "BUY"|"SELL"|"HOLD", "confidence": 0.0-1.0, "reasoning": "brief explanation"}',
    );

    return lines.join('\n');
}
