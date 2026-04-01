# Kế hoạch Triển khai — Crypto DSS

> Tham chiếu: [requirements.md](./requirements.md) | [design.md](./design.md)

## Phase 1 — Project Infrastructure

- [x] 1. Khởi tạo Nx Monorepo

  - [x] 1.1 Tạo Nx workspace với `npx create-nx-workspace@19 . --preset=empty --packageManager=npm --nxCloud=skip`
  - [x] 1.2 Thêm NestJS backend app: `npx nx add @nx/nest && npx nx g @nx/nest:app backend --directory=apps/backend --no-interactive`
  - [x] 1.3 Thêm React frontend app: `npx nx add @nx/react && npx nx g @nx/react:app frontend --directory=apps/frontend --bundler=vite --style=tailwind --no-interactive`
  - [x] 1.4 Thêm shared-types library: `npx nx g @nx/js:lib shared-types --directory=libs/shared-types --bundler=tsc --no-interactive`
  - [x] 1.5 Install backend dependencies: `@nestjs/config @nestjs/typeorm @nestjs/schedule @nestjs/websockets @nestjs/platform-socket.io typeorm pg axios technicalindicators openai`
  - [x] 1.6 Install frontend dependencies: `socket.io-client axios`
  - [x] 1.7 Install dev dependencies: `@types/node`

- [x] 2. Shared Types Library

  - [x] 2.1 Tạo `libs/shared-types/src/ohlcv.types.ts` — interface OhlcvCandle
  - [x] 2.2 Tạo `libs/shared-types/src/indicator.types.ts` — TrendIndicators, MomentumIndicators, VolatilityIndicators, VolumeIndicators, CandlestickPatterns, AllIndicators
  - [x] 2.3 Tạo `libs/shared-types/src/signal.types.ts` — enum SignalType (BUY/SELL/HOLD), enum Timeframe (6 giá trị), interface SignalResult
  - [x] 2.4 Cập nhật `libs/shared-types/src/index.ts` — export all types

- [x] 3. PostgreSQL + TypeORM Setup
     Tham khảo desig sau : /home/sown/workplace/projects/crypto-dss/docs/superpowers/plans/2026-04-02-crypto-dss-implementation.md

  - [x] 3.1 Tạo `apps/backend/.env` với DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DEEPSEEK_API_KEY
  - [x] 3.2 Cập nhật `apps/backend/src/app.module.ts` — ConfigModule.forRoot (isGlobal), TypeOrmModule.forRootAsync (PostgreSQL), ScheduleModule.forRoot
  - [x] 3.3 Tạo `apps/backend/src/main.ts` — bootstrap NestJS app với CORS enabled

- [x] 4. Git commit & push Phase 1
  - [x] 4.1 `git add . && git commit -m "feat: initialize Nx monorepo with shared types and PostgreSQL setup" && git push`

## Phase 2 — Data Collection

- [x] 5. Binance Service
     Tham khảo desig sau : /home/sown/workplace/projects/crypto-dss/docs/superpowers/plans/2026-04-02-crypto-dss-implementation.md

  - [x] 5.1 Tạo `apps/backend/src/modules/binance/binance.types.ts` — BinanceRawKline type
  - [x] 5.2 Tạo `apps/backend/src/modules/binance/binance.service.ts` — fetchKlines() gọi GET /api/v3/klines, chuyển đổi raw kline → OhlcvCandle
  - [x] 5.3 Tạo `apps/backend/src/modules/binance/binance.module.ts` — export BinanceService

- [x] 6. OHLCV Entity + Service

  - [x] 6.1 Tạo `apps/backend/src/modules/ohlcv/ohlcv.entity.ts` — TypeORM entity bảng ohlcv, unique constraint (symbol, timeframe, openTime), decimal(18,8)
  - [x] 6.2 Tạo `apps/backend/src/modules/ohlcv/ohlcv.service.ts` — upsertCandles (orIgnore), getCandles (DESC openTime), getLatestCandle, deleteOlderThan
  - [x] 6.3 Tạo `apps/backend/src/modules/ohlcv/ohlcv.module.ts` — import TypeOrmModule.forFeature, export OhlcvService

- [x] 7. OHLCV Scheduler
     Tham khảo desig sau : /home/sown/workplace/projects/crypto-dss/docs/superpowers/plans/2026-04-02-crypto-dss-implementation.md

  - [x] 7.1 Tạo `apps/backend/src/modules/ohlcv/ohlcv.scheduler.ts` — onModuleInit (fetch 500 nến lịch sử), cron 30s (fetch 3 nến mới), cron weekly (xóa > 2 năm), error isolation per timeframe
  - [x] 7.2 Cập nhật `apps/backend/src/modules/ohlcv/ohlcv.module.ts` — thêm OhlcvScheduler, import BinanceModule
  - [x] 7.3 Cập nhật `apps/backend/src/app.module.ts` — import OhlcvModule

