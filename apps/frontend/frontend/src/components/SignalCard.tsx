import { SignalResult, SignalType } from 'shared-types';
import { ConfidenceGauge } from './ConfidenceGauge';
import { SignalBadge } from './SignalBadge';

interface Props {
    signal: SignalResult | null;
    isLoading: boolean;
    onRefresh: () => void;
}

const SIGNAL_COLORS: Record<SignalType, string> = {
    [SignalType.BUY]: 'var(--buy)',
    [SignalType.SELL]: 'var(--sell)',
    [SignalType.HOLD]: 'var(--hold)',
};

export function SignalCard({ signal, isLoading, onRefresh }: Props) {
    const signalClass = signal ? signal.signal.toLowerCase() : '';

    return (
        <div className={`signal-card ${signalClass}`}>
            {/* Gauge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                {signal ? (
                    <ConfidenceGauge confidence={signal.confidence} signal={signal.signal} />
                ) : (
                    <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>—</span>
                    </div>
                )}
            </div>

            {/* Signal Type */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 64,
                        color: signal ? SIGNAL_COLORS[signal.signal] : 'var(--text-muted)',
                        lineHeight: 1,
                    }}
                >
                    {signal ? signal.signal : '—'}
                </span>
            </div>

            {/* Rule vs AI comparison */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        RULE ENGINE
                    </span>
                    <SignalBadge signal={signal?.ruleSignal ?? null} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        AI (DeepSeek)
                    </span>
                    <SignalBadge signal={signal?.deepseekSignal ?? null} />
                </div>
            </div>

            {/* AI Reasoning */}
            {signal?.deepseekReasoning && (
                <div
                    style={{
                        background: 'var(--bg-elevated)',
                        borderRadius: 6,
                        padding: '10px 12px',
                        marginBottom: 16,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        maxHeight: 100,
                        overflowY: 'auto',
                    }}
                >
                    {signal.deepseekReasoning}
                </div>
            )}

            {/* Timestamp */}
            {signal?.createdAt && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                        {new Date(signal.createdAt).toLocaleString()}
                    </span>
                </div>
            )}

            {/* Refresh Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                    className="refresh-btn"
                    onClick={onRefresh}
                    disabled={isLoading}
                >
                    {isLoading ? 'ANALYZING...' : 'REFRESH SIGNAL'}
                </button>
            </div>
        </div>
    );
}
