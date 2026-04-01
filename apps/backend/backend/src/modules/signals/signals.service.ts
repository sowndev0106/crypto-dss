import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignalResult } from 'shared-types';
import { SignalEntity } from './signals.entity';

@Injectable()
export class SignalsService {
    constructor(
        @InjectRepository(SignalEntity)
        private readonly signalRepository: Repository<SignalEntity>,
    ) { }

    async saveIfChanged(
        result: Omit<SignalResult, 'id' | 'createdAt'>,
    ): Promise<{ saved: boolean; signal: SignalEntity }> {
        const latest = await this.getLatest(result.symbol, result.timeframe as string);

        if (latest && latest.signal === result.signal) {
            return { saved: false, signal: latest };
        }

        const entity = this.signalRepository.create({
            symbol: result.symbol,
            timeframe: result.timeframe as string,
            signal: result.signal,
            confidence: result.confidence,
            ruleSignal: result.ruleSignal,
            deepseekSignal: result.deepseekSignal,
            deepseekReasoning: result.deepseekReasoning,
            indicators: result.indicators,
        });

        const saved = await this.signalRepository.save(entity);
        await this.pruneOldSignals(result.symbol, result.timeframe as string);

        return { saved: true, signal: saved };
    }

    async getLatest(symbol: string, timeframe: string): Promise<SignalEntity | null> {
        return this.signalRepository.findOne({
            where: { symbol, timeframe },
            order: { createdAt: 'DESC' },
        });
    }

    async getHistory(
        symbol: string,
        timeframe: string,
        limit: number,
        offset = 0,
    ): Promise<SignalEntity[]> {
        return this.signalRepository.find({
            where: { symbol, timeframe },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }

    async pruneOldSignals(symbol: string, timeframe: string, maxCount = 200): Promise<void> {
        const count = await this.signalRepository.count({ where: { symbol, timeframe } });

        if (count <= maxCount) return;

        const excess = count - maxCount;
        const oldest = await this.signalRepository.find({
            where: { symbol, timeframe },
            order: { createdAt: 'ASC' },
            take: excess,
        });

        if (oldest.length > 0) {
            await this.signalRepository.remove(oldest);
        }
    }
}