- [-] 8. Git commit & push Phase 2
  - [-] 8.1 `git add . && git commit -m "feat: add Binance service, OHLCV entity/service/scheduler" && git push`

## Phase 3 — Analysis Engine

- [ ] 9. Indicators Service
     Tham khảo desig sau : /home/sown/workplace/projects/crypto-dss/docs/superpowers/plans/2026-04-02-crypto-dss-implementation.md

  - [~] 9.1 Tạo `apps/backend/src/modules/indicators/trend.indicators.ts` — calcTrend(): EMA(9,21,50,200), DEMA 9, TEMA 9, MACD(12/26/9), ADX(14), PSAR, Ichimoku(9/26/52/26)
  - [~] 9.2 Tạo `apps/backend/src/modules/indicators/momentum.indicators.ts` — calcMomentum(): RSI(14), StochRSI(14/14/3/3), Stochastic(14/3), Williams %R(14), CCI(20), ROC(12)
  - [~] 9.3 Tạo `apps/backend/src/modules/indicators/volatility.indicators.ts` — calcVolatility(): Bollinger Bands(20/2), ATR(14)
  - [~] 9.4 Tạo `apps/backend/src/modules/indicators/volume.indicators.ts` — calcVolume(): OBV, VWAP, MFI(14), CMF(20)
  - [~] 9.5 Tạo `apps/backend/src/modules/indicators/patterns.indicators.ts` — calcPatterns(): Doji, Hammer, Bullish/Bearish Engulfing, Morning/Evening Star
  - [~] 9.6 Tạo `apps/backend/src/modules/indicators/indicators.service.ts` — calculate() orchestrate 5 hàm helper, trả về AllIndicators
  - [~] 9.7 Tạo `apps/backend/src/modules/indicators/indicators.module.ts` — export IndicatorsService, import OhlcvModule

- [ ] 10. Rule Engine + DeepSeek + Analyzer
      Tham khảo desig sau : /home/sown/workplace/projects/crypto-dss/docs/superpowers/plans/2026-04-02-crypto-dss-implementation.md

  - [~] 10.1 Tạo `apps/backend/src/modules/analyzer/rule-engine.service.ts` — weighted scoring, BUY/SELL/HOLD thresholds, null handling, trả về {signal, confidence}
  - [~] 10.2 Tạo `apps/backend/src/modules/analyzer/prompt-builder.ts` — buildPrompt() tóm tắt multi-timeframe indicators, yêu cầu JSON response
  - [~] 10.3 Tạo `apps/backend/src/modules/analyzer/deepseek.service.ts` — OpenAI client với baseURL deepseek, analyze(), error fallback HOLD/0
  - [~] 10.4 Tạo `apps/backend/src/modules/analyzer/analyzer.service.ts` — analyzeTimeframe(): getCandles → indicators → Promise.all([rule, deepseek]) → weighted combine (40%/60%)
  - [~] 10.5 Tạo `apps/backend/src/modules/analyzer/analyzer.module.ts` — import IndicatorsModule, OhlcvModule; export AnalyzerService

- [ ] 11. Signals Module
      Tham khảo desig sau : /home/sown/workplace/projects/crypto-dss/docs/superpowers/plans/2026-04-02-crypto-dss-implementation.md

  - [~] 11.1 Tạo `apps/backend/src/modules/signals/signals.entity.ts` — TypeORM entity bảng signals, JSONB indicators column
  - [~] 11.2 Tạo `apps/backend/src/modules/signals/signals.service.ts` — saveIfChanged (change detection), getLatest, getHistory (pagination), pruneOldSignals (max 200)
  - [~] 11.3 Tạo `apps/backend/src/modules/signals/signals.controller.ts` — POST /signals/generate, GET /signals/latest, GET /signals/history
  - [~] 11.4 Tạo `apps/backend/src/modules/signals/signals.gateway.ts` — WebSocket gateway, signal-changed event, subscribe by symbol+timeframe, log connect/disconnect
  - [~] 11.5 Tạo `apps/backend/src/modules/signals/signals.scheduler.ts` — cron 30s: analyzeTimeframe cho 6 TF → saveIfChanged → emit nếu changed
  - [~] 11.6 Tạo `apps/backend/src/modules/signals/signals.module.ts` — import AnalyzerModule, TypeOrmModule.forFeature; export all
  - [~] 11.7 Cập nhật `apps/backend/src/app.module.ts` — import IndicatorsModule, AnalyzerModule, SignalsModule

