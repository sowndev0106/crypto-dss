import { Injectable } from '@nestjs/common';
import { SignalResult, SignalType, Timeframe } from 'shared-types';
import { OhlcvService } from '../ohlcv/ohlcv.service';
import { IndicatorsService } from '../indicators/indicators.service';
import { RuleEngineService } from './rule-engine.service';
import { DeepSeekService } from './deepseek.service';
import { MarketContextService } from '../market/market-context.service';

@Injectable()
export class AnalyzerService {
    constructor(
        private readonly ohlcvService: OhlcvService,
        private readonly indicatorsService: IndicatorsService,
        private readonly ruleEngineService: RuleEngineService,
        private readonly deepSeekService: DeepSeekService,
        private readonly marketContextService: MarketContextService,
    ) { }

    async analyzeTimeframe(symbol: string, timeframe: string): Promise<Omit<SignalResult, 'id' | 'createdAt'>> {
        // 1. Get 500 candles
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, 500);

        // 2. Calculate indicators
        const indicators = this.indicatorsService.calculate(candles);

        // 3. Build multi-timeframe data map
        const data = new Map([[timeframe, indicators]]);

        // 4. Fetch market context and run rule engine + deepseek in parallel
        const [ruleResult, deepseekResult] = await Promise.all([
            Promise.resolve(this.ruleEngineService.analyze(indicators)),
            (async () => {
                const marketContext = await this.marketContextService.getContext();
                return this.deepSeekService.analyze(data, marketContext);
            })(),
        ]);

        // 5. Combine confidence: rule * 0.4 + deepseek * 0.6
        const confidence = ruleResult.confidence * 0.4 + deepseekResult.confidence * 0.6;

        // 6. Determine final signal via weighted score
        const signalToScore = (s: SignalType): number =>
            s === SignalType.BUY ? 1 : s === SignalType.SELL ? -1 : 0;

        const weightedScore =
            signalToScore(ruleResult.signal) * 0.4 +
            signalToScore(deepseekResult.signal) * 0.6;

        let signal: SignalType;
        if (weightedScore > 0.2) signal = SignalType.BUY;
        else if (weightedScore < -0.2) signal = SignalType.SELL;
        else signal = SignalType.HOLD;

        // 7. Return SignalResult (without id/createdAt)
        return {
            symbol,
            timeframe: timeframe as Timeframe,
            signal,
            confidence,
            ruleSignal: ruleResult.signal,
            deepseekSignal: deepseekResult.signal,
            deepseekReasoning: deepseekResult.reasoning,
            indicators,
        };
    }
}
