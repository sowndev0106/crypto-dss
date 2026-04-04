import { useEffect, useState, useCallback } from 'react';
import { SignalResult } from 'shared-types';
import { fetchLatestSignal, fetchSignalHistory, generateSignal, fetchCandles, OhlcvCandle } from '../api/signals.api';
import { useSignalSocket } from '../hooks/useSignalSocket';
import { Topbar } from '../components/Topbar';
import { SignalCard } from '../components/SignalCard';
import { SkeletonSignalCard } from '../components/SkeletonSignalCard';
import { IndicatorPanel } from '../components/IndicatorPanel';
import { SkeletonIndicatorPanel } from '../components/SkeletonIndicatorPanel';
import { SignalHistory } from '../components/SignalHistory';
import { SignalToast } from '../components/SignalToast';
import { ChartPanel } from '../components/ChartPanel';
import { MarketContextPanel } from '../components/MarketContextPanel';
import { AlertPanel } from '../components/AlertPanel';
import { BacktestingPanel } from '../components/BacktestingPanel';
import { ConfluenceView } from '../components/ConfluenceView';
import { RiskManagementPanel } from '../components/RiskManagementPanel';

const SYMBOL = 'ETHUSDT';

export function Dashboard() {
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [currentSignal, setCurrentSignal] = useState<SignalResult | null>(null);
    const [history, setHistory] = useState<SignalResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [toast, setToast] = useState<SignalResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [candles, setCandles] = useState<OhlcvCandle[]>([]);
    const [isCandlesLoading, setIsCandlesLoading] = useState(false);

    const { latestSignal, isConnected } = useSignalSocket(SYMBOL, selectedTimeframe);

    const loadData = useCallback(async (timeframe: string) => {
        setIsLoading(true);
        setIsHistoryLoading(true);
        setIsCandlesLoading(true);
        setError(null);
        try {
            const [signal, hist, cdls] = await Promise.all([
                fetchLatestSignal(SYMBOL, timeframe),
                fetchSignalHistory(SYMBOL, timeframe),
                fetchCandles(SYMBOL, timeframe, 200),
            ]);
            setCurrentSignal(signal);
            setHistory(hist);
            setCandles(cdls);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to load signal data: ${msg}`);
        } finally {
            setIsLoading(false);
            setIsHistoryLoading(false);
            setIsCandlesLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(selectedTimeframe);
    }, [selectedTimeframe, loadData]);

    useEffect(() => {
        if (latestSignal) {
            setCurrentSignal(latestSignal);
            setHistory(prev => [latestSignal, ...prev.filter(s => s.id !== latestSignal.id)]);
            setToast(latestSignal);
        }
    }, [latestSignal]);

    const handleTimeframeChange = (tf: string) => {
        setSelectedTimeframe(tf);
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const signal = await generateSignal(SYMBOL, selectedTimeframe);
            setCurrentSignal(signal);
            setHistory(prev => [signal, ...prev.filter(s => s.id !== signal.id)]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to generate signal: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const srLevels = currentSignal?.indicators
        ? {
            support: currentSignal.indicators.supportLevels ?? [],
            resistance: currentSignal.indicators.resistanceLevels ?? [],
        }
        : undefined;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            <Topbar
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
                isConnected={isConnected}
                onRefresh={() => loadData(selectedTimeframe)}
            />

            <div style={{ padding: 24 }}>
                {error && (
                    <div style={{
                        background: 'rgba(255,59,48,0.12)',
                        border: '1px solid rgba(255,59,48,0.4)',
                        borderRadius: 8,
                        padding: '10px 16px',
                        marginBottom: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: '#ff3b30',
                    }}>
                        <span>⚠ {error}</span>
                        <button
                            onClick={() => setError(null)}
                            style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                        >×</button>
                    </div>
                )}

                {/* Market Context */}
                <MarketContextPanel />

                {/* Chart */}
                <ChartPanel
                    candles={candles}
                    timeframe={selectedTimeframe}
                    isLoading={isCandlesLoading}
                    signals={history}
                    srLevels={srLevels}
                />

                {/* Main 2-column grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 400px) 1fr',
                        gap: 24,
                        marginBottom: 24,
                    }}
                    className="dashboard-grid"
                >
                    {/* Left: SignalCard + RiskManagement */}
                    <div style={{ maxWidth: 400 }}>
                        {isLoading ? (
                            <SkeletonSignalCard />
                        ) : (
                            <>
                                <SignalCard
                                    signal={currentSignal}
                                    isLoading={isLoading}
                                    onRefresh={handleRefresh}
                                />
                                <RiskManagementPanel
                                    signal={currentSignal?.signal ?? null}
                                    riskHints={currentSignal?.indicators?.riskHints}
                                />
                            </>
                        )}
                    </div>

                    {/* Right: IndicatorPanel */}
                    <div>
                        {isLoading ? (
                            <SkeletonIndicatorPanel />
                        ) : (
                            <IndicatorPanel
                                indicators={currentSignal?.indicators ?? null}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>

                {/* Confluence View */}
                <ConfluenceView latestSignal={latestSignal} />

                {/* Bottom row: Backtesting + Alerts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="dashboard-grid">
                    <BacktestingPanel timeframe={selectedTimeframe} />
                    <AlertPanel />
                </div>

                {/* Signal History */}
                <SignalHistory history={history} isLoading={isHistoryLoading} />
            </div>

            {toast !== null && (
                <SignalToast signal={toast} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
