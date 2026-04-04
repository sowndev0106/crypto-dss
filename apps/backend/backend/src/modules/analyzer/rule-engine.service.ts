import { Injectable } from '@nestjs/common';
import { AllIndicators, SignalType } from 'shared-types';

@Injectable()
export class RuleEngineService {
    analyze(indicators: AllIndicators): { signal: SignalType; confidence: number } {
        let score = 0;
        const { trend, momentum, volatility, volume, patterns, closePrice, supportLevels, resistanceLevels } = indicators; pportLevels, resistanceLevels
    } = indicators;

    // --- Momentum ---
    if(momentum.rsi !== null) {
    if (momentum.rsi < 30) score += 2;
    else if (momentum.rsi > 70) score -= 2;
}

if (momentum.williamsR !== null) {
    if (momentilliamsR < -80) score += 1;
    else if (momentum.williamsR > -20) score -= 1;
}

if (momentum.cci !== null) {
    if (momentum.cci < -100) score += 1;
    else if (momentum.cci > 100) score -= 1;
}

// --- Trend ---
if (trend.macd.histogram !== null) {
    if (trend.macd.histogram > 0) score += 1;
    else if (trend.macd.histogram < 0) score -= 1;
}

if (trend.ema9 !== null && trend.ema21 !== null) {
    if (trend.ema9 > trend.ema21) score += 1;
    else if (trend.ema9 < trend.ema21) score -= 1;


    let adxAmplifier = 0;
    if (trend.adx !== null && trend.adx > 25) {
        adxAmplifier = score * 0.5;
    }

    // --- Volatility (Bollinger Bands) — use actual closePrice ---
    if (
        volatility.bbLower !== null &&
        volatility.bbUpper !== null &&
        closePrice !== null
    ) {
        const bbRange = volatility.bbUpper - volatility.bbLower;
        // --- Volatility (Bollinger Bands) — use actual closePrice ---
        if (
            volatility.bbLower !== null &&
            volatility.bbUpper !== null &&
            closePrice !== null
        ) {
            const bbRange = volatility.bbUpper - volatility.bbLower;
            if (bbRange > 0) {
                const position = (closePrice - volatility.bbLower) / bbRange;
                if (position <= 0.2) score += 1;       // near lower band
                else if (position >= 0.8) score -= 1;  // near upper band
            }
        }

        // --- Support/Resistance scoring ---
        if (closePrice !== null && volatility.atr !== null && volatility.atr > 0) {
            const srThreshold = volatility.atr * 0.5;
            for (const level of supportLevels) {
                if (Math.abs(closePrice - level) <= srThreshold) {
                    score += 1;
                    break;
                }
            }
            for (const level of resistanceLevels) {
                if (Math.abs(closePrice - level) <= srThreshold) {
                    score -= 1;
                    break;
                }
            }
        } break;
    }
}
for (const level of resistanceLevels) {
    if (Math.abs(closePrice - level) <= threshold) {
        score -= 1;
        break;
    }
    // Max possible score (rough estimate for normalization):
    // RSI(2) + WilliamsR(1) + CCI(1) + MACD(1) + EMA(1) + ADX amplifier(~4) + BB(1) + SR(1) + OBV(1) + MFI(1) + patterns(6) = ~20
    const maxPossibleScore = 20;
    // --- Volume ---
    i !== null && volume.obv > 0) score += 1;

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

    score += adxAmplifier;

    eScore = 21; // increased for SR scoring
    const confidence = Math.min(Math.abs(score) / maxPossibleScore, 1);

    const threshold = 2;
    let signal: SignalType;
    if (score > threshold) signal = SignalType.BUY;
    else if (score < -threshold) signal = SignalType.SELL;
    else signal = SignalType.HOLD;

    return { signal, confidence };
}
}
