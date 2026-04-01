import { Injectable } from '@nestjs/common';
import { AllIndicators, SignalType } from 'shared-types';

@Injectable()
export class RuleEngineService {
    analyze(indicators: AllIndicators): { signal: SignalType; confidence: number } {
        let score = 0;
        const { trend, momentum, volatility, volume, patterns } = indicators;

        // --- Momentum ---
        // RSI
        if (momentum.rsi !== null) {
            if (momentum.rsi < 30) score += 2;
            else if (momentum.rsi > 70) score -= 2;
        }

        // Williams %R
        if (momentum.williamsR !== null) {
            if (momentum.williamsR < -80) score += 1;
            else if (momentum.williamsR > -20) score -= 1;
        }

        // CCI
        if (momentum.cci !== null) {
            if (momentum.cci < -100) score += 1;
            else if (momentum.cci > 100) score -= 1;
        }

        // --- Trend ---
        // MACD histogram
        if (trend.macd.histogram !== null) {
            if (trend.macd.histogram > 0) score += 1;
            else if (trend.macd.histogram < 0) score -= 1;
        }

        // Price vs EMA9 — use close from PSAR as proxy; use ema9 vs ema21 as trend direction
        // We don't have direct close price in AllIndicators, so compare ema9 vs ema21
        if (trend.ema9 !== null && trend.ema21 !== null) {
            if (trend.ema9 > trend.ema21) score += 1;
            else if (trend.ema9 < trend.ema21) score -= 1;
        }

        // ADX — amplify score by 0.5 if trend is strong
        let adxAmplifier = 0;
        if (trend.adx !== null && trend.adx > 25) {
            adxAmplifier = score * 0.5;
        }

        // --- Volatility (Bollinger Bands) ---
        // Use ema9 as close proxy vs BB bands
        if (
            volatility.bbLower !== null &&
            volatility.bbUpper !== null &&
            trend.ema9 !== null
        ) {
            const bbRange = volatility.bbUpper - volatility.bbLower;
            if (bbRange > 0) {
                const position = (trend.ema9 - volatility.bbLower) / bbRange;
                if (position <= 0.2) score += 1;       // near lower band
                else if (position >= 0.8) score -= 1;  // near upper band
            }
        }

        // --- Volume ---
        // OBV
        if (volume.obv !== null) {
            if (volume.obv > 0) score += 1;
        }

        // MFI
        if (volume.mfi !== null) {
            if (volume.mfi < 20) score += 1;
            else if (volume.mfi > 80) score -= 1;
        }

        // --- Candlestick Patterns ---
        if (patterns.bullishEngulfing) score += 2;
        if (patterns.morningStar) score += 2;
        if (patterns.hammer) score += 2;
        if (patterns.bearishEngulfing) score -= 2;
        if (patterns.eveningStar) score -= 2;

        // Apply ADX amplifier
        score += adxAmplifier;

        // Max possible score (rough estimate for normalization):
        // RSI(2) + WilliamsR(1) + CCI(1) + MACD(1) + EMA(1) + ADX amplifier(~4) + BB(1) + OBV(1) + MFI(1) + patterns(6) = ~19
        const maxPossibleScore = 19;
        const confidence = Math.min(Math.abs(score) / maxPossibleScore, 1);

        const threshold = 2;
        let signal: SignalType;
        if (score > threshold) signal = SignalType.BUY;
        else if (score < -threshold) signal = SignalType.SELL;
        else signal = SignalType.HOLD;

        return { signal, confidence };
    }
}
