import { useEffect, useRef } from 'react';
import { SignalResult, SignalType } from 'shared-types';
import { SignalBadge } from './SignalBadge';

interface Props {
    signal: SignalResult;
    onClose: () => void;
}

const SIGNAL_COLORS: Record<SignalType, string> = {
    [SignalType.BUY]: 'var(--buy)',
    [SignalType.SELL]: 'var(--sell)',
    [SignalType.HOLD]: 'var(--hold)',
};

const SIGNAL_GLOW: Record<SignalType, string> = {
    [SignalType.BUY]: 'var(--buy-glow)',
    [SignalType.SELL]: 'var(--sell-glow)',
    [SignalType.HOLD]: 'var(--hold-glow)',
};

const AUTO_DISMISS_MS = 8000;

export function SignalToast({ signal, onClose }: Props) {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(onClose, AUTO_DISMISS_MS);

        // Animate progress bar
        if (progressRef.current) {
            progressRef.current.style.transition = `width ${AUTO_DISMISS_MS}ms linear`;
            progressRef.current.style.width = '0%';
        }

        return () => clearTimeout(timer);
    }, [onClose]);

    const color = SIGNAL_COLORS[signal.signal];
    const glow = SIGNAL_GLOW[signal.signal];
    const time = new Date(signal.createdAt);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;

    return (
        <div
            className="animate-toast-enter"
            style={{
                position: 'fixed',
                top: 80,
                right: 16,
                width: 260,
                background: 'var(--bg-surface)',
                border: `1px solid ${color}`,
                boxShadow: `0 0 16px ${glow}`,
                borderRadius: 8,
                overflow: 'hidden',
                zIndex: 1000,
            }}
        >
            {/* Body */}
            <div style={{ padding: '12px 14px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 32,
                            color,
                            lineHeight: 1,
                        }}
                    >
                        {signal.signal}
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: 16,
                            lineHeight: 1,
                            padding: 0,
                        }}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Confidence */}
                <div style={{ marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color, fontWeight: 600 }}>
                        {Math.round(signal.confidence * 100)}%
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                        confidence
                    </span>
                </div>

                {/* Symbol + Timeframe */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {signal.symbol}
                    </span>
                    <SignalBadge signal={signal.signal} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                        {signal.timeframe}
                    </span>
                </div>

                {/* Time */}
                <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                        {timeStr}
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'var(--bg-elevated)' }}>
                <div
                    ref={progressRef}
                    style={{
                        height: '100%',
                        width: '100%',
                        background: color,
                    }}
                />
            </div>
        </div>
    );
}
