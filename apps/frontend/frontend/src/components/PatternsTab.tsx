import { CandlestickPatterns } from 'shared-types';

interface Props {
    patterns: CandlestickPatterns;
}

type PatternDef = {
    key: keyof CandlestickPatterns;
    label: string;
    type: 'bullish' | 'bearish' | 'neutral';
};

const PATTERN_DEFS: PatternDef[] = [
    { key: 'doji', label: 'Doji', type: 'neutral' },
    { key: 'hammer', label: 'Hammer', type: 'bullish' },
    { key: 'bullishEngulfing', label: 'Bullish Engulfing', type: 'bullish' },
    { key: 'bearishEngulfing', label: 'Bearish Engulfing', type: 'bearish' },
    { key: 'morningStar', label: 'Morning Star', type: 'bullish' },
    { key: 'eveningStar', label: 'Evening Star', type: 'bearish' },
];

const TYPE_COLORS = {
    bullish: { active: 'var(--buy)', activeBg: 'var(--buy-dim)', activeBorder: 'var(--buy)' },
    bearish: { active: 'var(--sell)', activeBg: 'var(--sell-dim)', activeBorder: 'var(--sell)' },
    neutral: { active: 'var(--hold)', activeBg: 'var(--hold-dim)', activeBorder: 'var(--hold)' },
};

export function PatternsTab({ patterns }: Props) {
    return (
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {PATTERN_DEFS.map(({ key, label, type }) => {
                const active = patterns[key];
                const colors = TYPE_COLORS[type];
                return (
                    <div
                        key={key}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: `1px solid ${active ? colors.activeBorder : 'var(--border)'}`,
                            background: active ? colors.activeBg : 'var(--bg-elevated)',
                            color: active ? colors.active : 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            opacity: active ? 1 : 0.5,
                            textAlign: 'center',
                        }}
                    >
                        {label}
                    </div>
                );
            })}
        </div>
    );
}
