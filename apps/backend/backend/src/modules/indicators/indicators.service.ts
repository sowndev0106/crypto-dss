import { Injectable } from '@nestjs/common';
import { AllIndicators } from 'shared-types';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { calcTrend } from './trend.indicators';
import { calcMomentum } from './momentum.indicators';
import { calcVolatility } from './volatility.indicators';
import { calcVolume } from './volume.indicators';
import { calcPatterns } from './patterns.indicators';
import { calcSupportResistance } from './sr.indicators';
import { calcRiskHints } from './risk.indicators';

@Injectable()
export class IndicatorsService {
    calculate(candles: OhlcvEntity[]): AllIndicators {
        const trend = calcTrend(candles);
        const momentum = calcMomentum(candles);
        const volatility = calcVolatility(candles);
        const volume = calcVolume(candles);
        const patterns = calcPatterns(candles);

        const lastCandle = candles[candles.length - 1];
        const closePrice = lastCandle ? parseFloat(lastCandle.close as unknown as string) : null;

        const sr = calcSupportResistance(candles);
        const riskHints = closePrice !== null ? calcRiskHints(closePrice, volatility.atr) : null;

        return {
            trend,
            momentum,
            volatility,
            volume,
            patterns,
            closePrice,
            supportLevels: sr.support,
            resistanceLevels: sr.resistance,
            riskHints,
        };
    }
}
