import { Module } from '@nestjs/common';
import { MarketContextService } from './market-context.service';
import { VolumeProfileService } from './volume-profile.service';
import { MarketController } from './market.controller';
import { OhlcvModule } from '../ohlcv/ohlcv.module';

@Module({
    imports: [OhlcvModule],
    controllers: [MarketController],
    providers: [MarketContextService, VolumeProfileService],
    exports: [MarketContextService, VolumeProfileService],
})
export class MarketModule { }
