import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';
const REFRESH_INTERVAL = 5 * 60 * 1000;

interface FearGreedData {
    value: number;
    label: string;
}

interface MarketContext {
    fearGreedIndex: FearGreedData | null;
    btcDominance: number | null;
    fundingRate: number | null;
}

function getFearGreedColor(value: number): string {
    if (value <= 24) return 'var(--sell)';
    if (value <= 44) return '#ff8c00';
    if (value <= 55) return 'var(--hold)';
    if (value <= 75) return '#7ec8e3';
    return 'var(--buy)';
}

export function MarketContextPanel() {
    const [context, setContext] = useState<MarketContext | null>(null);

    const fetchContext = async () => {
        try {
            const res = await axios.get(`${API_BASE}/market/context`);
            setContext(res.data);
        } catch {
            // keep existing data
        }
    };

    useEffect(() => {
        fetchContext();
        const id = setInterval(fetchContext, REFRESH_INTERVAL);
        return () => clearInterval(id);
    }, []);

    const cardStyle: React.CSSProperties = {
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '12px 16px',
        flex: 1,
        minWidth: 120,
    };

    const labelStyle: React.CSSProperties = {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 4,
    };

    const valueStyle: React.CSSProperties = {
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 600,
    };

    const fg = context?.fearGreedIndex;
    const btc = context?.btcDominance;
    const fr = context?.fundingRate;
    const frIsPositive = fr !== null && fr !== undefined && fr >= 0;

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.1em' }}>
                MARKET CONTEXT
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={cardStyle}>
                    <div style={labelStyle}>Fear & Greed</div>
                    {fg ? (
                        <>
                            <div style={{ ...valueStyle, color: getFearGreedColor(fg.value) }}>{fg.value}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: getFearGreedColor(fg.value), marginTop: 2 }}>{fg.label}</div>
                        </>
                    ) : (
                        <div style={{ ...valueStyle, color: 'var(--text-muted)' }}>—</div>
                    )}
                </div>

                <div style={cardStyle}>
                    <div style={labelStyle}>BTC Dominance</div>
                    {btc !== null && btc !== undefined ? (
                        <div style={{ ...valueStyle, color: 'var(--text-primary)' }}>{btc.toFixed(1)}%</div>
                    ) : (
                        <div style={{ ...valueStyle, color: 'var(--text-muted)' }}>—</div>
                    )}
                </div>

                <div style={cardStyle}>
                    <div style={labelStyle}>Funding Rate</div>
                    {fr !== null && fr !== undefined ? (
                        <div style={{ ...valueStyle, color: frIsPositive ? 'var(--buy)' : 'var(--sell)' }}>
                            {frIsPositive ? '+' : ''}{(fr * 100).toFixed(4)}%
                        </div>
                    ) : (
                        <div style={{ ...valueStyle, color: 'var(--text-muted)' }}>—</div>
                    )}
                </div>
            </div>
        </div>
    );
}
