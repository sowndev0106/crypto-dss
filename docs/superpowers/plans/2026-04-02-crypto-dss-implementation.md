# Crypto DSS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hệ thống hỗ trợ quyết định giao dịch ETH/USDT — thu thập dữ liệu từ Binance, tính indicators kỹ thuật, phân tích bằng rule-based + DeepSeek LLM, hiển thị tín hiệu BUY/SELL/HOLD trên React dashboard.

**Architecture:** Nx monorepo — NestJS backend (modules: binance, ohlcv, indicators, analyzer, signals) + React/Vite frontend. Luồng dữ liệu: Binance REST/WS → PostgreSQL → Indicator Engine → Rule Engine + DeepSeek API → Signal Aggregator → REST API → React Dashboard.

**Tech Stack:** Node.js 20+, TypeScript 5, NestJS 10, TypeORM 0.3, PostgreSQL 16, `technicalindicators` npm, `openai` npm (gọi DeepSeek API), `@nestjs/websockets` + `socket.io` (real-time push), React 18, Vite 5, `socket.io-client`, TailwindCSS 3, Nx 19+

---

## File Structure

```
crypto-dss/
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       └── modules/
│   │           ├── binance/
│   │           │   ├── binance.module.ts
│   │           │   ├── binance.service.ts        ← REST API Binance
│   │           │   └── binance.types.ts          ← raw kline type
│   │           ├── ohlcv/
│   │           │   ├── ohlcv.module.ts
│   │           │   ├── ohlcv.entity.ts           ← TypeORM entity
│   │           │   ├── ohlcv.service.ts          ← CRUD candles
│   │           │   └── ohlcv.scheduler.ts        ← cron fetch
│   │           ├── indicators/
│   │           │   ├── indicators.module.ts
│   │           │   ├── indicators.service.ts     ← orchestrate all indicators
│   │           │   ├── trend.indicators.ts       ← EMA, SMA, MACD, ADX
│   │           │   ├── momentum.indicators.ts    ← RSI, StochRSI, CCI, ROC
│   │           │   ├── volatility.indicators.ts  ← BB, ATR, Keltner
│   │           │   ├── volume.indicators.ts      ← OBV, VWAP, MFI
│   │           │   └── patterns.indicators.ts    ← candlestick patterns
│   │           ├── analyzer/
│   │           │   ├── analyzer.module.ts
│   │           │   ├── analyzer.service.ts       ← orchestrate analysis
│   │           │   ├── rule-engine.service.ts    ← rule-based logic
│   │           │   ├── deepseek.service.ts       ← DeepSeek API client
│   │           │   └── prompt-builder.ts         ← tóm tắt data thành prompt
│   │           └── signals/
│   │               ├── signals.module.ts
│   │               ├── signals.entity.ts         ← lịch sử tín hiệu (chỉ ghi khi thay đổi)
│   │               ├── signals.service.ts        ← tổng hợp tín hiệu + change detection
│   │               ├── signals.controller.ts     ← REST endpoints
│   │               └── signals.gateway.ts        ← WebSocket gateway (Socket.io push)
│   └── frontend/
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── api/
│           │   └── signals.api.ts               ← fetch signals từ backend
│           ├── components/
│           │   ├── SignalCard.tsx                ← hiển thị BUY/SELL/HOLD
│           │   ├── CandlestickChart.tsx          ← lightweight-charts wrapper
│           │   └── IndicatorPanel.tsx            ← bảng indicators
│           └── pages/
│               └── Dashboard.tsx                ← trang chính
└── libs/
    └── shared-types/
        └── src/
            ├── index.ts
            ├── ohlcv.types.ts
            ├── indicator.types.ts
            └── signal.types.ts
```

---

## Phase 1 — Project Infrastructure

### Task 1: Khởi tạo Nx Monorepo

**Files:**
- Create: `package.json` (root)
- Create: `nx.json`
- Create: `apps/backend/` (NestJS)
- Create: `apps/frontend/` (React/Vite)
- Create: `libs/shared-types/`

- [ ] **Step 1: Tạo Nx workspace**

```bash
cd /home/sown/workplace/projects/crypto-dss
npx create-nx-workspace@19 . --preset=empty --packageManager=npm --nxCloud=skip
```

Expected: tạo `nx.json`, `package.json`, `tsconfig.base.json`

- [ ] **Step 2: Thêm NestJS app**

```bash
npx nx add @nx/nest
npx nx g @nx/nest:app backend --directory=apps/backend --no-interactive
```

Expected: tạo `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts`

- [ ] **Step 3: Thêm React app**

```bash
npx nx add @nx/react
npx nx g @nx/react:app frontend --directory=apps/frontend --bundler=vite --style=tailwind --no-interactive
```

Expected: tạo `apps/frontend/src/main.tsx`, `apps/frontend/src/app/app.tsx`

- [ ] **Step 4: Thêm shared-types library**

```bash
npx nx g @nx/js:lib shared-types --directory=libs/shared-types --bundler=tsc --no-interactive
```

- [ ] **Step 5: Install dependencies backend**

```bash
npm install --save \
  @nestjs/config \
  @nestjs/typeorm \
  @nestjs/schedule \
  typeorm \
  pg \
  axios \
  technicalindicators \
  openai

npm install --save-dev @types/node
```

- [ ] **Step 6: Install dependencies frontend**

```bash
npm install --save \
  lightweight-charts \
  @tanstack/react-query \
  axios
```

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Nx monorepo with NestJS backend and React frontend"
```

---

### Task 2: Shared Types

**Files:**
- Create: `libs/shared-types/src/ohlcv.types.ts`
- Create: `libs/shared-types/src/indicator.types.ts`
- Create: `libs/shared-types/src/signal.types.ts`
- Modify: `libs/shared-types/src/index.ts`

- [ ] **Step 1: Viết test cho shared types**

Tạo file `libs/shared-types/src/index.spec.ts`:

```typescript
import { SignalType, Timeframe } from './index';

describe('shared-types', () => {
  it('SignalType có 3 giá trị', () => {
    expect(Object.values(SignalType)).toEqual(['BUY', 'SELL', 'HOLD']);
  });

  it('Timeframe có 6 khung thời gian', () => {
    expect(Object.values(Timeframe)).toHaveLength(6);
    expect(Timeframe.ONE_DAY).toBe('1d');
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

```bash
npx nx test shared-types
```

Expected: FAIL — `SignalType` không tồn tại

- [ ] **Step 3: Tạo `ohlcv.types.ts`**

```typescript
export interface OhlcvCandle {
  symbol: string;
  timeframe: string;
  openTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: Date;
}
```

- [ ] **Step 4: Tạo `indicator.types.ts`**

```typescript
export interface TrendIndicators {
  ema9: number | null;
  ema21: number | null;
  ema50: number | null;
  ema200: number | null;
  dema9: number | null;   // Double EMA — phản ứng nhanh hơn EMA thường
  tema9: number | null;   // Triple EMA — giảm lag tối đa
  macd: { macd: number; signal: number; histogram: number } | null;
  adx: number | null;
  psar: number | null;    // Parabolic SAR — điểm đảo chiều xu hướng
  ichimoku: {
    conversion: number;   // Tenkan-sen (9)
    base: number;         // Kijun-sen (26)
    spanA: number;        // Senkou Span A — biên trên mây
    spanB: number;        // Senkou Span B — biên dưới mây
  } | null;
}

export interface MomentumIndicators {
  rsi14: number | null;
  stochRsi: { k: number; d: number } | null;
  stochastic: { k: number; d: number } | null;  // Stochastic thuần (K%, D%) — ít nhiễu hơn StochRSI
  williamsR: number | null;  // Williams %R [-100, 0] — nhạy hơn RSI trong crypto biến động
  cci: number | null;
  roc: number | null;
}

export interface VolatilityIndicators {
  bollingerBands: { upper: number; middle: number; lower: number } | null;
  atr: number | null;
}

export interface VolumeIndicators {
  obv: number | null;
  vwap: number | null;
  mfi: number | null;
  cmf: number | null;  // Chaikin Money Flow [-1, 1] — áp lực mua/bán chính xác hơn OBV
}

export interface CandlestickPatterns {
  doji: boolean;
  hammer: boolean;
  bullishEngulfing: boolean;
  bearishEngulfing: boolean;
  morningStar: boolean;
  eveningStar: boolean;
}

export interface AllIndicators {
  trend: TrendIndicators;
  momentum: MomentumIndicators;
  volatility: VolatilityIndicators;
  volume: VolumeIndicators;
  patterns: CandlestickPatterns;
}
```

- [ ] **Step 5: Tạo `signal.types.ts`**

```typescript
export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
}

export enum Timeframe {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
}

export interface SignalResult {
  id: number;
  symbol: string;
  timeframe: Timeframe;
  createdAt: Date;
  signal: SignalType;
  confidence: number;           // 0–1
  ruleSignal: SignalType | null;
  deepseekSignal: SignalType | null;
  deepseekReasoning: string | null;
  indicators: AllIndicators;
}
```

- [ ] **Step 6: Cập nhật `index.ts`**

```typescript
export * from './ohlcv.types';
export * from './indicator.types';
export * from './signal.types';
```

- [ ] **Step 7: Chạy test để xác nhận PASS**

```bash
npx nx test shared-types
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add libs/shared-types/
git commit -m "feat(shared-types): add OHLCV, indicator, and signal type definitions"
```

---

### Task 3: PostgreSQL Setup + TypeORM

**Files:**
- Create: `apps/backend/src/app.module.ts` (update)
- Create: `apps/backend/.env`

- [ ] **Step 1: Tạo file `.env` cho backend**

Tạo `apps/backend/.env`:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=crypto_dss
DEEPSEEK_API_KEY=your_deepseek_api_key_here
BINANCE_API_KEY=
BINANCE_API_SECRET=
```

- [ ] **Step 2: Chạy PostgreSQL qua Docker**

```bash
docker run -d \
  --name crypto-dss-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=crypto_dss \
  -p 5432:5432 \
  postgres:16-alpine
```

Expected: container `crypto-dss-postgres` running

- [ ] **Step 3: Cập nhật `app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { OhlcvEntity } from './modules/ohlcv/ohlcv.entity';
import { SignalEntity } from './modules/signals/signals.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [OhlcvEntity, SignalEntity],
        synchronize: true,  // chỉ dùng trong development
      }),
    }),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
