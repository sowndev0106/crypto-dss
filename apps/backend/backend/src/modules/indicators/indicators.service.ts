import { Injectable } from '@nestjs/common';
import { AllIndicators } from 'shared-types';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { calcTrend } from './trend.indicators';
import { calcMomentum } from './momentum.indicators';
import { calcVolatility } from './volatility.indicators';
import { calcVolume } from './volume.indicators';
import { calcPatterns } from './patterns.indicators';

@Injectable()
export class IndicatorsService {
    calculate(candles: OhlcvEntity[]): AllIndicators {
        return {
            trend: calcTrend(candles),
            momentum: calcMomentum(candles),
            volatility: calcVolatility(candles),
            volume: calcVolume(candles),
            patterns: calcPatterns(candles),
        };
    }
}
