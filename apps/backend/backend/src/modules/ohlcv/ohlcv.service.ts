import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OhlcvEntity } from './ohlcv.entity';
import { OhlcvCandle } from 'shared-types';

@Injectable()
export class OhlcvService {
    constructor(
        @InjectRepository(OhlcvEntity)
        private readonly ohlcvRepository: Repository<OhlcvEntity>,
    ) { }

    async upsertCandles(candles: OhlcvCandle[]): Promise<void> {
        if (candles.length === 0) return;
        await this.ohlcvRepository
            .createQueryBuilder()
            .insert()
            .into(OhlcvEntity)
            .values(candles)
            .orIgnore()
            .execute();
    }

    async getCandles(symbol: string, timeframe: string, limit: number): Promise<OhlcvEntity[]> {
        return this.ohlcvRepository.find({
            where: { symbol, timeframe },
            order: { openTime: 'DESC' },
            take: limit,
        });
    }

    async getLatestCandle(symbol: string, timeframe: string): Promise<OhlcvEntity | null> {
        return this.ohlcvRepository.findOne({
            where: { symbol, timeframe },
            order: { openTime: 'DESC' },
        });
    }

    async deleteOlderThan(date: Date): Promise<number> {
        const result = await this.ohlcvRepository
            .createQueryBuilder()
            .delete()
            .from(OhlcvEntity)
            .where('openTime < :cutoff', { cutoff: date.getTime() })
            .execute();
        return result.affected ?? 0;
    }
}
