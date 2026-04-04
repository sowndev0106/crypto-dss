import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignalEntity } from './signals.entity';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { SignalsGateway } from './signals.gateway';
import { SignalsScheduler } from './signals.scheduler';
import { BacktestingService } from './backtesting.service';
import { AnalyzerModule } from '../analyzer/analyzer.module';
import { OhlcvModule } from '../ohlcv/ohlcv.module';

@Module({
    imports: [TypeOrmModule.forFeature([SignalEntity]), AnalyzerModule, OhlcvModule],
    providers: [SignalsService, SignalsGateway, SignalsScheduler, BacktestingService],
    controllers: [SignalsController],
    exports: [SignalsService, SignalsGateway],
})
export class SignalsModule { }
