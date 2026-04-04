import { Module } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { DeepSeekService } from './deepseek.service';
import { AnalyzerService } from './analyzer.service';
import { IndicatorsModule } from '../indicators/indicators.module';
import { OhlcvModule } from '../ohlcv/ohlcv.module';
import { MarketModule } from '../market/market.module';

@Module({
    imports: [IndicatorsModule, OhlcvModule, MarketModule],
    providers: [RuleEngineService, DeepSeekService, AnalyzerService],
    exports: [AnalyzerService],
})
export class AnalyzerModule { }
