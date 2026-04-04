import { RiskHints } from 'shared-types';

const SL_MULTIPLIER = 1.5;
const TP_MULTIPLIER = 3.0;

export function calcRiskHints(closePrice: number, atr: number | null): RiskHints | null {
    if (atr === null || atr <= 0) return null;

    const stopLoss = closePrice - atr * SL_MULTIPLIER;
    const takeProfit = closePrice + atr * TP_MULTIPLIER;
    const riskRewardRatio = (takeProfit - closePrice) / (closePrice - stopLoss);

    return { stopLoss, takeProfit, riskRewardRatio };
}