```

- [ ] **Step 4: Chạy backend để xác nhận kết nối DB thành công**

```bash
npx nx serve backend
```

Expected: log `TypeORM connected to crypto_dss`

- [ ] **Step 5: Commit**

```bash
git add apps/backend/
git commit -m "feat(backend): setup TypeORM PostgreSQL connection with ConfigModule"
```

---

## Phase 2 — Data Collection

### Task 4: Binance Service + OHLCV Entity

**Files:**
- Create: `apps/backend/src/modules/binance/binance.types.ts`
- Create: `apps/backend/src/modules/binance/binance.service.ts`
- Create: `apps/backend/src/modules/binance/binance.module.ts`
- Create: `apps/backend/src/modules/ohlcv/ohlcv.entity.ts`
- Create: `apps/backend/src/modules/ohlcv/ohlcv.service.ts`
- Create: `apps/backend/src/modules/ohlcv/ohlcv.module.ts`
- Test: `apps/backend/src/modules/binance/binance.service.spec.ts`

- [ ] **Step 1: Tạo `binance.types.ts`**

```typescript
// Raw kline từ Binance API:
// [openTime, open, high, low, close, volume, closeTime, ...]
export type BinanceRawKline = [
  number, string, string, string, string, string,
  number, string, number, string, string, string
];
```

- [ ] **Step 2: Viết test cho BinanceService**

Tạo `apps/backend/src/modules/binance/binance.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { BinanceService } from './binance.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BinanceService', () => {
  let service: BinanceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BinanceService],
    }).compile();
    service = module.get(BinanceService);
  });

  it('fetchKlines trả về array OhlcvCandle đúng format', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        [1700000000000, '2000.5', '2050.0', '1980.0', '2030.0', '100.5',
         1700003599999, '204000', 500, '50.0', '100000', '0'],
      ],
    });

    const candles = await service.fetchKlines('ETHUSDT', '1h', 1);

    expect(candles).toHaveLength(1);
    expect(candles[0]).toMatchObject({
      symbol: 'ETHUSDT',
      timeframe: '1h',
      open: 2000.5,
      high: 2050.0,
      low: 1980.0,
      close: 2030.0,
      volume: 100.5,
    });
    expect(candles[0].openTime).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 3: Chạy test để xác nhận FAIL**

```bash
npx nx test backend --testFile=binance.service.spec.ts
```

Expected: FAIL — `BinanceService` không tồn tại

- [ ] **Step 4: Tạo `binance.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { OhlcvCandle } from '@crypto-dss/shared-types';
import { BinanceRawKline } from './binance.types';

const BINANCE_BASE_URL = 'https://api.binance.com';

@Injectable()
export class BinanceService {
  async fetchKlines(
    symbol: string,
    interval: string,
    limit = 500,
    startTime?: number,
    endTime?: number,
  ): Promise<OhlcvCandle[]> {
    const params: Record<string, string | number> = { symbol, interval, limit };
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const { data } = await axios.get<BinanceRawKline[]>(
      `${BINANCE_BASE_URL}/api/v3/klines`,
      { params },
    );

    return data.map((k) => ({
      symbol,
      timeframe: interval,
      openTime: new Date(k[0]),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
      closeTime: new Date(k[6]),
    }));
  }
}
```

- [ ] **Step 5: Tạo `binance.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';

@Module({
  providers: [BinanceService],
  exports: [BinanceService],
})
export class BinanceModule {}
```

- [ ] **Step 6: Tạo `ohlcv.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('ohlcv')
@Index(['symbol', 'timeframe', 'openTime'], { unique: true })
export class OhlcvEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  symbol: string;

  @Column({ length: 5 })
  timeframe: string;

  @Column({ type: 'timestamptz', name: 'open_time' })
  openTime: Date;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  open: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  high: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  low: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  close: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  volume: number;

  @Column({ type: 'timestamptz', name: 'close_time' })
  closeTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

- [ ] **Step 7: Tạo `ohlcv.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OhlcvEntity } from './ohlcv.entity';
import { OhlcvCandle } from '@crypto-dss/shared-types';

@Injectable()
export class OhlcvService {
  constructor(
    @InjectRepository(OhlcvEntity)
    private readonly repo: Repository<OhlcvEntity>,
  ) {}

  async upsertCandles(candles: OhlcvCandle[]): Promise<void> {
    if (candles.length === 0) return;
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(OhlcvEntity)
      .values(candles)
      .orIgnore()  // bỏ qua nếu đã tồn tại (unique constraint)
      .execute();
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where('open_time < :date', { date })
      .execute();
    return result.affected ?? 0;
  }

  async getCandles(
    symbol: string,
    timeframe: string,
    limit: number,
  ): Promise<OhlcvEntity[]> {
    return this.repo.find({
      where: { symbol, timeframe },
      order: { openTime: 'DESC' },
      take: limit,
    });
  }

  async getLatestCandle(symbol: string, timeframe: string): Promise<OhlcvEntity | null> {
    return this.repo.findOne({
      where: { symbol, timeframe },
      order: { openTime: 'DESC' },
    });
  }
}
```

- [ ] **Step 8: Tạo `ohlcv.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OhlcvEntity } from './ohlcv.entity';
import { OhlcvService } from './ohlcv.service';

@Module({
  imports: [TypeOrmModule.forFeature([OhlcvEntity])],
  providers: [OhlcvService],
  exports: [OhlcvService],
})
export class OhlcvModule {}
```

- [ ] **Step 9: Chạy test để xác nhận PASS**

```bash
npx nx test backend --testFile=binance.service.spec.ts
```

Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add apps/backend/src/modules/binance/ apps/backend/src/modules/ohlcv/
git commit -m "feat(backend): add BinanceService, OhlcvEntity, and OhlcvService"
```

---

### Task 5: OHLCV Data Scheduler

**Files:**
- Create: `apps/backend/src/modules/ohlcv/ohlcv.scheduler.ts`
- Modify: `apps/backend/src/modules/ohlcv/ohlcv.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Tạo `ohlcv.scheduler.ts`**

Scheduler chạy **mỗi 30 giây** để fetch candle mới nhất. Khi khởi động thì fetch lịch sử đầy đủ:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BinanceService } from '../binance/binance.service';
import { OhlcvService } from './ohlcv.service';
import { Timeframe } from '@crypto-dss/shared-types';

const SYMBOL = 'ETHUSDT';
const ALL_TIMEFRAMES = Object.values(Timeframe);

// Mỗi timeframe chỉ fetch đủ nến cần thiết cho cron 30s (chỉ 3 nến mới nhất)
// Việc fetch lịch sử đã được thực hiện lúc onModuleInit
const REALTIME_LIMIT = 3;

@Injectable()
export class OhlcvScheduler {
  private readonly logger = new Logger(OhlcvScheduler.name);

  constructor(
    private readonly binanceService: BinanceService,
    private readonly ohlcvService: OhlcvService,
  ) {}

  // Chạy mỗi 30 giây — chỉ fetch 3 nến mới nhất để cập nhật candle đang hình thành
  @Cron('*/30 * * * * *')
  async fetchRealtimeUpdate(): Promise<void> {
    await this.fetchAndStore(SYMBOL, ALL_TIMEFRAMES, REALTIME_LIMIT);
  }

  // Xóa OHLCV cũ hơn 2 năm — chạy hàng tuần vào Chủ nhật 2:00 AM
  @Cron('0 2 * * 0')
  async pruneOldData(): Promise<void> {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const deleted = await this.ohlcvService.deleteOlderThan(twoYearsAgo);
    this.logger.log(`Pruned ${deleted} OHLCV rows older than 2 years`);
  }

  // Chạy khi khởi động — fetch 500 nến lịch sử mỗi timeframe (chỉ 1 lần)
  async onModuleInit(): Promise<void> {
    this.logger.log('Fetching historical data on startup...');
    await this.fetchAndStore(SYMBOL, ALL_TIMEFRAMES, 500);
    this.logger.log('Historical data loaded. Starting 30s real-time updates.');
  }

  private async fetchAndStore(
    symbol: string,
    timeframes: string[],
    limit: number,
  ): Promise<void> {
    for (const tf of timeframes) {
      try {
        const candles = await this.binanceService.fetchKlines(symbol, tf, limit);
        await this.ohlcvService.upsertCandles(candles);
      } catch (err) {
        this.logger.error(`Failed to fetch ${symbol} ${tf}: ${(err as Error).message}`);
      }
    }
  }
}
```

- [ ] **Step 2: Cập nhật `ohlcv.module.ts` để thêm scheduler**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OhlcvEntity } from './ohlcv.entity';
import { OhlcvService } from './ohlcv.service';
import { OhlcvScheduler } from './ohlcv.scheduler';
import { BinanceModule } from '../binance/binance.module';

