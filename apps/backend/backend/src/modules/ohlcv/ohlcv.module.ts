import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OhlcvEntity } from './ohlcv.entity';
import { OhlcvService } from './ohlcv.service';
import { OhlcvScheduler } from './ohlcv.scheduler';
import { OhlcvController } from './ohlcv.controller';
import { BinanceModule } from '../binance/binance.module';

@Module({
    imports: [TypeOrmModule.forFeature([OhlcvEntity]), BinanceModule],
    controllers: [OhlcvController],
    providers: [OhlcvService, OhlcvScheduler],
    exports: [OhlcvService],
})
export class OhlcvModule { }
