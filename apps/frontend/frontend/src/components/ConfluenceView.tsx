import { useEffect, useState } from 'react';
import axios from 'axios';
import { SignalResult, SignalType } from 'shared-types';
import { SignalBadge } from './SignalBadge';

const API_BASE = 'http://localhost:3000/api';
const REFRESH_INTERVAL = 30000;
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

function calcConfluenceScore(signals: (SignalResult | null)[]): number {
    const counts: Record<string, number> = { BUY: 0, SELL: 0, HOLD: 0 };
    for (const s of signals) {
        if (s?.signal) counts[s.signal] = (counts[s.signal] ?? 0) + 1;
    }
    const max = Math.max(...Object.values(counts));
    return max / signals.length;
}

interface Props {
    latestSignal?: SignalResult | null;
}

export function ConfluenceView({ latestSignal }: Props) {
    const [signals, setSignals] = useState<(SignalResult | null)[]>(Array(6).fill(null));
    const [loading, setLoading] = useState(true);

    const fetchConfluence = async () => {
        try {
            const res = await axios.get(`${API_BASE}/signals/confluence`, { params: { symbol: 'ETHUSDT' } });
            setSignals(res.data);
        } catch {
            // keep existing
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfluence();
        const id = setInterval(fetchConfluence, REFRESH_INTERVAL);
        return () => clearInterval(id);
    }, []);

    // Update when new signal arrives via WebSocket
    useEffect(() => {
        if (!latestSignal) return;
        setSignals(prev => prev.map(s =>
            s?.timeframe === latestSignal.timeframe ? latestSignal : s
        ));
    }, [latestSignal]);

    const score = calcConfluenceScore(signals);
    const allSame = score === 1.0;
    const dominantSignal = signals.find(s => s?.signal)?.signal;

    const glowColor = dominantSignal === SignalType.BUY ? 'var(--buy)' :
        dominantSignal === SignalType.SELL ? 'var(--sell)' : 'var(--hold)';

    const thStyle: React.CSSProperties = {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        textAlign: 'left',
        padding: '6px 12px',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--border)',
    };

    const tdStyle: React.CSSProperties = {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    MULTI-TIMEFRAME CONFLUENCE
                </span>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: score >= 0.8 ? 'var(--buy)' : score >= 0.5 ? 'var(--hold)' : 'var(--text-muted)',
                }}>
                    Score: {(score * 100).toFixed(0)}%
                </span>
            </div>

            <div style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${allSame ? glowColor : 'var(--border)'}`,
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: allSame ? `0 0 12px ${glowColor}40` : 'none',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>TF</th>
                            <th style={thStyle}>SIGNAL</th>
                            <th style={thStyle}>CONF</th>
                            <th style={thStyle}>RULE</th>
                            <th style={thStyle}>AI</th>
                            <th style={thStyle}>UPDATED</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TIMEFRAMES.map((tf, i) => {
                            const s = signals[i];
                            if (loading || !s) {
                                return (
                                    <tr key={tf}>
                                        <td style={tdStyle}>{tf}</td>
                                        {[...Array(5)].map((_, j) => (
                                            <td key={j} style={tdStyle}>
                                                <div style={{ height: 14, background: 'var(--bg-elevated)', borderRadius: 3, width: 60, animation: 'shimmer 1.5s infinite' }} />
                                            </td>
                                        ))}
                                    </tr>
                                );
                            }
                            return (
                                <tr key={tf}>
                                    <td style={{ ...tdStyle, color: 'var(--text-primary)', fontWeight: 600 }}>{tf}</td>
                                    <td style={tdStyle}><SignalBadge signal={s.signal} /></td>
                                    <td style={tdStyle}>{(s.confidence * 100).toFixed(0)}%</td>
                                    <td style={tdStyle}>{s.ruleSignal ? <SignalBadge signal={s.ruleSignal} /> : '—'}</td>
                                    <td style={tdStyle}>{s.deepseekSignal ? <SignalBadge signal={s.deepseekSignal} /> : '—'}</td>
                                    <td style={{ ...tdStyle, fontSize: 10, color: 'var(--text-muted)' }}>
                                        {new Date(s.createdAt).toLocaleTimeString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
