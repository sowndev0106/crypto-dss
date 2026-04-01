import { SignalType } from 'shared-types';

interface Props {
    confidence: number;
    signal: SignalType;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const SIGNAL_COLORS: Record<SignalType, string> = {
    [SignalType.BUY]: 'var(--buy)',
    [SignalType.SELL]: 'var(--sell)',
    [SignalType.HOLD]: 'var(--hold)',
};

const START_ANGLE = 150;
const SWEEP = 240;

export function ConfidenceGauge({ confidence, signal }: Props) {
    const cx = 100;
    const cy = 100;
    const r = 80;
    const strokeWidth = 10;

    const bgPath = describeArc(cx, cy, r, START_ANGLE, START_ANGLE + SWEEP);
    const fgAngle = confidence * SWEEP;
    const fgPath = fgAngle > 0
        ? describeArc(cx, cy, r, START_ANGLE, START_ANGLE + fgAngle)
        : '';

    const color = SIGNAL_COLORS[signal];

    return (
        <svg width="200" height="200" viewBox="0 0 200 200">
            <path
                d={bgPath}
                fill="none"
                stroke="var(--bg-elevated)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            {fgPath && (
                <path
                    d={fgPath}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
            )}
            <text
                x={cx}
                y={cy + 6}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="22"
                fill="var(--text-primary)"
            >
                {Math.round(confidence * 100)}%
            </text>
        </svg>
    );
}
