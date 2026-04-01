import { Module } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { OhlcvModule } from '../ohlcv/ohlcv.module';

@Module({
    imports: [OhlcvModule],
    providers: [IndicatorsService],
    exports: [IndicatorsService],
})
export class IndicatorsModule { }