@Module({
  imports: [TypeOrmModule.forFeature([OhlcvEntity]), BinanceModule],
  providers: [OhlcvService, OhlcvScheduler],
  exports: [OhlcvService],
})
export class OhlcvModule {}
```

- [ ] **Step 3: Thêm OhlcvModule vào `app.module.ts`**

Thêm vào array `imports` trong `app.module.ts`:
```typescript
import { OhlcvModule } from './modules/ohlcv/ohlcv.module';
// ...
imports: [
  ConfigModule.forRoot({ ... }),
  TypeOrmModule.forRootAsync({ ... }),
  ScheduleModule.forRoot(),
  OhlcvModule,
],
```

- [ ] **Step 4: Test thủ công**

```bash
npx nx serve backend
```

Expected: log `Fetching historical data on startup...` rồi `Historical data fetch complete`. Kiểm tra DB:

```bash
docker exec -it crypto-dss-postgres psql -U postgres -d crypto_dss -c "SELECT timeframe, COUNT(*) FROM ohlcv GROUP BY timeframe;"
```

Expected: có rows cho mỗi timeframe

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/ohlcv/ohlcv.scheduler.ts apps/backend/src/modules/ohlcv/ohlcv.module.ts apps/backend/src/app.module.ts
git commit -m "feat(backend): add OHLCV scheduler to fetch and store Binance klines"
```

---

## Phase 3 — Analysis Engine

### Task 6: Indicators Service

**Files:**
- Create: `apps/backend/src/modules/indicators/trend.indicators.ts`
- Create: `apps/backend/src/modules/indicators/momentum.indicators.ts`
- Create: `apps/backend/src/modules/indicators/volatility.indicators.ts`
- Create: `apps/backend/src/modules/indicators/volume.indicators.ts`
- Create: `apps/backend/src/modules/indicators/patterns.indicators.ts`
- Create: `apps/backend/src/modules/indicators/indicators.service.ts`
- Create: `apps/backend/src/modules/indicators/indicators.module.ts`
- Test: `apps/backend/src/modules/indicators/indicators.service.spec.ts`

- [ ] **Step 1: Viết test cho IndicatorsService**

Tạo `apps/backend/src/modules/indicators/indicators.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { IndicatorsService } from './indicators.service';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';

function makeCandles(closes: number[]): OhlcvEntity[] {
  return closes.map((close, i) => ({
    id: i, symbol: 'ETHUSDT', timeframe: '1h',
    open: close - 5, high: close + 10, low: close - 10,
    close, volume: 100,
    openTime: new Date(Date.now() - (closes.length - i) * 3600000),
    closeTime: new Date(Date.now() - (closes.length - i - 1) * 3600000),
    createdAt: new Date(),
  }));
}

describe('IndicatorsService', () => {
  let service: IndicatorsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IndicatorsService],
    }).compile();
    service = module.get(IndicatorsService);
  });

  it('tính RSI trả về số trong khoảng 0-100', () => {
    const candles = makeCandles(Array.from({ length: 20 }, (_, i) => 2000 + i * 10));
    const result = service.calculate(candles);
    expect(result.momentum.rsi14).toBeGreaterThanOrEqual(0);
    expect(result.momentum.rsi14).toBeLessThanOrEqual(100);
  });

  it('trả về null cho EMA200 khi chưa đủ 200 nến', () => {
    const candles = makeCandles(Array.from({ length: 50 }, () => 2000));
    const result = service.calculate(candles);
    expect(result.trend.ema200).toBeNull();
  });

  it('phát hiện Doji khi body rất nhỏ', () => {
    const candles = makeCandles([2000]);
    candles[0].open = 2000;
    candles[0].close = 2000.1;
    candles[0].high = 2020;
    candles[0].low = 1980;
    const result = service.calculate(candles);
    expect(result.patterns.doji).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

```bash
npx nx test backend --testFile=indicators.service.spec.ts
```

Expected: FAIL

- [ ] **Step 3: Tạo `trend.indicators.ts`**

```typescript
import { EMA, DEMA, TEMA, MACD, ADX, PSAR, IchimokuCloud } from 'technicalindicators';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { TrendIndicators } from '@crypto-dss/shared-types';

export function calcTrend(candles: OhlcvEntity[]): TrendIndicators {
  const closes = candles.map((c) => Number(c.close));
  const highs  = candles.map((c) => Number(c.high));
  const lows   = candles.map((c) => Number(c.low));

  const last = <T>(arr: T[]): T | null => arr.length > 0 ? arr[arr.length - 1] : null;

  const ema9Result   = EMA.calculate({ period: 9,   values: closes });
  const ema21Result  = EMA.calculate({ period: 21,  values: closes });
  const ema50Result  = EMA.calculate({ period: 50,  values: closes });
  const ema200Result = EMA.calculate({ period: 200, values: closes });
  const dema9Result  = DEMA.calculate({ period: 9,  values: closes });
  const tema9Result  = TEMA.calculate({ period: 9,  values: closes });

  const macdResult = MACD.calculate({
    values: closes, fastPeriod: 12, slowPeriod: 26,
    signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false,
  });

  const adxResult  = ADX.calculate({ period: 14, high: highs, low: lows, close: closes });
  const psarResult = PSAR.calculate({ high: highs, low: lows, step: 0.02, max: 0.2 });

  // Ichimoku: cần ít nhất 52 + 26 = 78 nến để có đủ span B và displacement
  let ichimoku: TrendIndicators['ichimoku'] = null;
  if (candles.length >= 78) {
    const ichiResult = IchimokuCloud.calculate({
      high: highs, low: lows,
      conversionPeriod: 9, basePeriod: 26, spanPeriod: 52, displacement: 26,
    });
    const ichiLast = last(ichiResult);
    if (ichiLast) {
      ichimoku = {
        conversion: ichiLast.conversion,
        base:       ichiLast.base,
        spanA:      ichiLast.spanA,
        spanB:      ichiLast.spanB,
      };
    }
  }

  const macdLast = last(macdResult);

  return {
    ema9:   last(ema9Result),
    ema21:  last(ema21Result),
    ema50:  last(ema50Result),
    ema200: closes.length >= 200 ? last(ema200Result) : null,
    dema9:  last(dema9Result),
    tema9:  last(tema9Result),
    macd: macdLast
      ? { macd: macdLast.MACD ?? 0, signal: macdLast.signal ?? 0, histogram: macdLast.histogram ?? 0 }
      : null,
    adx:     last(adxResult)?.adx ?? null,
    psar:    last(psarResult),
    ichimoku,
  };
}
```

- [ ] **Step 4: Tạo `momentum.indicators.ts`**

```typescript
import { RSI, StochasticRSI, Stochastic, WilliamsR, CCI, ROC } from 'technicalindicators';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { MomentumIndicators } from '@crypto-dss/shared-types';

export function calcMomentum(candles: OhlcvEntity[]): MomentumIndicators {
  const closes = candles.map((c) => Number(c.close));
  const highs  = candles.map((c) => Number(c.high));
  const lows   = candles.map((c) => Number(c.low));

  const last = <T>(arr: T[]): T | null => arr.length > 0 ? arr[arr.length - 1] : null;

  const rsiResult       = RSI.calculate({ period: 14, values: closes });
  const stochRsiResult  = StochasticRSI.calculate({
    values: closes, rsiPeriod: 14, stochasticPeriod: 14, kPeriod: 3, dPeriod: 3,
  });
  // Stochastic Oscillator thuần (K%, D%) — dùng giá trực tiếp, ít nhiễu hơn StochRSI
  const stochResult = Stochastic.calculate({
    high: highs, low: lows, close: closes, period: 14, signalPeriod: 3,
  });
  // Williams %R: -100 (oversold) đến 0 (overbought)
  const wrResult  = WilliamsR.calculate({ high: highs, low: lows, close: closes, period: 14 });
  const cciResult = CCI.calculate({ period: 20, high: highs, low: lows, close: closes });
  const rocResult = ROC.calculate({ period: 12, values: closes });

  const stochRsiLast = last(stochRsiResult);
  const stochLast    = last(stochResult);

  return {
    rsi14:      last(rsiResult),
    stochRsi:   stochRsiLast ? { k: stochRsiLast.k, d: stochRsiLast.d } : null,
    stochastic: stochLast    ? { k: stochLast.k,    d: stochLast.d    } : null,
    williamsR:  last(wrResult),
    cci:        last(cciResult),
    roc:        last(rocResult),
  };
}
```

- [ ] **Step 5: Tạo `volatility.indicators.ts`**

```typescript
import { BollingerBands, ATR } from 'technicalindicators';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { VolatilityIndicators } from '@crypto-dss/shared-types';

export function calcVolatility(candles: OhlcvEntity[]): VolatilityIndicators {
  const closes = candles.map((c) => Number(c.close));
  const highs = candles.map((c) => Number(c.high));
  const lows = candles.map((c) => Number(c.low));

  const bbResult = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 });
  const atrResult = ATR.calculate({ period: 14, high: highs, low: lows, close: closes });

  const last = <T>(arr: T[]): T | null => arr.length > 0 ? arr[arr.length - 1] : null;
  const bbLast = last(bbResult);

  return {
    bollingerBands: bbLast ? { upper: bbLast.upper, middle: bbLast.middle, lower: bbLast.lower } : null,
    atr: last(atrResult),
  };
}
```

- [ ] **Step 6: Tạo `volume.indicators.ts`**

```typescript
import { OBV, MFI } from 'technicalindicators';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { VolumeIndicators } from '@crypto-dss/shared-types';

const CMF_PERIOD = 20;

// Chaikin Money Flow: đo áp lực mua/bán từ cả giá lẫn khối lượng
// Công thức: sum(MFM × Volume, 20) / sum(Volume, 20)
// MFM = ((Close - Low) - (High - Close)) / (High - Low)
function calcCMF(highs: number[], lows: number[], closes: number[], volumes: number[]): number | null {
  if (closes.length < CMF_PERIOD) return null;
  const slice = closes.length - CMF_PERIOD;
  let sumMFV = 0;
  let sumVol = 0;
  for (let i = slice; i < closes.length; i++) {
    const range = highs[i] - lows[i];
    if (range === 0) continue;
    const mfm = ((closes[i] - lows[i]) - (highs[i] - closes[i])) / range;
    sumMFV += mfm * volumes[i];
    sumVol += volumes[i];
  }
  return sumVol > 0 ? sumMFV / sumVol : null;
}

