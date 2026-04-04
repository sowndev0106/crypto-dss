import { RiskHints, SignalType } from 'shared-types';

interface Props {
    signal: SignalType | null;
    riskHints: RiskHints | null | undefined;
}

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function RiskManagementPanel({ signal, riskHints }: Props) {
    if (signal === SignalType.HOLD || signal === null) return null;

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

    return (
        <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>
                RISK MANAGEMENT
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={rowStyle}>
                    <span style={labelStyle}>Stop Loss</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: riskHints ? 'var(--sell)' : 'var(--text-muted)' }}>
                        {riskHints ? `$${fmt(riskHints.stopLoss)}` : '—'}
                    </span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Take Profit</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: riskHints ? 'var(--buy)' : 'var(--text-muted)' }}>
                        {riskHints ? `$${fmt(riskHints.takeProfit)}` : '—'}
                    </span>
                </div>
                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                    <span style={labelStyle}>Risk / Reward</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {riskHints ? `1:${riskHints.riskRewardRatio.toFixed(1)}` : '—'}
                    </span>
                </div>
            </div>
        </div>
    );
}
