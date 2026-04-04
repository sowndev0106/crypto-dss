import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OhlcvModule } from '../modules/ohlcv/ohlcv.module';
import { IndicatorsModule } from '../modules/indicators/indicators.module';
import { AnalyzerModule } from '../modules/analyzer/analyzer.module';
import { SignalsModule } from '../modules/signals/signals.module';
import { MarketModule } from '../modules/market/market.module';
import { AlertModule } from '../modules/alert/alert.module';
import { OhlcvEntity } from '../modules/ohlcv/ohlcv.entity';
import { SignalEntity } from '../modules/signals/signals.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'crypto_dss'),
        entities: [OhlcvEntity, SignalEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    OhlcvModule,
    IndicatorsModule,
    AnalyzerModule,
    SignalsModule,
    MarketModule,
    AlertModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