export function calcVolume(candles: OhlcvEntity[]): VolumeIndicators {
  const closes  = candles.map((c) => Number(c.close));
  const highs   = candles.map((c) => Number(c.high));
  const lows    = candles.map((c) => Number(c.low));
  const volumes = candles.map((c) => Number(c.volume));

  const last = <T>(arr: T[]): T | null => arr.length > 0 ? arr[arr.length - 1] : null;

  const obvResult = OBV.calculate({ close: closes, volume: volumes });
  const mfiResult = MFI.calculate({ period: 14, high: highs, low: lows, close: closes, volume: volumes });

  // VWAP: tính trên 200 nến gần nhất để tránh drift quá lớn
  const recentLen  = Math.min(200, candles.length);
  const recentCandles = candles.slice(-recentLen);
  const typicalPrices = recentCandles.map((c) => (Number(c.high) + Number(c.low) + Number(c.close)) / 3);
  const recentVols    = recentCandles.map((c) => Number(c.volume));
  const cumVolume     = recentVols.reduce((a, b) => a + b, 0);
  const vwap = cumVolume > 0
    ? typicalPrices.reduce((sum, tp, i) => sum + tp * recentVols[i], 0) / cumVolume
    : null;

  return {
    obv:  last(obvResult),
    vwap,
    mfi:  last(mfiResult),
    cmf:  calcCMF(highs, lows, closes, volumes),
  };
}
```

- [ ] **Step 7: Tạo `patterns.indicators.ts`**

```typescript
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { CandlestickPatterns } from '@crypto-dss/shared-types';

export function calcPatterns(candles: OhlcvEntity[]): CandlestickPatterns {
  if (candles.length === 0) {
    return { doji: false, hammer: false, bullishEngulfing: false, bearishEngulfing: false, morningStar: false, eveningStar: false };
  }

  const c = candles[candles.length - 1];
  const open = Number(c.open);
  const close = Number(c.close);
  const high = Number(c.high);
  const low = Number(c.low);
  const body = Math.abs(close - open);
  const range = high - low;

  // Doji: body < 10% của range
  const doji = range > 0 && body / range < 0.1;

  // Hammer: body nhỏ ở trên, bóng dưới dài (bullish)
  const lowerShadow = Math.min(open, close) - low;
  const upperShadow = high - Math.max(open, close);
  const hammer = body > 0 && lowerShadow >= 2 * body && upperShadow <= body * 0.3;

  // Engulfing: cần 2 nến
  let bullishEngulfing = false;
  let bearishEngulfing = false;
  if (candles.length >= 2) {
    const prev = candles[candles.length - 2];
    const prevOpen = Number(prev.open);
    const prevClose = Number(prev.close);
    // Bullish engulfing: nến trước đỏ, nến hiện tại xanh và bao trùm
    bullishEngulfing = prevClose < prevOpen && close > open && open < prevClose && close > prevOpen;
    // Bearish engulfing: nến trước xanh, nến hiện tại đỏ và bao trùm
    bearishEngulfing = prevClose > prevOpen && close < open && open > prevClose && close < prevOpen;
  }

  // Morning Star / Evening Star: cần 3 nến
  let morningStar = false;
  let eveningStar = false;
  if (candles.length >= 3) {
    const first = candles[candles.length - 3];
    const second = candles[candles.length - 2];
    const third = candles[candles.length - 1];
    const f = { open: Number(first.open), close: Number(first.close) };
    const s = { open: Number(second.open), close: Number(second.close), high: Number(second.high), low: Number(second.low) };
    const t = { open: Number(third.open), close: Number(third.close) };
    const sBody = Math.abs(s.close - s.open);
    const sRange = s.high - s.low;
    const sIsSmall = sRange > 0 && sBody / sRange < 0.3;
    // Morning Star: nến 1 đỏ mạnh, nến 2 nhỏ (star), nến 3 xanh mạnh
    morningStar = f.close < f.open && sIsSmall && t.close > t.open && t.close > (f.open + f.close) / 2;
    // Evening Star: nến 1 xanh mạnh, nến 2 nhỏ, nến 3 đỏ mạnh
    eveningStar = f.close > f.open && sIsSmall && t.close < t.open && t.close < (f.open + f.close) / 2;
  }

  return { doji, hammer, bullishEngulfing, bearishEngulfing, morningStar, eveningStar };
}
```

- [ ] **Step 8: Tạo `indicators.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { AllIndicators } from '@crypto-dss/shared-types';
import { calcTrend } from './trend.indicators';
import { calcMomentum } from './momentum.indicators';
import { calcVolatility } from './volatility.indicators';
import { calcVolume } from './volume.indicators';
import { calcPatterns } from './patterns.indicators';

@Injectable()
export class IndicatorsService {
  calculate(candles: OhlcvEntity[]): AllIndicators {
    // Sắp xếp theo thời gian tăng dần (cũ nhất → mới nhất)
    const sorted = [...candles].sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
    return {
      trend: calcTrend(sorted),
      momentum: calcMomentum(sorted),
      volatility: calcVolatility(sorted),
      volume: calcVolume(sorted),
      patterns: calcPatterns(sorted),
    };
  }
}
```

- [ ] **Step 9: Tạo `indicators.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';

@Module({
  providers: [IndicatorsService],
  exports: [IndicatorsService],
})
export class IndicatorsModule {}
```

- [ ] **Step 10: Chạy test**

```bash
npx nx test backend --testFile=indicators.service.spec.ts
```

Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add apps/backend/src/modules/indicators/
git commit -m "feat(backend): add technical indicators (trend, momentum, volatility, volume, patterns)"
```

---

### Task 7: Rule Engine + DeepSeek Service

**Files:**
- Create: `apps/backend/src/modules/analyzer/rule-engine.service.ts`
- Create: `apps/backend/src/modules/analyzer/prompt-builder.ts`
- Create: `apps/backend/src/modules/analyzer/deepseek.service.ts`
- Create: `apps/backend/src/modules/analyzer/analyzer.service.ts`
- Create: `apps/backend/src/modules/analyzer/analyzer.module.ts`
- Test: `apps/backend/src/modules/analyzer/rule-engine.service.spec.ts`

- [ ] **Step 1: Viết test cho rule engine**

Tạo `apps/backend/src/modules/analyzer/rule-engine.service.spec.ts`:

```typescript
import { RuleEngineService } from './rule-engine.service';
import { AllIndicators, SignalType } from '@crypto-dss/shared-types';

function makeIndicators(overrides: Partial<AllIndicators['momentum']> = {}): AllIndicators {
  return {
    trend: { ema9: 2100, ema21: 2050, ema50: 2000, ema200: 1900, macd: { macd: 10, signal: 5, histogram: 5 }, adx: 30 },
    momentum: { rsi14: 50, stochRsi: { k: 50, d: 50 }, cci: 0, roc: 0, ...overrides },
    volatility: { bollingerBands: { upper: 2200, middle: 2100, lower: 2000 }, atr: 50 },
    volume: { obv: 1000, vwap: 2050, mfi: 50 },
    patterns: { doji: false, hammer: false, bullishEngulfing: false, bearishEngulfing: false, morningStar: false, eveningStar: false },
  };
}

describe('RuleEngineService', () => {
  const service = new RuleEngineService();

  it('RSI < 30 → BUY', () => {
    const result = service.evaluate(makeIndicators({ rsi14: 25 }), 2000);
    expect(result.signal).toBe(SignalType.BUY);
  });

  it('RSI > 70 → SELL', () => {
    const result = service.evaluate(makeIndicators({ rsi14: 75 }), 2000);
    expect(result.signal).toBe(SignalType.SELL);
  });

  it('RSI bình thường → HOLD', () => {
    const result = service.evaluate(makeIndicators({ rsi14: 50 }), 2000);
    expect(result.signal).toBe(SignalType.HOLD);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

```bash
npx nx test backend --testFile=rule-engine.service.spec.ts
```

Expected: FAIL

- [ ] **Step 3: Tạo `rule-engine.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { AllIndicators, SignalType } from '@crypto-dss/shared-types';

export interface RuleResult {
  signal: SignalType;
  confidence: number;  // 0–1
  reasons: string[];
}

