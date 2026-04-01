import axios from 'axios';
import { SignalResult } from 'shared-types';

const API_BASE = 'http://localhost:3000/api';

export async function fetchLatestSignal(symbol: string, timeframe: string): Promise<SignalResult | null> {
    const res = await axios.get(`${API_BASE}/signals/latest`, { params: { symbol, timeframe } });
    return res.data;
}

export async function fetchSignalHistory(symbol: string, timeframe: string, limit = 50): Promise<SignalResult[]> {
    const res = await axios.get(`${API_BASE}/signals/history`, { params: { symbol, timeframe, limit } });
    return res.data;
}

export async function generateSignal(symbol: string, timeframe: string): Promise<SignalResult> {
    const res = await axios.post(`${API_BASE}/signals/generate`, { symbol, timeframe });
    return res.data;
}
