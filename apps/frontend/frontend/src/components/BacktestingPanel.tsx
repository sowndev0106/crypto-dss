import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

interface BacktestResult {
    symbol: string;
    timeframe: string;
    totalSignals: number;
    winCount: number;
    lossCount: number;
    ruleWinRate: number | null;
    deepseekWinRate: number | null;
    insufficientData: boolean;
}

interface Props {
    timeframe: string;
}

export function BacktestingPanel({ timeframe }: Props) {
    const [result, setResult] = useState<BacktestResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/signals/backtest`, {
                    params: { symbol: 'ETHUSDT', timeframe },
                });
                setResult(res.data);
            } catch {
                setResult(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [timeframe]);

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid var(--border)',
    };

    const labelStyle: React.CSSProperties = {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
    };

    const valueStyle = (rate: number | null): React.CSSProperties => ({
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: rate === null ? 'var(--text-muted)' : rate >= 0.5 ? 'var(--buy)' : 'var(--sell)',
    });

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.1em' }}>
                BACKTESTING — {timeframe.toUpperCase()}
            </div>

            {loading ? (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>Loading...</div>
            ) : !result ? (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>Không có dữ liệu</div>
            ) : result.insufficientData ? (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--hold)' }}>
                    Chưa đủ dữ liệu (cần tối thiểu 10 tín hiệu, hiện có {result.totalSignals})
                </div>
            ) : (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Rule Engine Win Rate</span>
                        <span style={valueStyle(result.ruleWinRate)}>
                            {result.ruleWinRate !== null ? `${(result.ruleWinRate * 100).toFixed(1)}%` : '—'}
                        </span>
                    </div>
                    <div style={rowStyle}>
                        <span style={labelStyle}>AI (DeepSeek) Win Rate</span>
                        <span style={valueStyle(result.deepseekWinRate)}>
                            {result.deepseekWinRate !== null ? `${(result.deepseekWinRate * 100).toFixed(1)}%` : '—'}
                        </span>
                    </div>
                    <div style={{ ...rowStyle, borderBottom: 'none' }}>
                        <span style={labelStyle}>Total Signals</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                            {result.totalSignals} ({result.winCount}W / {result.lossCount}L)
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