@Injectable()
export class RuleEngineService {
  evaluate(indicators: AllIndicators, currentPrice: number): RuleResult {
    const bullishSignals: string[] = [];
    const bearishSignals: string[] = [];

    const { trend, momentum, volatility, volume, patterns } = indicators;

    // --- Trend rules ---
    if (trend.ema9 && trend.ema21 && trend.ema9 > trend.ema21) {
      bullishSignals.push('EMA9 > EMA21 (bullish crossover)');
    } else if (trend.ema9 && trend.ema21 && trend.ema9 < trend.ema21) {
      bearishSignals.push('EMA9 < EMA21 (bearish crossover)');
    }

    if (trend.macd && trend.macd.histogram > 0) {
      bullishSignals.push('MACD histogram positive');
    } else if (trend.macd && trend.macd.histogram < 0) {
      bearishSignals.push('MACD histogram negative');
    }

    // --- Momentum rules ---
    if (momentum.rsi14 !== null) {
      if (momentum.rsi14 < 30) bullishSignals.push(`RSI oversold (${momentum.rsi14.toFixed(1)})`);
      else if (momentum.rsi14 > 70) bearishSignals.push(`RSI overbought (${momentum.rsi14.toFixed(1)})`);
    }

    if (momentum.stochRsi && momentum.stochRsi.k < 20) {
      bullishSignals.push('StochRSI oversold');
    } else if (momentum.stochRsi && momentum.stochRsi.k > 80) {
      bearishSignals.push('StochRSI overbought');
    }

    // --- Volatility rules ---
    if (volatility.bollingerBands && currentPrice < volatility.bollingerBands.lower) {
      bullishSignals.push('Price below lower Bollinger Band');
    } else if (volatility.bollingerBands && currentPrice > volatility.bollingerBands.upper) {
      bearishSignals.push('Price above upper Bollinger Band');
    }

    // --- Volume rules ---
    if (volume.mfi !== null && volume.mfi < 20) {
      bullishSignals.push(`MFI oversold (${volume.mfi.toFixed(1)})`);
    } else if (volume.mfi !== null && volume.mfi > 80) {
      bearishSignals.push(`MFI overbought (${volume.mfi.toFixed(1)})`);
    }
    // CMF: > 0.05 = buying pressure, < -0.05 = selling pressure
    if (volume.cmf !== null && volume.cmf > 0.05) {
      bullishSignals.push(`CMF buying pressure (${volume.cmf.toFixed(3)})`);
    } else if (volume.cmf !== null && volume.cmf < -0.05) {
      bearishSignals.push(`CMF selling pressure (${volume.cmf.toFixed(3)})`);
    }

    // --- Ichimoku rules ---
    if (trend.ichimoku && currentPrice > 0) {
      const { conversion, base, spanA, spanB } = trend.ichimoku;
      const cloudTop    = Math.max(spanA, spanB);
      const cloudBottom = Math.min(spanA, spanB);
      if (currentPrice > cloudTop && conversion > base) {
        bullishSignals.push('Price above Ichimoku Cloud + Tenkan > Kijun (strong bull)');
      } else if (currentPrice < cloudBottom && conversion < base) {
        bearishSignals.push('Price below Ichimoku Cloud + Tenkan < Kijun (strong bear)');
      }
    }

    // --- PSAR rules ---
    if (trend.psar !== null && currentPrice > 0) {
      if (currentPrice > trend.psar) {
        bullishSignals.push(`PSAR below price — uptrend (${trend.psar.toFixed(2)})`);
      } else {
        bearishSignals.push(`PSAR above price — downtrend (${trend.psar.toFixed(2)})`);
      }
    }

    // --- Williams %R rules ---
    if (momentum.williamsR !== null) {
      if (momentum.williamsR < -80) {
        bullishSignals.push(`Williams %%R oversold (${momentum.williamsR.toFixed(1)})`);
      } else if (momentum.williamsR > -20) {
        bearishSignals.push(`Williams %%R overbought (${momentum.williamsR.toFixed(1)})`);
      }
    }

    // --- Stochastic rules ---
    if (momentum.stochastic) {
      if (momentum.stochastic.k < 20 && momentum.stochastic.d < 20) {
        bullishSignals.push('Stochastic oversold zone');
      } else if (momentum.stochastic.k > 80 && momentum.stochastic.d > 80) {
        bearishSignals.push('Stochastic overbought zone');
      }
    }

    // --- Candlestick pattern rules ---
    if (patterns.bullishEngulfing || patterns.morningStar || patterns.hammer) {
      bullishSignals.push('Bullish candlestick pattern detected');
    }
    if (patterns.bearishEngulfing || patterns.eveningStar) {
      bearishSignals.push('Bearish candlestick pattern detected');
    }

    const total = bullishSignals.length + bearishSignals.length;
    if (total === 0) {
      return { signal: SignalType.HOLD, confidence: 0.5, reasons: ['No strong signals'] };
    }

    if (bullishSignals.length > bearishSignals.length) {
      return {
        signal: SignalType.BUY,
        confidence: 0.5 + (bullishSignals.length - bearishSignals.length) / (total * 2),
        reasons: bullishSignals,
      };
    } else if (bearishSignals.length > bullishSignals.length) {
      return {
        signal: SignalType.SELL,
        confidence: 0.5 + (bearishSignals.length - bullishSignals.length) / (total * 2),
        reasons: bearishSignals,
      };
    } else {
      return { signal: SignalType.HOLD, confidence: 0.5, reasons: [...bullishSignals, ...bearishSignals] };
    }
  }
}
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

```bash
npx nx test backend --testFile=rule-engine.service.spec.ts
```

Expected: PASS

- [ ] **Step 5: Tạo `prompt-builder.ts`**

Builder tạo prompt tóm tắt đa khung thời gian cho DeepSeek, tránh tràn token:

```typescript
import { OhlcvEntity } from '../ohlcv/ohlcv.entity';
import { AllIndicators } from '@crypto-dss/shared-types';
import { RuleResult } from './rule-engine.service';

interface TimeframeSnapshot {
  timeframe: string;
  candles: OhlcvEntity[];
  indicators: AllIndicators;
}

export interface PromptContext {
  symbol: string;
  currentPrice: number;
  snapshots: TimeframeSnapshot[];
  ruleResult: RuleResult;
}

// Tóm tắt candles thành dạng text gọn
function summarizeCandles(candles: OhlcvEntity[], maxPoints: number): string {
  if (candles.length === 0) return 'No data';
  const step = Math.max(1, Math.floor(candles.length / maxPoints));
  const sampled = candles.filter((_, i) => i % step === 0).slice(-maxPoints);
  return sampled
    .map((c) => `${c.openTime.toISOString().slice(0, 10)} O:${Number(c.open).toFixed(2)} H:${Number(c.high).toFixed(2)} L:${Number(c.low).toFixed(2)} C:${Number(c.close).toFixed(2)} V:${Number(c.volume).toFixed(0)}`)
    .join('\n');
}

function formatIndicators(ind: AllIndicators): string {
  const { trend, momentum, volatility, volume, patterns } = ind;
  const lines: string[] = [];

  // Trend
  lines.push(`EMA: 9=${trend.ema9?.toFixed(2) ?? 'N/A'} 21=${trend.ema21?.toFixed(2) ?? 'N/A'} 50=${trend.ema50?.toFixed(2) ?? 'N/A'} 200=${trend.ema200?.toFixed(2) ?? 'N/A'}`);
  lines.push(`DEMA9=${trend.dema9?.toFixed(2) ?? 'N/A'} TEMA9=${trend.tema9?.toFixed(2) ?? 'N/A'}`);
  if (trend.macd) lines.push(`MACD: ${trend.macd.macd.toFixed(4)} Signal:${trend.macd.signal.toFixed(4)} Hist:${trend.macd.histogram.toFixed(4)}`);
  if (trend.adx)  lines.push(`ADX: ${trend.adx.toFixed(1)}`);
  if (trend.psar) lines.push(`PSAR: ${trend.psar.toFixed(2)}`);
  if (trend.ichimoku) {
    lines.push(`Ichimoku Tenkan:${trend.ichimoku.conversion.toFixed(2)} Kijun:${trend.ichimoku.base.toFixed(2)}`);
    lines.push(`Ichimoku SpanA:${trend.ichimoku.spanA.toFixed(2)} SpanB:${trend.ichimoku.spanB.toFixed(2)}`);
  }
  // Momentum
  lines.push(`RSI(14): ${momentum.rsi14?.toFixed(1) ?? 'N/A'}`);
  if (momentum.stochRsi)   lines.push(`StochRSI K:${momentum.stochRsi.k.toFixed(1)} D:${momentum.stochRsi.d.toFixed(1)}`);
  if (momentum.stochastic) lines.push(`Stochastic K:${momentum.stochastic.k.toFixed(1)} D:${momentum.stochastic.d.toFixed(1)}`);
  if (momentum.williamsR !== null) lines.push(`Williams%%R: ${momentum.williamsR.toFixed(1)}`);
  if (momentum.cci) lines.push(`CCI: ${momentum.cci.toFixed(1)}`);
  // Volatility
  if (volatility.bollingerBands) {
    const bb = volatility.bollingerBands;
    lines.push(`BB Upper:${bb.upper.toFixed(2)} Mid:${bb.middle.toFixed(2)} Lower:${bb.lower.toFixed(2)}`);
  }
  if (volatility.atr) lines.push(`ATR: ${volatility.atr.toFixed(2)}`);
  // Volume
  if (volume.vwap) lines.push(`VWAP: ${volume.vwap.toFixed(2)}`);
  if (volume.mfi)  lines.push(`MFI: ${volume.mfi.toFixed(1)}`);
  if (volume.cmf !== null) lines.push(`CMF: ${volume.cmf.toFixed(3)}`);

  const activePatterns = Object.entries(patterns).filter(([, v]) => v).map(([k]) => k);
  if (activePatterns.length > 0) lines.push(`Patterns: ${activePatterns.join(', ')}`);

  return lines.join('\n');
}

export function buildPrompt(ctx: PromptContext): string {
  const sections: string[] = [];

  sections.push(`You are a professional crypto technical analyst. Analyze ${ctx.symbol} and give a trading signal.`);
  sections.push(`Current price: $${ctx.currentPrice.toFixed(2)}`);
  sections.push('');

  // Multi-timeframe overview — nén dữ liệu theo từng khung
  const tfConfig: Record<string, { maxPoints: number; label: string }> = {
    '1d':  { maxPoints: 24,  label: '2-year overview (daily)' },
    '4h':  { maxPoints: 20,  label: '3-month overview (4h)' },
    '1h':  { maxPoints: 24,  label: '1-month detail (1h)' },
    '15m': { maxPoints: 20,  label: '1-week detail (15m)' },
    '5m':  { maxPoints: 12,  label: 'Recent 1-hour (5m)' },
    '1m':  { maxPoints: 10,  label: 'Last 10 minutes (1m)' },
  };

  for (const snap of ctx.snapshots) {
    const cfg = tfConfig[snap.timeframe];
    if (!cfg) continue;

    sections.push(`## ${cfg.label} [${snap.timeframe}]`);
    sections.push('### OHLCV Summary:');
    sections.push(summarizeCandles(snap.candles, cfg.maxPoints));
    sections.push('### Indicators:');
    sections.push(formatIndicators(snap.indicators));
    sections.push('');
  }

  sections.push('## Rule-based pre-analysis:');
  sections.push(`Signal: ${ctx.ruleResult.signal}`);
  sections.push(`Reasons: ${ctx.ruleResult.reasons.join('; ')}`);
  sections.push('');

  sections.push('## Your task:');
  sections.push('Based on the multi-timeframe analysis above, provide:');
  sections.push('1. Signal: BUY, SELL, or HOLD');
  sections.push('2. Confidence: 0.0 to 1.0');
  sections.push('3. Reasoning: 3-5 sentences explaining key factors');
  sections.push('');
  sections.push('Respond in this exact JSON format:');
  sections.push('{"signal":"BUY","confidence":0.75,"reasoning":"Your analysis here"}');

  return sections.join('\n');
}
```

- [ ] **Step 6: Tạo `deepseek.service.ts`**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SignalType } from '@crypto-dss/shared-types';

export interface DeepSeekResult {
  signal: SignalType;
  confidence: number;
  reasoning: string;
}

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name);
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: this.config.get<string>('DEEPSEEK_API_KEY') ?? '',
    });
  }

  async analyze(prompt: string): Promise<DeepSeekResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 512,
      });

      const content = response.choices[0]?.message?.content ?? '';
      // Extract JSON từ response
      const jsonMatch = content.match(/\{[^}]+\}/s);
      if (!jsonMatch) throw new Error('No JSON in DeepSeek response');

      const parsed = JSON.parse(jsonMatch[0]) as {
        signal: string;
        confidence: number;
        reasoning: string;
      };

      const signal = parsed.signal.toUpperCase() as SignalType;
      if (!Object.values(SignalType).includes(signal)) {
        throw new Error(`Invalid signal: ${parsed.signal}`);
      }

      return {
        signal,
        confidence: Math.max(0, Math.min(1, parsed.confidence)),
        reasoning: parsed.reasoning,
      };
    } catch (err) {
      this.logger.error(`DeepSeek analysis failed: ${(err as Error).message}`);
      // Fallback: trả về HOLD nếu lỗi
      return { signal: SignalType.HOLD, confidence: 0.5, reasoning: 'Analysis unavailable' };
    }
  }
}
```

