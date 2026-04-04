import { useEffect, useRef, useState } from 'react';

interface TickerData {
    lastPrice: string;
    priceChange: string;
    priceChangePercent: string;
}

const BINANCE_TICKER_URL = 'https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT';
const FETCH_INTERVAL = 15000;

export function PriceTicker() {
    const [data, setData] = useState<TickerData | null>(null);
    const lastKnownRef = useRef<TickerData | null>(null);

    const fetchPrice = async () => {
        try {
            const res = await fetch(BINANCE_TICKER_URL);
            if (!res.ok) return;
            const json: TickerData = await res.json();
            setData(json);
            lastKnownRef.current = json;
        } catch {
            // Keep last known data on error
            if (lastKnownRef.current) setData(lastKnownRef.current);
        }
    };

    useEffect(() => {
        fetchPrice();
        const id = setInterval(fetchPrice, FETCH_INTERVAL);
        return () => clearInterval(id);
    }, []);

    if (!data) {
        return (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                ETH/USDT —
            </div>
        );
    }

    const price = parseFloat(data.lastPrice);
    const change = parseFloat(data.priceChange);
    const changePct = parseFloat(data.priceChangePercent);
    const isUp = changePct >= 0;
    const signColor = isUp ? 'var(--buy)' : 'var(--sell)';
    const sign = isUp ? '+' : '';

    return (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                ETH/USDT
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-primary)' }}>
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: signColor }}>
                {sign}{change.toFixed(2)} ({sign}{changePct.toFixed(2)}%)
            </span>
        </div>
    );
}
