import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AnalyzerService } from '../analyzer/analyzer.service';
import { SignalsService } from './signals.service';
import { SignalsGateway } from './signals.gateway';

const SYMBOL = 'ETHUSDT';
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

@Injectable()
export class SignalsScheduler implements OnModuleInit {
    private readonly logger = new Logger(SignalsScheduler.name);

    constructor(
        private readonly analyzerService: AnalyzerService,
        private readonly signalsService: SignalsService,
        private readonly signalsGateway: SignalsGateway,
    ) { }

    onModuleInit() {
        this.logger.log('SignalsScheduler initialized');
    }

    @Cron('*/30 * * * * *')
    async runAnalysis() {
        for (const timeframe of TIMEFRAMES) {
            try {
                const result = await this.analyzerService.analyzeTimeframe(SYMBOL, timeframe);
                const { saved, signal } = await this.signalsService.saveIfChanged(result);

                if (saved) {
                    this.signalsGateway.emitSignalChanged(signal);
                }
            } catch (error) {
                this.logger.error(`Analysis failed for ${SYMBOL} ${timeframe}: ${error.message}`);
            }
        }
    }
}