- [ ] **Step 7: Tạo `analyzer.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { OhlcvService } from '../ohlcv/ohlcv.service';
import { IndicatorsService } from '../indicators/indicators.service';
import { RuleEngineService } from './rule-engine.service';
import { DeepSeekService } from './deepseek.service';
import { buildPrompt } from './prompt-builder';
import { AllIndicators, SignalType, Timeframe } from '@crypto-dss/shared-types';

export interface AnalysisResult {
  symbol: string;
  timeframe: Timeframe;
  ruleSignal: SignalType;
  ruleConfidence: number;
  deepseekSignal: SignalType;
  deepseekConfidence: number;
  deepseekReasoning: string;
  finalSignal: SignalType;
  finalConfidence: number;
  indicators: AllIndicators;
}

@Injectable()
export class AnalyzerService {
  constructor(
    private readonly ohlcvService: OhlcvService,
    private readonly indicatorsService: IndicatorsService,
    private readonly ruleEngine: RuleEngineService,
    private readonly deepseek: DeepSeekService,
  ) {}

  async analyze(symbol: string, primaryTimeframe: Timeframe): Promise<AnalysisResult> {
    // Lấy candles cho primary timeframe để tính indicators chính
    const primaryCandles = await this.ohlcvService.getCandles(symbol, primaryTimeframe, 500);
    const indicators = this.indicatorsService.calculate(primaryCandles);

    const currentPrice = primaryCandles.length > 0
      ? Number(primaryCandles[0].close)
      : 0;

    // Rule-based analysis
    const ruleResult = this.ruleEngine.evaluate(indicators, currentPrice);

    // Build multi-timeframe snapshot cho DeepSeek
    const allTimeframes = Object.values(Timeframe);
    const snapshots = await Promise.all(
      allTimeframes.map(async (tf) => {
        const candles = await this.ohlcvService.getCandles(symbol, tf, 500);
        const tfIndicators = this.indicatorsService.calculate(candles);
        return { timeframe: tf, candles, indicators: tfIndicators };
      }),
    );

    const prompt = buildPrompt({
      symbol,
      currentPrice,
      snapshots,
      ruleResult,
    });

    const deepseekResult = await this.deepseek.analyze(prompt);

    // Kết hợp: Rule (40%) + DeepSeek (60%)
    const signals = [
      { signal: ruleResult.signal, weight: 0.4 },
      { signal: deepseekResult.signal, weight: 0.6 },
    ];

    // Đếm weighted votes
    const votes = { BUY: 0, SELL: 0, HOLD: 0 };
    for (const s of signals) votes[s.signal] += s.weight;

    const finalSignal = (Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]) as SignalType;
    const finalConfidence = (ruleResult.confidence * 0.4 + deepseekResult.confidence * 0.6);

    return {
      symbol,
      timeframe: primaryTimeframe,
      ruleSignal: ruleResult.signal,
      ruleConfidence: ruleResult.confidence,
      deepseekSignal: deepseekResult.signal,
      deepseekConfidence: deepseekResult.confidence,
      deepseekReasoning: deepseekResult.reasoning,
      finalSignal,
      finalConfidence,
      indicators,
    };
  }
}
```

- [ ] **Step 8: Tạo `analyzer.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AnalyzerService } from './analyzer.service';
import { RuleEngineService } from './rule-engine.service';
import { DeepSeekService } from './deepseek.service';
import { OhlcvModule } from '../ohlcv/ohlcv.module';
import { IndicatorsModule } from '../indicators/indicators.module';

@Module({
  imports: [OhlcvModule, IndicatorsModule],
  providers: [AnalyzerService, RuleEngineService, DeepSeekService],
  exports: [AnalyzerService],
})
export class AnalyzerModule {}
```

- [ ] **Step 9: Commit**

```bash
git add apps/backend/src/modules/analyzer/
git commit -m "feat(backend): add rule engine, DeepSeek service, prompt builder, and analyzer orchestration"
```

---

### Task 8: Signals Module + REST API

**Files:**
- Create: `apps/backend/src/modules/signals/signals.entity.ts`
- Create: `apps/backend/src/modules/signals/signals.service.ts`
- Create: `apps/backend/src/modules/signals/signals.controller.ts`
- Create: `apps/backend/src/modules/signals/signals.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- Create: `apps/backend/src/modules/signals/signals.gateway.ts`

- [ ] **Step 1: Tạo `signals.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('signals')
@Index(['symbol', 'timeframe', 'createdAt'])
export class SignalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  symbol: string;

  @Column({ length: 5 })
  timeframe: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ length: 4 })
  signal: string;

  @Column({ type: 'decimal', precision: 4, scale: 3, name: 'confidence' })
  confidence: number;

  @Column({ length: 4, nullable: true, name: 'rule_signal' })
  ruleSignal: string | null;

  @Column({ length: 4, nullable: true, name: 'deepseek_signal' })
  deepseekSignal: string | null;

  @Column({ type: 'text', nullable: true, name: 'deepseek_reasoning' })
  deepseekReasoning: string | null;

  @Column({ type: 'jsonb' })
  indicators: object;
}
```

- [ ] **Step 2: Tạo `signals.service.ts`** với change detection + data retention

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignalEntity } from './signals.entity';
import { AnalyzerService } from '../analyzer/analyzer.service';
import { Timeframe } from '@crypto-dss/shared-types';

const MAX_SIGNALS_PER_TIMEFRAME = 200;  // giới hạn số signal lưu mỗi TF

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @InjectRepository(SignalEntity)
    private readonly repo: Repository<SignalEntity>,
    private readonly analyzer: AnalyzerService,
  ) {}

  // Chạy bởi scheduler mỗi 30s — chỉ lưu nếu signal thay đổi
  async runAnalysisIfChanged(symbol: string, timeframe: Timeframe): Promise<SignalEntity | null> {
    const result = await this.analyzer.analyze(symbol, timeframe);
    const latest = await this.getLatest(symbol, timeframe);

    // Nếu signal không đổi → không lưu, không notify
    if (latest && latest.signal === result.finalSignal) {
      return null;
    }

    this.logger.log(
      `Signal changed [${timeframe}]: ${latest?.signal ?? 'none'} → ${result.finalSignal} (${Math.round(result.finalConfidence * 100)}%)`,
    );

    const entity = this.repo.create({
      symbol: result.symbol,
      timeframe: result.timeframe,
      signal: result.finalSignal,
      confidence: result.finalConfidence,
      ruleSignal: result.ruleSignal,
      deepseekSignal: result.deepseekSignal,
      deepseekReasoning: result.deepseekReasoning,
      indicators: result.indicators as object,
    });

    const saved = await this.repo.save(entity);

    // Giữ tối đa MAX_SIGNALS_PER_TIMEFRAME rows, xóa cũ nhất nếu vượt
    await this.pruneOldSignals(symbol, timeframe);

    return saved;
  }

  // Gọi thủ công từ REST API (luôn chạy, không cần check change)
  async generateAndSave(symbol: string, timeframe: Timeframe): Promise<SignalEntity> {
    const result = await this.analyzer.analyze(symbol, timeframe);
    const entity = this.repo.create({
      symbol: result.symbol,
      timeframe: result.timeframe,
      signal: result.finalSignal,
      confidence: result.finalConfidence,
      ruleSignal: result.ruleSignal,
      deepseekSignal: result.deepseekSignal,
      deepseekReasoning: result.deepseekReasoning,
      indicators: result.indicators as object,
    });
    return this.repo.save(entity);
  }

  async getLatest(symbol: string, timeframe: Timeframe): Promise<SignalEntity | null> {
    return this.repo.findOne({
      where: { symbol, timeframe },
      order: { createdAt: 'DESC' },
    });
  }

  async getHistory(symbol: string, timeframe: Timeframe, limit = 20): Promise<SignalEntity[]> {
    return this.repo.find({
      where: { symbol, timeframe },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async pruneOldSignals(symbol: string, timeframe: Timeframe): Promise<void> {
    // Xóa các signals cũ hơn MAX_SIGNALS_PER_TIMEFRAME
    const oldSignals = await this.repo.find({
      where: { symbol, timeframe },
      order: { createdAt: 'DESC' },
      skip: MAX_SIGNALS_PER_TIMEFRAME,
    });
    if (oldSignals.length > 0) {
      await this.repo.remove(oldSignals);
    }
  }
}
```

