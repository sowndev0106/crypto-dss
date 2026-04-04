import { useEffect, useRef, useState } from 'react';
import { TimeframeSelector } from './TimeframeSelector';
import { PriceTicker } from './PriceTicker';

interface Props {
    selectedTimeframe: string;
    onTimeframeChange: (tf: string) => void;
    isConnected: boolean;
    onRefresh: () => void;
}

const AUTO_REFRESH_OPTIONS = [
    { label: 'Off', value: 0 },
    { label: '1s', value: 1000 },
    { label: '5s', value: 5000 },
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 },
    { label: '2m', value: 120000 },
    { label: '5m', value: 300000 },
];

export function Topbar({ selectedTimeframe, onTimeframeChange, isConnected, onRefresh }: Props) {
    const [autoInterval, setAutoInterval] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoInterval > 0) {
            timerRef.current = setInterval(onRefresh, autoInterval);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [autoInterval, onRefresh]);

    return (
        <header className="topbar">
            {/* Left: Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.05em' }}>
                    CRYPTO DSS
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    Decision Support System
                </span>
            </div>

            {/* Center: Live Price Ticker */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                <PriceTicker />
            </div>

            {/* Right: Status + Auto-refresh + Refresh btn + Timeframe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                        className={`live-dot ${isConnected ? 'animate-pulse-live' : ''}`}
                        style={{ background: isConnected ? 'var(--buy)' : 'var(--sell)' }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isConnected ? 'var(--buy)' : 'var(--sell)' }}>
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                </div>

                {/* Auto-refresh selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>AUTO</span>
                    <select
                        value={autoInterval}
                        onChange={e => setAutoInterval(Number(e.target.value))}
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            color: autoInterval > 0 ? 'var(--buy)' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            padding: '3px 6px',
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        {AUTO_REFRESH_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Manual refresh button */}
                <button
                    onClick={onRefresh}
                    title="Refresh data"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 14,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        lineHeight: 1,
                        transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                    ↻
                </button>

                <TimeframeSelector selected={selectedTimeframe} onChange={onTimeframeChange} />
            </div>
        </header>
    );
}
