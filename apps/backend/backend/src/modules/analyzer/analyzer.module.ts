import { Module } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { DeepSeekService } from './deepseek.service';
import { AnalyzerService } from './analyzer.service';
import { IndicatorsModule } from '../indicators/indicators.module';
import { OhlcvModule } from '../ohlcv/ohlcv.module';

@Module({
    imports: [IndicatorsModule, OhlcvModule],
    providers: [RuleEngineService, DeepSeekService, AnalyzerService],
    exports: [AnalyzerService],
})
export class AnalyzerModule { }
