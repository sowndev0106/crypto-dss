import { TimeframeSelector } from './TimeframeSelector';

interface Props {
    selectedTimeframe: string;
    onTimeframeChange: (tf: string) => void;
    isConnected: boolean;
}

export function Topbar({ selectedTimeframe, onTimeframeChange, isConnected }: Props) {
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

            {/* Center: Pair + Price */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                    ETH/USDT
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16 }}>—</span>
            </div>

            {/* Right: Status + TimeframeSelector */}
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
                <TimeframeSelector selected={selectedTimeframe} onChange={onTimeframeChange} />
            </div>
        </header>
    );
}