- [ ] **Step 3: Tạo `signals.controller.ts`**

```typescript
import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { Timeframe } from '@crypto-dss/shared-types';

@Controller('api/signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  // POST /api/signals/generate?symbol=ETHUSDT&timeframe=1h
  @Post('generate')
  generate(
    @Query('symbol') symbol = 'ETHUSDT',
    @Query('timeframe') timeframe: Timeframe = Timeframe.ONE_HOUR,
  ) {
    return this.signalsService.generateAndSave(symbol, timeframe);
  }

  // GET /api/signals/latest?symbol=ETHUSDT&timeframe=1h
  @Get('latest')
  getLatest(
    @Query('symbol') symbol = 'ETHUSDT',
    @Query('timeframe') timeframe: Timeframe = Timeframe.ONE_HOUR,
  ) {
    return this.signalsService.getLatest(symbol, timeframe);
  }

  // GET /api/signals/history?symbol=ETHUSDT&timeframe=1h&limit=20
  @Get('history')
  getHistory(
    @Query('symbol') symbol = 'ETHUSDT',
    @Query('timeframe') timeframe: Timeframe = Timeframe.ONE_HOUR,
    @Query('limit') limit = 20,
  ) {
    return this.signalsService.getHistory(symbol, timeframe, +limit);
  }
}
```

- [ ] **Step 4: Tạo `signals.gateway.ts`** — WebSocket push khi signal thay đổi

```typescript
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SignalEntity } from './signals.entity';

@WebSocketGateway({ cors: { origin: 'http://localhost:4200' } })
export class SignalsGateway {
  @WebSocketServer()
  server: Server;

  // Gọi từ SignalsService khi có signal mới
  broadcastSignalChange(signal: SignalEntity): void {
    this.server.emit('signal:changed', {
      symbol: signal.symbol,
      timeframe: signal.timeframe,
      signal: signal.signal,
      confidence: Number(signal.confidence),
      deepseekReasoning: signal.deepseekReasoning,
      createdAt: signal.createdAt,
    });
  }
}
```

- [ ] **Step 5: Kết nối gateway vào `signals.service.ts`**

Cập nhật `runAnalysisIfChanged` để gọi gateway sau khi lưu signal:

```typescript
// Thêm vào constructor:
constructor(
  @InjectRepository(SignalEntity) private readonly repo: Repository<SignalEntity>,
  private readonly analyzer: AnalyzerService,
  private readonly gateway: SignalsGateway,  // inject gateway
) {}

// Trong runAnalysisIfChanged, sau `const saved = await this.repo.save(entity);`:
this.gateway.broadcastSignalChange(saved);
```

- [ ] **Step 6: Thêm scheduler mỗi 30s vào `signals.service.ts`**

Tạo `apps/backend/src/modules/signals/signals.scheduler.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SignalsService } from './signals.service';
import { Timeframe } from '@crypto-dss/shared-types';

const SYMBOL = 'ETHUSDT';
const TIMEFRAMES_TO_ANALYZE = [
  Timeframe.ONE_HOUR,
  Timeframe.FOUR_HOURS,
  Timeframe.ONE_DAY,
  Timeframe.FIFTEEN_MINUTES,
];

@Injectable()
export class SignalsScheduler {
  private readonly logger = new Logger(SignalsScheduler.name);

  constructor(private readonly signalsService: SignalsService) {}

  // Mỗi 30 giây: chạy analysis, chỉ push nếu signal thay đổi
  @Cron('*/30 * * * * *')
  async analyzeAll(): Promise<void> {
    for (const tf of TIMEFRAMES_TO_ANALYZE) {
      try {
        const changed = await this.signalsService.runAnalysisIfChanged(SYMBOL, tf);
        if (changed) {
          this.logger.log(`New signal pushed for ${SYMBOL} ${tf}: ${changed.signal}`);
        }
      } catch (err) {
        this.logger.error(`Analysis failed [${tf}]: ${(err as Error).message}`);
      }
    }
  }
}
```

- [ ] **Step 7: Tạo `signals.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignalEntity } from './signals.entity';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { SignalsGateway } from './signals.gateway';
import { SignalsScheduler } from './signals.scheduler';
import { AnalyzerModule } from '../analyzer/analyzer.module';

@Module({
  imports: [TypeOrmModule.forFeature([SignalEntity]), AnalyzerModule],
  providers: [SignalsService, SignalsGateway, SignalsScheduler],
  controllers: [SignalsController],
})
export class SignalsModule {}
```

- [ ] **Step 8: Install socket.io trên backend**

```bash
npm install --save @nestjs/websockets @nestjs/platform-socket.io socket.io
```

- [ ] **Step 5: Thêm SignalsModule vào `app.module.ts`**

```typescript
import { SignalsModule } from './modules/signals/signals.module';
// Thêm vào imports array:
SignalsModule,
```

- [ ] **Step 6: Bật CORS trong `main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:4200' });
  await app.listen(3000);
}
bootstrap();
```

- [ ] **Step 7: Test API thủ công**

```bash
npx nx serve backend
# Trong terminal khác:
curl -X POST "http://localhost:3000/api/signals/generate?symbol=ETHUSDT&timeframe=1h"
curl "http://localhost:3000/api/signals/latest?symbol=ETHUSDT&timeframe=1h"
```

Expected: JSON với `signal`, `confidence`, `deepseekReasoning`

- [ ] **Step 8: Commit**

```bash
git add apps/backend/src/modules/signals/ apps/backend/src/main.ts apps/backend/src/app.module.ts
git commit -m "feat(backend): add signals module with generate/latest/history REST endpoints"
```

---

## Phase 4 — React Frontend

### Task 9: Frontend Setup + API Client

**Files:**
- Modify: `apps/frontend/src/main.tsx`
- Modify: `apps/frontend/src/App.tsx`
- Create: `apps/frontend/src/api/signals.api.ts`

- [ ] **Step 1: Cấu hình TailwindCSS**

Kiểm tra `apps/frontend/tailwind.config.js` đã được tạo bởi Nx. Nếu chưa có:

```bash
npx nx g @nx/react:setup-tailwind --project=frontend
```

- [ ] **Step 2: Cập nhật `main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchInterval: 60000 } }, // auto refresh mỗi 60s
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

- [ ] **Step 3: Tạo `api/signals.api.ts`**

```typescript
import axios from 'axios';
import { SignalResult, Timeframe } from '@crypto-dss/shared-types';

const API_BASE = 'http://localhost:3000/api';

export async function fetchLatestSignal(
  symbol: string,
  timeframe: Timeframe,
): Promise<SignalResult | null> {
  const { data } = await axios.get<SignalResult>(`${API_BASE}/signals/latest`, {
    params: { symbol, timeframe },
  });
  return data;
}

export async function fetchSignalHistory(
  symbol: string,
  timeframe: Timeframe,
  limit = 20,
): Promise<SignalResult[]> {
  const { data } = await axios.get<SignalResult[]>(`${API_BASE}/signals/history`, {
    params: { symbol, timeframe, limit },
  });
  return data;
}

export async function generateSignal(
  symbol: string,
  timeframe: Timeframe,
): Promise<SignalResult> {
  const { data } = await axios.post<SignalResult>(`${API_BASE}/signals/generate`, null, {
    params: { symbol, timeframe },
  });
  return data;
}
```

- [ ] **Step 4: Tạo `hooks/useSignalSocket.ts`** — lắng nghe WebSocket push

```typescript
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

export interface SignalChangedEvent {
  symbol: string;
  timeframe: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  deepseekReasoning: string | null;
  createdAt: string;
}

