import { useEffect, useState, useCallback } from 'react';
import { SignalResult } from 'shared-types';
import { fetchLatestSignal, fetchSignalHistory, generateSignal } from '../api/signals.api';
import { useSignalSocket } from '../hooks/useSignalSocket';
import { Topbar } from '../components/Topbar';
import { SignalCard } from '../components/SignalCard';
import { SkeletonSignalCard } from '../components/SkeletonSignalCard';
import { IndicatorPanel } from '../components/IndicatorPanel';
import { SkeletonIndicatorPanel } from '../components/SkeletonIndicatorPanel';
import { SignalHistory } from '../components/SignalHistory';
import { SignalToast } from '../components/SignalToast';

const SYMBOL = 'ETHUSDT';

export function Dashboard() {
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [currentSignal, setCurrentSignal] = useState<SignalResult | null>(null);
    const [history, setHistory] = useState<SignalResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [toast, setToast] = useState<SignalResult | null>(null);

    const { latestSignal, isConnected } = useSignalSocket(SYMBOL, selectedTimeframe);

    const loadData = useCallback(async (timeframe: string) => {
        setIsLoading(true);
        setIsHistoryLoading(true);
        try {
            const [signal, hist] = await Promise.all([
                fetchLatestSignal(SYMBOL, timeframe),
                fetchSignalHistory(SYMBOL, timeframe),
            ]);
            setCurrentSignal(signal);
            setHistory(hist);
        } catch (err) {
            console.error('Failed to load signal data', err);
        } finally {
            setIsLoading(false);
            setIsHistoryLoading(false);
        }
    }, []);

    // Load on mount and timeframe change
    useEffect(() => {
        loadData(selectedTimeframe);
    }, [selectedTimeframe, loadData]);

    // Handle real-time socket updates
    useEffect(() => {
        if (latestSignal) {
            setCurrentSignal(latestSignal);
            setHistory(prev => [latestSignal, ...prev]);
            setToast(latestSignal);
        }
    }, [latestSignal]);

    const handleTimeframeChange = (tf: string) => {
        setSelectedTimeframe(tf);
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            const signal = await generateSignal(SYMBOL, selectedTimeframe);
            setCurrentSignal(signal);
            setHistory(prev => [signal, ...prev]);
        } catch (err) {
            console.error('Failed to refresh signal', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            <Topbar
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
                isConnected={isConnected}
            />

            <div style={{ padding: 24 }}>
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
                    {/* Left: SignalCard */}
                    <div style={{ maxWidth: 400 }}>
                        {isLoading ? (
                            <SkeletonSignalCard />
                        ) : (
                            <SignalCard
                                signal={currentSignal}
                                isLoading={isLoading}
                                onRefresh={handleRefresh}
                            />
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

                {/* Signal History below main area */}
                <SignalHistory history={history} isLoading={isHistoryLoading} />
            </div>

            {/* Toast overlay */}
            {toast !== null && (
                <SignalToast signal={toast} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
