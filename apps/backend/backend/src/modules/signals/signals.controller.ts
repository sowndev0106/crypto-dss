import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { AnalyzerService } from '../analyzer/analyzer.service';
import { OhlcvService } from '../ohlcv/ohlcv.service';
import { BacktestingService } from './backtesting.service';
import { Timeframe } from 'shared-types';

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

@Controller('signals')
export class SignalsController {
    constructor(
        private readonly signalsService: SignalsService,
        private readonly analyzerService: AnalyzerService,
        private readonly ohlcvService: OhlcvService,
        private readonly backtestingService: BacktestingService,
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

    @Get('candles')
    async getCandles(
        @Query('symbol') symbol = 'ETHUSDT',
        @Query('timeframe') timeframe = '1h',
        @Query('limit') limit = 200,
    ) {
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, Number(limit));
        // Return sorted ascending by openTime for chart rendering
        return [...candles].sort((a, b) => Number(a.openTime) - Number(b.openTime));
    }

    @Get('confluence')
    async getConfluence(@Query('symbol') symbol = 'ETHUSDT') {
        const results = await Promise.all(
            TIMEFRAMES.map(tf => this.signalsService.getLatest(symbol, tf)),
        );
        return results.map((signal, i) => signal ?? { symbol, timeframe: TIMEFRAMES[i] as Timeframe, signal: null });
    }

    @Get('backtest')
    async getBacktest(
        @Query('symbol') symbol = 'ETHUSDT',
        @Query('timeframe') timeframe = '1h',
    ) {
        return this.backtestingService.backtest(symbol, timeframe);
    }
}
