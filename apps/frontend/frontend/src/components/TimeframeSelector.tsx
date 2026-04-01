interface Props {
    selected: string;
    onChange: (tf: string) => void;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

export function TimeframeSelector({ selected, onChange }: Props) {
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {TIMEFRAMES.map(tf => (
                <button
                    key={tf}
                    onClick={() => onChange(tf)}
                    className={`tab-btn ${selected === tf ? 'active' : ''}`}
                    style={{ padding: '4px 10px' }}
                >
                    {tf}
                </button>
            ))}
        </div>
    );
}
