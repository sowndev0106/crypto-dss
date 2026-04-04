import { CandlestickChart } from './CandlestickChart';
import { OhlcvCandle } from '../api/signals.api';
import { SignalResult } from 'shared-types';

interface Props {
    candles: OhlcvCandle[];
    timeframe: string;
    isLoading: boolean;
    signals?: SignalResult[];
    srLevels?: { support: number[]; resistance: number[] };
}

export function ChartPanel({ candles, timeframe, isLoading, signals = [], srLevels }: Props) {
    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 8,
            border: '1px solid var(--border)',
            padding: 16,
            marginBottom: 24,
        }}>
            {isLoading ? (
                <div style={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    background: 'var(--bg-elevated)',
                    borderRadius: 6,
                }}>
                    Loading chart...
                </div>
            ) : (
                <CandlestickChart candles={candles} timeframe={timeframe} signals={signals} srLevels={srLevels} />
            )}
        </div>
    );
}
