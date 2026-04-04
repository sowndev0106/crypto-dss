import { Injectable } from '@nestjs/common';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { VolumeProfileBucket } from './market.types';

const BUCKET_COUNT = 20;

@Injectable()
export class VolumeProfileService {
    calculate(candles: OhlcvEntity[]): VolumeProfileBucket[] {
        if (candles.length === 0) return [];

        const highs = candles.map(c => parseFloat(c.high as unknown as string));
        const lows = candles.map(c => parseFloat(c.low as unknown as string));
        const volumes = candles.map(c => parseFloat(c.volume as unknown as string));

        const minPrice = Math.min(...lows);
        const maxPrice = Math.max(...highs);
        const range = maxPrice - minPrice;

        if (range === 0) {
            return [{ priceLevel: minPrice, volume: volumes.reduce((a, b) => a + b, 0) }];
        }

        const bucketSize = range / BUCKET_COUNT;
        const buckets: VolumeProfileBucket[] = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
            priceLevel: minPrice + (i + 0.5) * bucketSize,
            volume: 0,
        }));

        for (let i = 0; i < candles.length; i++) {
            const midPrice = (highs[i] + lows[i]) / 2;
            const bucketIndex = Math.min(
                Math.floor((midPrice - minPrice) / bucketSize),
                BUCKET_COUNT - 1,
            );
            buckets[bucketIndex].volume += volumes[i];
        }

        return buckets;
    }
}