- [ ] 12. Git commit & push Phase 3
  - [~] 12.1 `git add . && git commit -m "feat: add indicators, rule engine, DeepSeek, analyzer, signals modules" && git push`

## Phase 4 — Frontend Dashboard

- [ ] 13. Frontend Setup + API Layer

  - [~] 13.1 Tạo `apps/frontend/src/styles/index.css` — CSS variables (colors, fonts, spacing), scan-line texture, reset styles
  - [~] 13.2 Tạo `apps/frontend/src/styles/components.css` — shared component styles (signal-card, indicator-panel, topbar, etc.)
  - [~] 13.3 Tạo `apps/frontend/src/styles/animations.css` — keyframes (pulse-live, toast-enter, skeleton-shimmer, fadeInUp)
  - [~] 13.4 Tạo `apps/frontend/src/api/signals.api.ts` — fetchLatestSignal, fetchSignalHistory, generateSignal (axios)
  - [~] 13.5 Tạo `apps/frontend/src/hooks/useSignalSocket.ts` — socket.io-client hook, lắng nghe signal-changed, trả về {latestSignal, isConnected}

- [ ] 14. Core Components

  - [~] 14.1 Tạo `apps/frontend/src/components/SignalBadge.tsx` — inline badge BUY/SELL/HOLD với màu tương ứng
  - [~] 14.2 Tạo `apps/frontend/src/components/ConfidenceGauge.tsx` — SVG arc 240°, màu theo signal, hiển thị % ở trung tâm
  - [~] 14.3 Tạo `apps/frontend/src/components/TimeframeSelector.tsx` — 6 nút chọn timeframe
  - [~] 14.4 Tạo `apps/frontend/src/components/Topbar.tsx` — sticky header: logo, price ticker, LIVE status, TimeframeSelector
  - [~] 14.5 Tạo `apps/frontend/src/components/SignalCard.tsx` — hero component: ConfidenceGauge, SignalType 64px, Rule vs AI, AI Reasoning, Refresh button
  - [~] 14.6 Tạo `apps/frontend/src/components/IndicatorRow.tsx` — label + value + status dot, null → "—"
  - [~] 14.7 Tạo `apps/frontend/src/components/RsiRow.tsx` — RSI với mini progress bar, overbought/oversold zones
  - [~] 14.8 Tạo `apps/frontend/src/components/PatternsTab.tsx` — grid badge cho candlestick patterns (active/inactive)
  - [~] 14.9 Tạo `apps/frontend/src/components/IndicatorPanel.tsx` — 5 tabs (TREND, MOMENTUM, VOLATILITY, VOLUME, PATTERNS)

- [ ] 15. History + Toast + Skeleton

  - [~] 15.1 Tạo `apps/frontend/src/components/SignalHistory.tsx` — bảng lịch sử: TIME, TIMEFRAME, SIGNAL, CONFIDENCE bar, RULE, AI

  - [~] 15.2 Tạo `apps/frontend/src/components/SignalToast.tsx` — toast notification: slide-in, auto-dismiss 8s, progress bar, close button
  - [~] 15.3 Tạo skeleton components (SkeletonSignalCard, SkeletonIndicatorPanel) — shimmer animation

- [ ] 16. Dashboard Page + App Assembly
      Tham khảo UI sau
      /home/sown/workplace/projects/crypto-dss/docs/frontend-dashboard-design.md
      /home/sown/workplace/projects/crypto-dss/docs/frontend-dashboard-prototype.html

  - [~] 16.1 Tạo `apps/frontend/src/pages/Dashboard.tsx` — layout grid: Topbar + Main (SignalCard + IndicatorPanel) + SignalHistory, responsive breakpoints
  - [~] 16.2 Cập nhật `apps/frontend/src/App.tsx` — import Dashboard, setup global styles
  - [~] 16.3 Cập nhật `apps/frontend/src/main.tsx` — render App
  - [~] 16.4 Cập nhật Tailwind config — extend fonts (Bebas Neue, JetBrains Mono, Barlow), colors (buy, sell, hold, terminal), keyframes, animations

- [ ] 17. Git commit & push Phase 4
  - [~] 17.1 `git add . && git commit -m "feat: add Quantex Terminal frontend dashboard with all components" && git push`
    ll;ll