export function useSignalSocket(
  onSignalChanged: (event: SignalChangedEvent) => void,
): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket = io('http://localhost:3000');

    socket.on('signal:changed', (event: SignalChangedEvent) => {
      // Invalidate cache để UI cập nhật dữ liệu mới
      queryClient.invalidateQueries({
        queryKey: ['signal', event.symbol, event.timeframe],
      });
      // Gọi callback để hiển thị toast notification
      onSignalChanged(event);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
}
```

- [ ] **Step 5: Install socket.io-client**

```bash
npm install --save socket.io-client
```

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/
git commit -m "feat(frontend): setup QueryClient, signals API client, and WebSocket hook"
```

---

### Task 10: Dashboard Components

**Files:**
- Create: `apps/frontend/src/components/SignalCard.tsx`
- Create: `apps/frontend/src/components/IndicatorPanel.tsx`
- Create: `apps/frontend/src/pages/Dashboard.tsx`
- Modify: `apps/frontend/src/App.tsx`

- [ ] **Step 1: Tạo `SignalCard.tsx`**

```tsx
import { SignalResult, SignalType } from '@crypto-dss/shared-types';

interface Props {
  signal: SignalResult | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const signalColors: Record<SignalType, string> = {
  BUY: 'bg-green-500',
  SELL: 'bg-red-500',
  HOLD: 'bg-yellow-500',
};

export function SignalCard({ signal, isLoading, onRefresh }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl p-6 bg-gray-800 animate-pulse">
        <div className="h-8 w-24 bg-gray-600 rounded mb-4" />
        <div className="h-4 w-48 bg-gray-600 rounded" />
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="rounded-xl p-6 bg-gray-800 text-gray-400">
        <p>No signal available</p>
        <button onClick={onRefresh} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Generate Signal
        </button>
      </div>
    );
  }

  const color = signalColors[signal.signal];
  const confidencePct = Math.round(signal.confidence * 100);

  return (
    <div className="rounded-xl p-6 bg-gray-800 text-white">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-3xl font-bold px-4 py-2 rounded-lg ${color}`}>
          {signal.signal}
        </span>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Confidence</p>
          <p className="text-2xl font-semibold">{confidencePct}%</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {signal.deepseekReasoning && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg text-sm text-gray-300">
          <p className="font-semibold text-gray-200 mb-1">AI Analysis</p>
          <p>{signal.deepseekReasoning}</p>
        </div>
      )}

      <div className="mt-4 flex gap-4 text-sm text-gray-400">
        <span>Rule: <span className="text-white font-medium">{signal.ruleSignal ?? '—'}</span></span>
        <span>DeepSeek: <span className="text-white font-medium">{signal.deepseekSignal ?? '—'}</span></span>
      </div>

      <button
        onClick={onRefresh}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        Refresh Signal
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Tạo `IndicatorPanel.tsx`**

```tsx
import { AllIndicators } from '@crypto-dss/shared-types';

interface Props {
  indicators: AllIndicators | null;
}

function Row({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-700">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">
        {value !== null && value !== undefined ? (typeof value === 'number' ? value.toFixed(2) : value) : '—'}
      </span>
    </div>
  );
}

export function IndicatorPanel({ indicators }: Props) {
  if (!indicators) return null;
  const { trend, momentum, volatility, volume, patterns } = indicators;

  const activePatterns = Object.entries(patterns)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ') || 'None';

  return (
    <div className="rounded-xl p-4 bg-gray-800 text-white">
      <h3 className="font-semibold mb-3 text-gray-200">Indicators</h3>

      <div className="mb-3">
        <p className="text-xs text-gray-500 uppercase mb-1">Trend</p>
        <Row label="EMA 9 / DEMA / TEMA" value={trend.ema9 ? `${trend.ema9.toFixed(2)} / ${trend.dema9?.toFixed(2) ?? '—'} / ${trend.tema9?.toFixed(2) ?? '—'}` : null} />
        <Row label="EMA 21 / 50 / 200" value={trend.ema21 ? `${trend.ema21.toFixed(2)} / ${trend.ema50?.toFixed(2) ?? '—'} / ${trend.ema200?.toFixed(2) ?? '—'}` : null} />
        <Row label="MACD Histogram" value={trend.macd?.histogram ?? null} />
        <Row label="ADX" value={trend.adx} />
        <Row label="PSAR" value={trend.psar} />
        <Row label="Ichimoku Tenkan" value={trend.ichimoku?.conversion ?? null} />
        <Row label="Ichimoku Kijun" value={trend.ichimoku?.base ?? null} />
        <Row label="Ichimoku SpanA/B" value={trend.ichimoku ? `${trend.ichimoku.spanA.toFixed(2)} / ${trend.ichimoku.spanB.toFixed(2)}` : null} />
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 uppercase mb-1">Momentum</p>
        <Row label="RSI (14)" value={momentum.rsi14} />
        <Row label="StochRSI K/D" value={momentum.stochRsi ? `${momentum.stochRsi.k.toFixed(1)} / ${momentum.stochRsi.d.toFixed(1)}` : null} />
        <Row label="Stochastic K/D" value={momentum.stochastic ? `${momentum.stochastic.k.toFixed(1)} / ${momentum.stochastic.d.toFixed(1)}` : null} />
        <Row label="Williams %R" value={momentum.williamsR} />
        <Row label="CCI" value={momentum.cci} />
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 uppercase mb-1">Volatility</p>
        <Row label="BB Upper / Lower" value={volatility.bollingerBands ? `${volatility.bollingerBands.upper.toFixed(2)} / ${volatility.bollingerBands.lower.toFixed(2)}` : null} />
        <Row label="ATR" value={volatility.atr} />
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 uppercase mb-1">Volume</p>
        <Row label="VWAP" value={volume.vwap} />
        <Row label="MFI" value={volume.mfi} />
        <Row label="CMF" value={volume.cmf} />
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase mb-1">Patterns</p>
        <p className="text-sm text-white">{activePatterns}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Tạo `components/SignalToast.tsx`** — toast notification realtime

```tsx
interface Props {
  symbol: string;
  timeframe: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  onClose: () => void;
}

const toastColor = { BUY: 'bg-green-600', SELL: 'bg-red-600', HOLD: 'bg-yellow-600' };
const toastIcon = { BUY: '🟢', SELL: '🔴', HOLD: '🟡' };

export function SignalToast({ symbol, timeframe, signal, confidence, onClose }: Props) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl text-white shadow-xl ${toastColor[signal]} animate-slide-in`}>
      <span className="text-2xl">{toastIcon[signal]}</span>
      <div>
        <p className="font-bold text-lg">{signal} Signal</p>
        <p className="text-sm opacity-90">{symbol} · {timeframe} · {Math.round(confidence * 100)}% confidence</p>
      </div>
      <button onClick={onClose} className="ml-4 text-white opacity-70 hover:opacity-100 text-xl">×</button>
    </div>
  );
}
```

Thêm animation vào `apps/frontend/tailwind.config.js`:
```js
// Trong theme.extend:
keyframes: {
  'slide-in': { from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
},
animation: { 'slide-in': 'slide-in 0.3s ease-out' },
```

- [ ] **Step 4: Tạo `pages/Dashboard.tsx`**

```tsx
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AllIndicators, Timeframe } from '@crypto-dss/shared-types';
import { fetchLatestSignal, generateSignal } from '../api/signals.api';
import { useSignalSocket, SignalChangedEvent } from '../hooks/useSignalSocket';
import { SignalCard } from '../components/SignalCard';
import { IndicatorPanel } from '../components/IndicatorPanel';
import { SignalToast } from '../components/SignalToast';

const TIMEFRAMES = Object.values(Timeframe);

export function Dashboard() {
  const [symbol] = useState('ETHUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>(Timeframe.ONE_HOUR);
  const [toast, setToast] = useState<SignalChangedEvent | null>(null);
  const queryClient = useQueryClient();

  const { data: signal, isLoading } = useQuery({
    queryKey: ['signal', symbol, timeframe],
    queryFn: () => fetchLatestSignal(symbol, timeframe),
  });

  const { mutate: refreshSignal, isPending: isGenerating } = useMutation({
    mutationFn: () => generateSignal(symbol, timeframe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal', symbol, timeframe] });
    },
  });

  // Lắng nghe WebSocket — hiện toast khi có signal mới từ server
  const handleSignalChanged = useCallback((event: SignalChangedEvent) => {
    setToast(event);
    setTimeout(() => setToast(null), 8000);  // tự đóng sau 8 giây
  }, []);

  useSignalSocket(handleSignalChanged);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {toast && (
        <SignalToast
          symbol={toast.symbol}
          timeframe={toast.timeframe}
          signal={toast.signal}
          confidence={toast.confidence}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Crypto DSS — {symbol}</h1>
          <div className="flex gap-2">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SignalCard
            signal={signal ?? null}
            isLoading={isLoading || isGenerating}
            onRefresh={() => refreshSignal()}
          />
          <IndicatorPanel indicators={signal ? (signal.indicators as unknown as AllIndicators) : null} />
        </div>

        {signal?.createdAt && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Last updated: {new Date(signal.createdAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Cập nhật `App.tsx`**

```tsx
import { Dashboard } from './pages/Dashboard';

export default function App() {
  return <Dashboard />;
}
```

- [ ] **Step 5: Chạy frontend để kiểm tra**

```bash
# Terminal 1: chạy backend
npx nx serve backend

# Terminal 2: chạy frontend
npx nx serve frontend
```

Mở `http://localhost:4200` — Expected: thấy dashboard với timeframe selector và signal card

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/
git commit -m "feat(frontend): add Dashboard with SignalCard and IndicatorPanel components"
```

---

## Verification

**End-to-end test:**

1. Đảm bảo PostgreSQL đang chạy: `docker ps | grep crypto-dss-postgres`
2. Cập nhật `apps/backend/.env` với `DEEPSEEK_API_KEY` thực
3. Khởi động backend: `npx nx serve backend` — quan sát log fetch dữ liệu lịch sử
4. Kiểm tra DB có dữ liệu: `docker exec -it crypto-dss-postgres psql -U postgres -d crypto_dss -c "SELECT timeframe, COUNT(*) FROM ohlcv GROUP BY timeframe;"`
5. Generate signal: `curl -X POST "http://localhost:3000/api/signals/generate?symbol=ETHUSDT&timeframe=1h"`
6. Kiểm tra signal trả về có `signal`, `confidence`, `deepseekReasoning`
7. Mở frontend: `npx nx serve frontend` → `http://localhost:4200`
8. Nhấn "Generate Signal" trên dashboard → thấy BUY/SELL/HOLD với confidence và AI reasoning
9. Thử các timeframe khác nhau bằng các button trên dashboard

**Unit tests:**

```bash
npx nx test shared-types
npx nx test backend
```
