import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SignalResult } from 'shared-types';

const SOCKET_URL = 'http://localhost:3000';

export function useSignalSocket(symbol: string, timeframe: string) {
    const [latestSignal, setLatestSignal] = useState<SignalResult | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('subscribe', { symbol, timeframe });
        });

        socket.on('disconnect', () => setIsConnected(false));

        socket.on('signal-changed', (signal: SignalResult) => {
            if (signal.symbol === symbol && signal.timeframe === timeframe) {
                setLatestSignal(signal);
            }
        });

        return () => { socket.disconnect(); };
    }, [symbol, timeframe]);

    return { latestSignal, isConnected };
}
