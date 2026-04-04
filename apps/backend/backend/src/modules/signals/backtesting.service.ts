import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignalType } from 'shared-types';
import { SignalEntity } from './signals.entity';
import { OhlcvService } from '../ohlcv/ohlcv.service';

const MIN_SIGNALS = 10;

export interface BacktestResult {
    symbol: string;
    timeframe: string;
    totalSignals: number;
    winCount: number;
    lossCount: number;
    ruleWinRate: number | null;
    deepseekWinRate: number | null;
    insufficientData: boolean;
}

@Injectable()
export class BacktestingService {
    constructor(
        @InjectRepository(SignalEntity)
        private readonly signalRepository: Repository<SignalEntity>,
        private readonly ohlcvService: OhlcvService,
    ) { }

    async backtest(symbol: string, timeframe: string): Promise<BacktestResult> {
        const signals = await this.signalRepository.find({
            where: { symbol, timeframe },
            order: { createdAt: 'ASC' },
        });

        const tradingSignals = signals.filter(
            s => s.signal === SignalType.BUY || s.signal === SignalType.SELL,
        );

        if (tradingSignals.length < MIN_SIGNALS) {
            return {
                symbol,
                timeframe,
                totalSignals: tradingSignals.length,
                winCount: 0,
                lossCount: 0,
                ruleWinRate: null,
                deepseekWinRate: null,
                insufficientData: true,
            };
        }

        const candles = await this.ohlcvService.getCandles(symbol, timeframe, 1000);
        const candleMap = new Map(candles.map(c => [Number(c.openTime), parseFloat(c.close as unknown as string)]));
        const sortedTimes = [...candleMap.keys()].sort((a, b) => a - b);

        let ruleWins = 0;
        let ruleLosses = 0;
        let aiWins = 0;
        let aiLosses = 0;

        for (const signal of tradingSignals) {
            const signalTime = new Date(signal.createdAt).getTime();
            // Find the next candle after signal time
            const nextTime = sortedTimes.find(t => t > signalTime);
            if (!nextTime) continue;

            const nextClose = candleMap.get(nextTime);
            const signalClose = signal.indicators?.closePrice;
            if (!nextClose || !signalClose) continue;

            const priceWentUp = nextClose > signalClose;

            // Rule signal win/loss
            if (signal.ruleSignal === SignalType.BUY || signal.ruleSignal === SignalType.SELL) {
                const ruleWin = signal.ruleSignal === SignalType.BUY ? priceWentUp : !priceWentUp;
                if (ruleWin) ruleWins++; else ruleLosses++;
            }

            // AI signal win/loss
            if (signal.deepseekSignal === SignalType.BUY || signal.deepseekSignal === SignalType.SELL) {
                const aiWin = signal.deepseekSignal === SignalType.BUY ? priceWentUp : !priceWentUp;
                if (aiWin) aiWins++; else aiLosses++;
            }
        }

        const ruleTotal = ruleWins + ruleLosses;
        const aiTotal = aiWins + aiLosses;

        return {
            symbol,
            timeframe,
            totalSignals: tradingSignals.length,
            winCount: ruleWins,
            lossCount: ruleLosses,
            ruleWinRate: ruleTotal >= MIN_SIGNALS ? ruleWins / ruleTotal : null,
            deepseekWinRate: aiTotal >= MIN_SIGNALS ? aiWins / aiTotal : null,
            insufficientData: false,
        };
    }
}
