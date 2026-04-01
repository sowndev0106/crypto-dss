import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { OhlcvCandle, Timeframe } from 'shared-types';
import { BinanceRawKline } from './binance.types';

@Injectable()
export class BinanceService {
    private readonly logger = new Logger(BinanceService.name);
    private readonly baseUrl = 'https://api.binance.com/api/v3/klines';

    async fetchKlines(
        symbol: string,
        interval: string,
        limit = 500,
        startTime?: number,
        endTime?: number,
    ): Promise<OhlcvCandle[]> {
        try {
            const params: Record<string, string | number> = { symbol, interval, limit };
            if (startTime !== undefined) params.startTime = startTime;
            if (endTime !== undefined) params.endTime = endTime;

            const response = await axios.get<BinanceRawKline[]>(this.baseUrl, { params });

            return response.data.map((raw): OhlcvCandle => ({
                symbol,
                timeframe: interval as Timeframe,
                openTime: raw[0],
                open: parseFloat(raw[1]),
                high: parseFloat(raw[2]),
                low: parseFloat(raw[3]),
                close: parseFloat(raw[4]),
                volume: parseFloat(raw[5]),
                closeTime: raw[6],
            }));
        } catch (error) {
            this.logger.error(`Failed to fetch klines for ${symbol} ${interval}: ${(error as Error).message}`);
            throw error;
        }
    }
}
