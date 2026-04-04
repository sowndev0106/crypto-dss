import { Controller, Get, Query } from '@nestjs/common';
import { OhlcvService } from './ohlcv.service';

@Controller('ohlcv')
export class OhlcvController {
    constructor(private readonly ohlcvService: OhlcvService) { }

    @Get('candles')
    async getCandles(
        @Query('symbol') symbol: string,
        @Query('timeframe') timeframe: string,
        @Query('limit') limit = 200,
    ) {
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, Number(limit));
        return candles.reverse(); // chronological order
    }
}
