import { AllIndicators } from 'shared-types';
import { MarketContext } from '../market/market.types';

export function buildPrompt(data: Map<string, AllIndicators>, marketContext?: MarketContext): string {
    const lines: string[] = ['Multi-timeframe technical analysis for ETH/USDT:\n'];

    for (const [timeframe, indicators] of data.entries()) {
        const { trend, momentum, volatility, volume, patterns, closePrice, supportLevels, resistanceLevels, riskHints } = indicators;

        lines.push(`## Timeframe: ${timeframe}`);

        if (closePrice !== null && closePrice !== undefined) {
            lines.push(`Close Price: ${closePrice}`);
        }

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

        // Support/Resistance
        if (supportLevels?.length > 0 || resistanceLevels?.length > 0) {
            lines.push(`Support Levels: ${supportLevels?.join(', ') || 'N/A'}`);
            lines.push(`Resistance Levels: ${resistanceLevels?.join(', ') || 'N/A'}`);
        }

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

        // Risk Management hints
        if (riskHints) {
            lines.push(
                `Risk Management — Stop Loss: ${riskHints.stopLoss.toFixed(2)}, Take Profit: ${riskHints.takeProfit.toFixed(2)}, R/R: 1:${riskHints.riskRewardRatio.toFixed(1)}`,
            );
        }

        lines.push('');
    }

    // Market Context section
    if (marketContext) {
        lines.push('## Market Context');
        if (marketContext.fearGreedIndex) {
            lines.push(`Fear & Greed Index: ${marketContext.fearGreedIndex.value} (${marketContext.fearGreedIndex.label})`);
        }
        if (marketContext.btcDominance !== null && marketContext.btcDominance !== undefined) {
            lines.push(`BTC Dominance: ${marketContext.btcDominance.toFixed(1)}%`);
        }
        if (marketContext.fundingRate !== null && marketContext.fundingRate !== undefined) {
            lines.push(`ETH Funding Rate: ${(marketContext.fundingRate * 100).toFixed(4)}%`);
        }
        lines.push('');
    }

    lines.push(
        'Based on this multi-timeframe analysis, provide a trading signal for ETH/USDT. Consider the market context and risk management levels. Respond ONLY with valid JSON: {"signal": "BUY"|"SELL"|"HOLD", "confidence": 0.0-1.0, "reasoning": "brief explanation including stop-loss and take-profit confirmation"}',
    );

    return lines.join('\n');
}
