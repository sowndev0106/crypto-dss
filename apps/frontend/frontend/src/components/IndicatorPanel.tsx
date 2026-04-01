import { useState } from 'react';
import { AllIndicators } from 'shared-types';
import { IndicatorRow } from './IndicatorRow';
import { RsiRow } from './RsiRow';
import { PatternsTab } from './PatternsTab';

interface Props {
    indicators: AllIndicators | null;
    isLoading: boolean;
}

type Tab = 'TREND' | 'MOMENTUM' | 'VOLATILITY' | 'VOLUME' | 'PATTERNS';
const TABS: Tab[] = ['TREND', 'MOMENTUM', 'VOLATILITY', 'VOLUME', 'PATTERNS'];

export function IndicatorPanel({ indicators, isLoading }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('TREND');

    return (
        <div className="indicator-panel">
            {/* Tab list */}
            <div className="tab-list">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div>
                {isLoading && (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        Loading...
                    </div>
                )}

                {!isLoading && !indicators && (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        No data
                    </div>
                )}

                {!isLoading && indicators && activeTab === 'TREND' && (
                    <div>
                        <IndicatorRow label="EMA 9" value={indicators.trend.ema9} />
                        <IndicatorRow label="EMA 21" value={indicators.trend.ema21} />
                        <IndicatorRow label="EMA 50" value={indicators.trend.ema50} />
                        <IndicatorRow label="EMA 200" value={indicators.trend.ema200} />
                        <IndicatorRow label="DEMA 9" value={indicators.trend.dema9} />
                        <IndicatorRow label="TEMA 9" value={indicators.trend.tema9} />
                        <IndicatorRow label="MACD" value={indicators.trend.macd.value} />
                        <IndicatorRow label="MACD Signal" value={indicators.trend.macd.signal} />
                        <IndicatorRow label="MACD Histogram" value={indicators.trend.macd.histogram} />
                        <IndicatorRow label="ADX" value={indicators.trend.adx} />
                        <IndicatorRow label="PSAR" value={indicators.trend.psar} />
                        <IndicatorRow label="Ichimoku Tenkan" value={indicators.trend.ichimoku.tenkan} />
                        <IndicatorRow label="Ichimoku Kijun" value={indicators.trend.ichimoku.kijun} />
                        <IndicatorRow label="Ichimoku Senkou A" value={indicators.trend.ichimoku.senkouA} />
                        <IndicatorRow label="Ichimoku Senkou B" value={indicators.trend.ichimoku.senkouB} />
                    </div>
                )}

                {!isLoading && indicators && activeTab === 'MOMENTUM' && (
                    <div>
                        <RsiRow rsi={indicators.momentum.rsi} />
                        <IndicatorRow label="StochRSI K" value={indicators.momentum.stochRsiK} />
                        <IndicatorRow label="StochRSI D" value={indicators.momentum.stochRsiD} />
                        <IndicatorRow label="Stoch K" value={indicators.momentum.stochK} />
                        <IndicatorRow label="Stoch D" value={indicators.momentum.stochD} />
                        <IndicatorRow label="Williams %R" value={indicators.momentum.williamsR} />
                        <IndicatorRow label="CCI" value={indicators.momentum.cci} />
                        <IndicatorRow label="ROC" value={indicators.momentum.roc} />
                    </div>
                )}

                {!isLoading && indicators && activeTab === 'VOLATILITY' && (
                    <div>
                        <IndicatorRow label="BB Upper" value={indicators.volatility.bbUpper} />
                        <IndicatorRow label="BB Middle" value={indicators.volatility.bbMiddle} />
                        <IndicatorRow label="BB Lower" value={indicators.volatility.bbLower} />
                        <IndicatorRow label="ATR" value={indicators.volatility.atr} />
                    </div>
                )}

                {!isLoading && indicators && activeTab === 'VOLUME' && (
                    <div>
                        <IndicatorRow label="VWAP" value={indicators.volume.vwap} />
                        <IndicatorRow label="OBV" value={indicators.volume.obv} />
                        <IndicatorRow label="MFI" value={indicators.volume.mfi} />
                        <IndicatorRow label="CMF" value={indicators.volume.cmf} />
                    </div>
                )}

                {!isLoading && indicators && activeTab === 'PATTERNS' && (
                    <PatternsTab patterns={indicators.patterns} />
                )}
            </div>
        </div>
    );
}
