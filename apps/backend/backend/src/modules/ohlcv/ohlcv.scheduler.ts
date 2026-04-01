import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BinanceService } from '../binance/binance.service';
import { OhlcvService } from './ohlcv.service';

@Injectable()
export class OhlcvScheduler implements OnModuleInit {
    private readonly logger = new Logger(OhlcvScheduler.name);
    private readonly SYMBOL = 'ETHUSDT';
    private readonly TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

    constructor(
        private readonly binanceService: BinanceService,
        private readonly ohlcvService: OhlcvService,
    ) { }

    async onModuleInit(): Promise<void> {
        this.logger.log('Fetching historical candles on startup...');
        for (const timeframe of this.TIMEFRAMES) {
            try {
                const candles = await this.binanceService.fetchKlines(this.SYMBOL, timeframe, 500);
                await this.ohlcvService.upsertCandles(candles);
                this.logger.log(`Fetched 500 historical candles for ${timeframe}`);
            } catch (error) {
                this.logger.error(`Failed to fetch historical candles for ${timeframe}: ${(error as Error).message}`);
            }
        }
    }

    @Cron('*/30 * * * * *')
    async fetchLatestCandles(): Promise<void> {
        for (const timeframe of this.TIMEFRAMES) {
            try {
                const candles = await this.binanceService.fetchKlines(this.SYMBOL, timeframe, 3);
                await this.ohlcvService.upsertCandles(candles);
            } catch (error) {
                this.logger.error(`Failed to fetch latest candles for ${timeframe}: ${(error as Error).message}`);
            }
        }
    }

    @Cron('0 2 * * 0')
    async cleanupOldData(): Promise<void> {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        try {
            const deleted = await this.ohlcvService.deleteOlderThan(twoYearsAgo);
            this.logger.log(`Cleaned up ${deleted} OHLCV records older than 2 years`);
        } catch (error) {
            this.logger.error(`Failed to cleanup old OHLCV data: ${(error as Error).message}`);
        }
    }
}
