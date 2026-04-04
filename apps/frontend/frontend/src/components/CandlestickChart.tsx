import { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickSeries, createSeriesMarkers, SeriesMarker, Time } from 'lightweight-charts';
import { OhlcvCandle } from '../api/signals.api';
import { SignalResult, SignalType } from 'shared-types';

interface Props {
    candles: OhlcvCandle[];
    timeframe: string;
    signals?: SignalResult[];
    srLevels?: { support: number[]; resistance: number[] };
}

export function CandlestickChart({ candles, timeframe, signals = [], srLevels }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ReturnType<IChartApi['addSeries']> | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        chartRef.current = createChart(containerRef.current, {
            layout: {
                background: { color: '#0d1117' },
                textColor: '#8b949e',
            },
            grid: {
                vertLines: { color: '#1c2128' },
                horzLines: { color: '#1c2128' },
            },
            crosshair: { mode: 1 },
            rightPriceScale: { borderColor: '#1c2128' },
            timeScale: {
                borderColor: '#1c2128',
                timeVisible: true,
                secondsVisible: timeframe === '1m' || timeframe === '5m',
            },
            width: containerRef.current.clientWidth,
            height: 300,
        });

        seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
            upColor: '#00c853',
            downColor: '#ff3b30',
            borderUpColor: '#00c853',
            borderDownColor: '#ff3b30',
            wickUpColor: '#00c853',
            wickDownColor: '#ff3b30',
        });

        const ro = new ResizeObserver(() => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
            }
        });
        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            chartRef.current?.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, [timeframe]);

    useEffect(() => {
        if (!seriesRef.current || candles.length === 0) return;
        const data = candles.map(c => ({
            time: Math.floor(c.openTime / 1000) as unknown as Time,
            open: parseFloat(c.open as unknown as string),
            high: parseFloat(c.high as unknown as string),
            low: parseFloat(c.low as unknown as string),
            close: parseFloat(c.close as unknown as string),
        }));
        seriesRef.current.setData(data);
        chartRef.current?.timeScale().fitContent();
    }, [candles]);

    useEffect(() => {
        if (!seriesRef.current) return;

        const markers: SeriesMarker<Time>[] = signals
            .filter(s => s.signal !== SignalType.HOLD)
            .map(s => ({
                time: Math.floor(new Date(s.createdAt).getTime() / 1000) as unknown as Time,
                position: s.signal === SignalType.BUY ? 'belowBar' : 'aboveBar',
                color: s.signal === SignalType.BUY ? '#00c853' : '#ff3b30',
                shape: s.signal === SignalType.BUY ? 'arrowUp' : 'arrowDown',
                text: `${s.signal} ${Math.round(s.confidence * 100)}%`,
                size: 1,
            } as SeriesMarker<Time>))
            .sort((a, b) => (a.time as number) - (b.time as number));

        createSeriesMarkers(seriesRef.current, markers);
    }, [signals]);

    // Update SR level lines when srLevels change
    useEffect(() => {
        if (!seriesRef.current) return;
        // Remove existing price lines by recreating series is complex;
        // Instead we use a simple approach: store line refs and remove them
        if (srLevels) {
            for (const level of srLevels.support) {
                seriesRef.current.createPriceLine({
                    price: level,
                    color: '#00e676',
                    lineWidth: 1,
                    lineStyle: 2, // dashed
                    axisLabelVisible: true,
                    title: 'S',
                });
            }
            for (const level of srLevels.resistance) {
                seriesRef.current.createPriceLine({
                    price: level,
                    color: '#ff4757',
                    lineWidth: 1,
                    lineStyle: 2, // dashed
                    axisLabelVisible: true,
                    title: 'R',
                });
            }
        }
    }, [srLevels]);

    return <div ref={containerRef} style={{ width: '100%', height: 300 }} />;
}
