import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignalEntity } from './signals.entity';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { SignalsGateway } from './signals.gateway';
import { SignalsScheduler } from './signals.scheduler';
import { AnalyzerModule } from '../analyzer/analyzer.module';

@Module({
    imports: [TypeOrmModule.forFeature([SignalEntity]), AnalyzerModule],
    providers: [SignalsService, SignalsGateway, SignalsScheduler],
    controllers: [SignalsController],
    exports: [SignalsService],
})
export class SignalsModule { }
