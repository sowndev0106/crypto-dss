interface Props {
    rsi: number | null;
}

export function RsiRow({ rsi }: Props) {
    const displayValue = rsi == null ? '—' : rsi.toFixed(2);
    const pct = rsi == null ? 0 : Math.min(100, Math.max(0, rsi));

    const barColor = rsi == null
        ? 'var(--text-muted)'
        : rsi < 30
            ? 'var(--buy)'
            : rsi > 70
                ? 'var(--sell)'
                : 'var(--hold)';

    return (
        <div className="indicator-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            {/* Label + Value row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    RSI 14
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{displayValue}</span>
            </div>

            {/* Progress bar */}
            <div style={{ position: 'relative', height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'visible' }}>
                {/* Fill */}
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${pct}%`,
                        background: barColor,
                        borderRadius: 3,
                        transition: 'width 0.3s ease',
                    }}
                />
                {/* OS marker at 30% */}
                <div
                    style={{
                        position: 'absolute',
                        left: '30%',
                        top: -2,
                        bottom: -2,
                        width: 1,
                        background: 'var(--buy)',
                        opacity: 0.6,
                    }}
                />
                {/* OB marker at 70% */}
                <div
                    style={{
                        position: 'absolute',
                        left: '70%',
                        top: -2,
                        bottom: -2,
                        width: 1,
                        background: 'var(--sell)',
                        opacity: 0.6,
                    }}
                />
            </div>

            {/* Zone labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--buy)', marginLeft: '28%' }}>OS</span>
                <span style={{ color: 'var(--sell)', marginRight: '28%' }}>OB</span>
            </div>
        </div>
    );
}
