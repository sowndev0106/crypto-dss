import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';
const MAX_ALERTS = 10;

interface PriceAlert {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    createdAt: string;
}

interface Props {
    onAlertTriggered?: (data: unknown) => void;
}

export function AlertPanel({ onAlertTriggered }: Props) {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [targetPrice, setTargetPrice] = useState('');
    const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get(`${API_BASE}/alerts`);
            setAlerts(res.data);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleCreate = async () => {
        const price = parseFloat(targetPrice);
        if (isNaN(price) || price <= 0) {
            setError('Vui lòng nhập giá hợp lệ');
            return;
        }
        if (alerts.length >= MAX_ALERTS) {
            setError('Đã đạt giới hạn 10 alerts');
            return;
        }
        try {
            await axios.post(`${API_BASE}/alerts`, { symbol: 'ETHUSDT', targetPrice: price, condition });
            setTargetPrice('');
            setError(null);
            fetchAlerts();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Lỗi tạo alert';
            setError(msg);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${API_BASE}/alerts/${id}`);
            setAlerts(prev => prev.filter(a => a.id !== id));
        } catch {
            // ignore
        }
    };

    const inputStyle: React.CSSProperties = {
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        padding: '6px 10px',
        outline: 'none',
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.1em' }}>
                PRICE ALERTS
            </div>

            {/* Create form */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <input
                    type="number"
                    placeholder="Target price"
                    value={targetPrice}
                    onChange={e => setTargetPrice(e.target.value)}
                    style={{ ...inputStyle, width: 140 }}
                    disabled={alerts.length >= MAX_ALERTS}
                />
                <select
                    value={condition}
                    onChange={e => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    disabled={alerts.length >= MAX_ALERTS}
                >
                    <option value="ABOVE">ABOVE</option>
                    <option value="BELOW">BELOW</option>
                </select>
                <button
                    onClick={handleCreate}
                    disabled={alerts.length >= MAX_ALERTS}
                    style={{
                        background: alerts.length >= MAX_ALERTS ? 'var(--bg-elevated)' : 'rgba(0,230,118,0.15)',
                        border: '1px solid var(--buy)',
                        borderRadius: 4,
                        color: alerts.length >= MAX_ALERTS ? 'var(--text-muted)' : 'var(--buy)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        padding: '6px 14px',
                        cursor: alerts.length >= MAX_ALERTS ? 'not-allowed' : 'pointer',
                    }}
                >
                    SET ALERT
                </button>
            </div>

            {error && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sell)', marginBottom: 8 }}>
                    ⚠ {error}
                </div>
            )}

            {/* Alert list */}
            {alerts.length === 0 ? (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                    Chưa có alert nào
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {alerts.map(alert => (
                        <div key={alert.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: '8px 12px',
                        }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)' }}>
                                ETH/USDT{' '}
                                <span style={{ color: alert.condition === 'ABOVE' ? 'var(--buy)' : 'var(--sell)' }}>
                                    {alert.condition}
                                </span>{' '}
                                ${alert.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                                onClick={() => handleDelete(alert.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: 16,
                                    lineHeight: 1,
                                    padding: '0 4px',
                                }}
                            >×</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
