interface Props {
    label: string;
    value: number | null | undefined;
    status?: 'bullish' | 'bearish' | 'neutral';
    format?: (v: number) => string;
}

export function IndicatorRow({ label, value, status = 'neutral', format }: Props) {
    const displayValue = value == null ? '—' : (format ? format(value) : value.toFixed(4));
    return (
        <div className="indicator-row">
            <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{displayValue}</span>
                <div className={`status-dot ${status}`} />
            </div>
        </div>
    );
}
