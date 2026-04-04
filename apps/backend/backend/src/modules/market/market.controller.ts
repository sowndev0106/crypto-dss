import { Controller, Get, Query, ServiceUnavailableException, Logger } from '@nestjs/common';
import axios from 'axios';
import { MarketContextService } from './market-context.service';
import { VolumeProfileService } from './volume-profile.service';
import { OrderBookData, OrderBookEntry } from './market.types';
import { OhlcvService } from '../ohlcv/ohlcv.service';

@Controller('market')
export class MarketController {
    private readonly logger = new Logger(MarketController.name);

    constructor(
        private readonly marketContextService: MarketContextService,
        private readonly volumeProfileService: VolumeProfileService,
        private readonly ohlcvService: OhlcvService,
    ) { }

    @Get('context')
    async getContext() {
        return this.marketContextService.getContext();
    }

    @Get('orderbook')
    async getOrderBook(@Query('symbol') symbol = 'ETHUSDT'): Promise<OrderBookData> {
        try {
            const res = await axios.get('https://api.binance.com/api/v3/depth', {
                params: { symbol, limit: 20 },
                timeout: 5000,
            });
            const bids: OrderBookEntry[] = res.data.bids.map(([price, qty]: string[]) => ({
                price: parseFloat(price),
                quantity: parseFloat(qty),
            }));
            const asks: OrderBookEntry[] = res.data.asks.map(([price, qty]: string[]) => ({
                price: parseFloat(price),
                quantity: parseFloat(qty),
            }));
            const spread = asks[0].price - bids[0].price;
            const spreadPercent = (spread / bids[0].price) * 100;
            return { bids, asks, spread, spreadPercent };
        } catch (err) {
            this.logger.error(`Failed to fetch order book for ${symbol}`, err);
            throw new ServiceUnavailableException(`Failed to fetch order book: ${(err as Error).message}`);
        }
    }

    @Get('volume-profile')
    async getVolumeProfile(
        @Query('symbol') symbol = 'ETHUSDT',
        @Query('timeframe') timeframe = '1h',
    ) {
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, 200);
        return this.volumeProfileService.calculate(candles);
    }
}
