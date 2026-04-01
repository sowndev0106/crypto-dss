import { SignalResult, SignalType } from 'shared-types';
import { SignalBadge } from './SignalBadge';

interface Props {
    history: SignalResult[];
    isLoading: boolean;
}

const SIGNAL_COLORS: Record<SignalType, string> = {
    [SignalType.BUY]: 'var(--buy)',
    [SignalType.SELL]: 'var(--sell)',
    [SignalType.HOLD]: 'var(--hold)',
};

function formatTime(date: Date): string {
    const d = new Date(date);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

export function SignalHistory({ history, isLoading }: Props) {
    return (
        <div className="signal-history">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                    SIGNAL HISTORY
                </span>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)',
                    padding: '2px 6px',
                    borderRadius: 4,
                }}>
                    {history.length}
                </span>
            </div>

            {/* Table */}
            {isLoading ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    Loading...
                </div>
            ) : (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>TIME</th>
                            <th>TIMEFRAME</th>
                            <th>SIGNAL</th>
                            <th>CONFIDENCE</th>
                            <th>RULE</th>
                            <th>AI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                    No history
                                </td>
                            </tr>
                        ) : (
                            history.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                                        {formatTime(item.createdAt)}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                                        {item.timeframe}
                                    </td>
                                    <td>
                                        <SignalBadge signal={item.signal} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="confidence-bar-container">
                                                <div
                                                    className="confidence-bar"
                                                    style={{
                                                        width: `${item.confidence * 100}%`,
                                                        background: SIGNAL_COLORS[item.signal],
                                                    }}
                                                />
                                            </div>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                                                {Math.round(item.confidence * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <SignalBadge signal={item.ruleSignal} />
                                    </td>
                                    <td>
                                        <SignalBadge signal={item.deepseekSignal} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
