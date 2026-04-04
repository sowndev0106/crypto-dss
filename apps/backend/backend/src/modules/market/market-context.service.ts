import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { FearGreedData, MarketContext } from './market.types';

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

function getFearGreedLabel(value: number): string {
    if (value <= 24) return 'Extreme Fear';
    if (value <= 44) return 'Fear';
    if (value <= 55) return 'Neutral';
    if (value <= 75) return 'Greed';
    return 'Extreme Greed';
}

@Injectable()
export class MarketContextService {
    private readonly logger = new Logger(MarketContextService.name);

    private fearGreedCache: CacheEntry<FearGreedData | null> | null = null;
    private btcDominanceCache: CacheEntry<number | null> | null = null;
    private fundingRateCache: CacheEntry<number | null> | null = null;

    private readonly FEAR_GREED_TTL = 60 * 60 * 1000; // 1 hour
    private readonly BTC_DOMINANCE_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly FUNDING_RATE_TTL = 60 * 60 * 1000; // 1 hour

    async getFearGreedIndex(): Promise<FearGreedData | null> {
        const now = Date.now();
        if (this.fearGreedCache && this.fearGreedCache.expiresAt > now) {
            return this.fearGreedCache.value;
        }
        try {
            const res = await axios.get('https://api.alternative.me/fng/?limit=1', { timeout: 5000 });
            const raw = res.data?.data?.[0];
            const value = parseInt(raw?.value ?? '0', 10);
            const data: FearGreedData = { value, label: getFearGreedLabel(value) };
            this.fearGreedCache = { value: data, expiresAt: now + this.FEAR_GREED_TTL };
            return data;
        } catch (err) {
            this.logger.error('Failed to fetch Fear & Greed Index', err);
            this.fearGreedCache = { value: null, expiresAt: now + this.FEAR_GREED_TTL };
            return null;
        }
    }

    async getBtcDominance(): Promise<number | null> {
        const now = Date.now();
        if (this.btcDominanceCache && this.btcDominanceCache.expiresAt > now) {
            return this.btcDominanceCache.value;
        }
        try {
            const res = await axios.get('https://api.coingecko.com/api/v3/global', { timeout: 5000 });
            const dominance = res.data?.data?.market_cap_percentage?.btc ?? null;
            this.btcDominanceCache = { value: dominance, expiresAt: now + this.BTC_DOMINANCE_TTL };
            return dominance;
        } catch (err) {
            this.logger.error('Failed to fetch BTC dominance', err);
            this.btcDominanceCache = { value: null, expiresAt: now + this.BTC_DOMINANCE_TTL };
            return null;
        }
    }

    async getFundingRate(): Promise<number | null> {
        const now = Date.now();
        if (this.fundingRateCache && this.fundingRateCache.expiresAt > now) {
            return this.fundingRateCache.value;
        }
        try {
            const res = await axios.get('https://fapi.binance.com/fapi/v1/fundingRate', {
                params: { symbol: 'ETHUSDT', limit: 1 },
                timeout: 5000,
            });
            const rate = parseFloat(res.data?.[0]?.fundingRate ?? 'NaN');
            const value = isNaN(rate) ? null : rate;
            this.fundingRateCache = { value, expiresAt: now + this.FUNDING_RATE_TTL };
            return value;
        } catch (err) {
            this.logger.error('Failed to fetch funding rate', err);
            this.fundingRateCache = { value: null, expiresAt: now + this.FUNDING_RATE_TTL };
            return null;
        }
    }

    async getContext(): Promise<MarketContext> {
        const [fearGreedIndex, btcDominance, fundingRate] = await Promise.all([
            this.getFearGreedIndex(),
            this.getBtcDominance(),
            this.getFundingRate(),
        ]);
        return { fearGreedIndex, btcDominance, fundingRate };
    }
}
