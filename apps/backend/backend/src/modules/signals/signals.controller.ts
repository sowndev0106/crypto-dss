import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { AnalyzerService } from '../analyzer/analyzer.service';

@Controller('signals')
export class SignalsController {
    constructor(
        private readonly signalsService: SignalsService,
        private readonly analyzerService: AnalyzerService,
    ) { }

    @Post('generate')
    async generate(@Body() body: { symbol: string; timeframe: string }) {
        const result = await this.analyzerService.analyzeTimeframe(body.symbol, body.timeframe);
        const { signal } = await this.signalsService.saveIfChanged(result);
        return signal;
    }

    @Get('latest')
    async getLatest(
        @Query('symbol') symbol: string,
        @Query('timeframe') timeframe: string,
    ) {
        return this.signalsService.getLatest(symbol, timeframe);
    }

    @Get('history')
    async getHistory(
        @Query('symbol') symbol: string,
        @Query('timeframe') timeframe: string,
        @Query('limit') limit = 50,
    ) {
        return this.signalsService.getHistory(symbol, timeframe, Number(limit));
    }
}
