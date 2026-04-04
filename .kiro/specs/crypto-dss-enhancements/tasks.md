# Kế hoạch Triển khai — Crypto DSS Enhancements

> Tham chiếu: [requirements.md](./requirements.md) | [design.md](./design.md)

## Tổng quan

Triển khai 10 cải tiến theo 5 phase: Shared Types & Backend Core → Market/Alert Modules → Frontend Enhancements → Prompt Builder → Git commits. Mỗi phase xây dựng trên phase trước, kết thúc bằng wiring toàn bộ hệ thống.

## Tasks

- [x] 1. Phase 1 — Shared Types & Backend Core Fixes

  - [x] 1.1 Cập nhật `AllIndicators` interface trong `libs/shared-types/src/indicator.types.ts`

    - Thêm `closePrice: number | null`
    - Thêm `supportLevels: number[]` và `resistanceLevels: number[]`
    - Thêm `riskHints: RiskHints | null`
    - Thêm interface `RiskHints { stopLoss: number; takeProfit: number; riskRewardRatio: number }`
    - Thêm interface `SRLevels { supportLevels: number[]; resistanceLevels: number[] }`
    - Cập nhật `libs/shared-types/src/index.ts` export các types mới
    - _Requirements: 3.2, 7.1, 10.2_

  - [x] 1.2 Tạo `apps/backend/backend/src/modules/indicators/sr.indicators.ts`

    - Implement `calcSupportResistance(candles: OhlcvEntity[]): { support: number[], resistance: number[] }`
    - Thuật toán sliding window 20 nến: tìm local pivot high (high > max 10 nến trước/sau) và local pivot low
    - Trả về top 3 support (gần giá nhất từ dưới) và top 3 resistance (gần giá nhất từ trên)
    - Trả về `{ support: [], resistance: [] }` nếu ít hơn 50 nến
    - _Requirements: 3.1, 3.6_

  - [ ]\* 1.3 Viết property test cho `calcSupportResistance`

    - **Property 5: SR levels computation correctness**
    - **Validates: Requirements 3.1, 3.2**
    - Dùng `fast-check`: `fc.array(ohlcvArb, { minLength: 50 })` — kiểm tra support < closePrice, resistance > closePrice, mỗi mảng <= 3 phần tử, sắp xếp theo khoảng cách tăng dần
    - Test edge case: mảng < 50 nến → trả về arrays rỗng

  - [x] 1.4 Tạo `apps/backend/backend/src/modules/indicators/risk.indicators.ts`

    - Implement `calcRiskHints(closePrice: number, atr: number | null): RiskHints | null`
    - Công thức: `stopLoss = closePrice - (atr * 1.5)`, `takeProfit = closePrice + (atr * 3.0)`, `riskRewardRatio = (takeProfit - closePrice) / (closePrice - stopLoss)`
    - Trả về `null` nếu `atr` là null
    - _Requirements: 10.1_

  - [ ]\* 1.5 Viết property test cho `calcRiskHints`

    - **Property 20: Risk hints formula correctness**
    - **Validates: Requirements 10.1**
    - Dùng `fast-check`: `fc.float({ min: 0.01 })` (closePrice), `fc.float({ min: 0.001 })` (atr) — kiểm tra stopLoss = C - A*1.5, takeProfit = C + A*3.0, riskRewardRatio = 2.0 (hằng số)
    - Test edge case: atr = null → trả về null

  - [x] 1.6 Cập nhật `apps/backend/backend/src/modules/indicators/indicators.service.ts`

    - Thêm import `calcSupportResistance` và `calcRiskHints`
    - Trong `calculate()`: lấy `closePrice` từ nến cuối cùng (parseFloat), gọi `calcSupportResistance(candles)`, gọi `calcRiskHints(closePrice, volatility.atr)`
    - Bổ sung `closePrice`, `supportLevels`, `resistanceLevels`, `riskHints` vào object trả về
    - _Requirements: 3.2, 7.2, 10.1_

  - [ ]\* 1.7 Viết property test cho `IndicatorsService.calculate()` — closePrice assignment

    - **Property 14: closePrice assignment correctness**
    - **Validates: Requirements 7.2**
    - Dùng `fast-check`: `fc.array(ohlcvArb, { minLength: 1 })` — kiểm tra `closePrice` bằng đúng `parseFloat(candles[last].close)`

  - [x] 1.8 Cập nhật `apps/backend/backend/src/modules/analyzer/rule-engine.service.ts`

    - Thay `trend.ema9` bằng `indicators.closePrice` trong phép so sánh Bollinger Bands (bbLower, bbUpper)
    - Thêm SR scoring: `+1` nếu `closePrice` trong phạm vi `0.5 * atr` của support, `-1` nếu trong phạm vi của resistance
    - Guard: bỏ qua BB và SR scoring khi `closePrice` là null/undefined
    - _Requirements: 7.3, 7.4, 7.5, 3.3_

  - [ ]\* 1.9 Viết property test cho Rule Engine — closePrice và SR scoring
    - **Property 15: Rule Engine uses closePrice for BB comparison**
    - **Validates: Requirements 7.3, 7.4**
    - Dùng `fast-check`: AllIndicators với closePrice=C và ema9=E (C ≠ E) — kiểm tra BB scoring phản ánh vị trí C, không phải E
    - **Property 16: Rule Engine null closePrice safety**
    - **Validates: Requirements 7.5**
    - Kiểm tra `analyze()` không throw khi closePrice=null, score từ RSI/MACD không bị ảnh hưởng
    - **Property 6: SR levels scoring in Rule Engine**
    - **Validates: Requirements 3.3**
    - Kiểm tra score cao hơn khi closePrice gần support, thấp hơn khi gần resistance

- [ ] 2. Checkpoint — Phase 1

  - Đảm bảo tất cả tests pass, TypeScript compile không lỗi. Hỏi người dùng nếu có vấn đề.

- [x] 3. Phase 2 — Market Data Module

  - [x] 3.1 Tạo `apps/backend/backend/src/modules/market/market.types.ts`

    - Định nghĩa interfaces: `FearGreedData`, `MarketContext`, `OrderBookEntry`, `OrderBookData`, `VolumeProfileBucket`
    - _Requirements: 4.2, 6.4_

  - [x] 3.2 Tạo `apps/backend/backend/src/modules/market/market-context.service.ts`

    - In-memory cache với TTL riêng: Fear & Greed (1h), BTC Dominance (5 phút), Funding Rate (1h)
    - `getFearGreedIndex()`: fetch `https://api.alternative.me/fng/?limit=1`
    - `getBtcDominance()`: fetch `https://api.coingecko.com/api/v3/global`
    - `getFundingRate()`: fetch Binance `/fapi/v1/fundingRate?symbol=ETHUSDT&limit=1`
    - `getContext()`: aggregate 3 nguồn, null-safe (lỗi → null cho trường đó, log error)
    - _Requirements: 6.1, 6.2, 6.3, 6.7_

  - [ ]\* 3.3 Viết property test cho `MarketContextService`

    - **Property 11: MarketContext cache behavior**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Mock HTTP calls, kiểm tra 2 lần gọi trong TTL → chỉ 1 HTTP request
    - **Property 12: MarketContext null isolation**
    - **Validates: Requirements 6.7**
    - Khi 1 API lỗi → đúng 1 trường null, 2 trường còn lại có giá trị hợp lệ

  - [x] 3.4 Tạo `apps/backend/backend/src/modules/market/volume-profile.service.ts`

    - `calculate(candles: OhlcvEntity[]): VolumeProfileBucket[]` — chia 20 bucket theo price range, tổng hợp volume
    - _Requirements: 4.4, 4.5_

  - [ ]\* 3.5 Viết property test cho `VolumeProfileService`

    - **Property 7: Volume Profile bucket coverage**
    - **Validates: Requirements 4.4**
    - Dùng `fast-check`: `fc.array(ohlcvArb, { minLength: 1 })` — kiểm tra đúng 20 bucket, tổng volume = tổng input, priceLevel trong [min_low, max_high]

  - [x] 3.6 Tạo `apps/backend/backend/src/modules/market/market.controller.ts`

    - `GET /market/context` → `MarketContext`
    - `GET /market/orderbook?symbol=ETHUSDT` → `OrderBookData` (fetch Binance `/api/v3/depth?symbol=X&limit=20`, tính spread và spreadPercent; lỗi → HTTP 503)
    - `GET /market/volume-profile?symbol=ETHUSDT&timeframe={tf}` → `VolumeProfileBucket[]`
    - _Requirements: 4.1, 4.2, 4.5, 6.4_

  - [ ]\* 3.7 Viết unit test cho `MarketController` — Order Book error handling

    - Mock Binance API lỗi → kiểm tra response HTTP 503 với message mô tả
    - **Property 8: Order Book endpoint contract**
    - **Validates: Requirements 4.2**
    - Kiểm tra bids/asks đúng 20 phần tử, spread = asks[0].price - bids[0].price, spreadPercent = spread/bids[0].price\*100

  - [x] 3.8 Tạo `apps/backend/backend/src/modules/market/market.module.ts`

    - Import BinanceModule, OhlcvModule; provide MarketContextService, VolumeProfileService; export tất cả
    - _Requirements: 4.1, 6.1_

  - [x] 3.9 Tạo `apps/backend/backend/src/modules/alert/alert.types.ts`

    - Định nghĩa: `AlertCondition = 'ABOVE' | 'BELOW'`, `PriceAlert`, `CreateAlertDto`
    - _Requirements: 5.2_

  - [x] 3.10 Tạo `apps/backend/backend/src/modules/alert/alert.service.ts`

    - In-memory store: `Map<string, PriceAlert>`
    - `createAlert(dto: CreateAlertDto): PriceAlert` — throw `BadRequestException` nếu đã có 10 alerts
    - `deleteAlert(id: string): void`
    - `getAlerts(): PriceAlert[]`
    - `checkAlerts(currentPrice: number): void` — emit `price-alert-triggered` qua SignalsGateway nếu triggered; xóa alert sau khi triggered (one-shot)
    - _Requirements: 5.2, 5.3, 5.6, 5.7_

  - [ ]\* 3.11 Viết property test cho `AlertService`

    - **Property 9: Alert trigger correctness**
    - **Validates: Requirements 5.3, 5.6**
    - Dùng `fast-check`: `fc.record({ condition, targetPrice, currentPrice })` — ABOVE: price > target → triggered; BELOW: price < target → triggered; ngược lại → không triggered
    - **Property 10: Alert capacity limit**
    - **Validates: Requirements 5.7**
    - Đúng 10 alerts → createAlert throw; < 10 → thành công, tổng tăng 1

  - [x] 3.12 Tạo `apps/backend/backend/src/modules/alert/alert.controller.ts`

    - `POST /alerts` → tạo alert mới
    - `DELETE /alerts/:id` → xóa alert
    - `GET /alerts` → danh sách alerts active
    - _Requirements: 5.1, 5.5_

  - [x] 3.13 Tạo `apps/backend/backend/src/modules/alert/alert.module.ts`

    - Import SignalsModule (để dùng SignalsGateway); provide AlertService; export AlertService
    - _Requirements: 5.3_

  - [x] 3.14 Thêm endpoint `GET /signals/candles` vào `signals.controller.ts`

    - Query params: `symbol`, `timeframe`, `limit` (default 200)
    - Gọi `OhlcvService.getCandles()`, map sang `OhlcvCandle[]`, sắp xếp theo openTime tăng dần
    - _Requirements: 2.3, 2.5_

  - [ ]\* 3.15 Viết property test cho candles endpoint

    - **Property 3: Candles endpoint contract**
    - **Validates: Requirements 2.3, 2.5**
    - Kiểm tra response length <= limit, mỗi phần tử có đủ trường, sắp xếp openTime tăng dần

  - [x] 3.16 Thêm endpoint `GET /signals/confluence` vào `signals.controller.ts`

    - Query params: `symbol`
    - Gọi `SignalsService.getLatest()` cho 6 timeframes, trả về `SignalResult[]`
    - _Requirements: 9.2_

  - [ ]\* 3.17 Viết property test cho confluence endpoint

    - **Property 18: Confluence endpoint returns all timeframes**
    - **Validates: Requirements 9.2**
    - Kiểm tra response có đúng 6 phần tử, mỗi timeframe thuộc {1m, 5m, 15m, 1h, 4h, 1d}, không lặp

  - [x] 3.18 Tạo `apps/backend/backend/src/modules/signals/backtesting.service.ts`

    - `backtest(symbol: string, timeframe: string): Promise<BacktestResult>`
    - Query signals từ DB, join với OHLCV để lấy giá nến tiếp theo
    - Tính win/loss cho ruleSignal và deepseekSignal riêng biệt
    - Trả về `{ ruleWinRate: null, deepseekWinRate: null, insufficientData: true }` nếu tổng BUY+SELL < 10
    - _Requirements: 8.1, 8.2, 8.3, 8.6_

  - [ ]\* 3.19 Viết property test cho `BacktestingService`

    - **Property 17: Backtesting win rate formula**
    - **Validates: Requirements 8.2, 8.3, 8.4**
    - Dùng `fast-check`: `fc.array(signalArb, { minLength: 10 })` — kiểm tra winRate = W/(W+L) với sai số <= 0.001, winCount=W, lossCount=L, totalSignals=W+L
    - Test edge case: < 10 signals → winRate null, insufficientData true

  - [x] 3.20 Thêm endpoint `GET /signals/backtest` vào `signals.controller.ts`

    - Query params: `symbol`, `timeframe`
    - Gọi `BacktestingService.backtest()`, trả về `BacktestResult`
    - _Requirements: 8.4_

  - [x] 3.21 Cập nhật `apps/backend/backend/src/app.module.ts`
    - Import MarketModule, AlertModule
    - _Requirements: 4.1, 5.1, 6.1_

- [ ] 4. Checkpoint — Phase 2

  - Đảm bảo tất cả tests pass, các endpoints mới hoạt động đúng. Hỏi người dùng nếu có vấn đề.

- [x] 5. Phase 3 — Frontend Enhancements

  - [x] 5.1 Cập nhật `apps/frontend/frontend/src/components/PriceTicker.tsx` → `TopbarPriceTicker`

    - Fetch `GET https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT` mỗi 15s với `setInterval`
    - Fetch ngay khi mount (không chờ interval đầu tiên)
    - State `lastKnownData` — giữ giá trị khi API lỗi, không crash
    - Hiển thị: lastPrice (2 decimal, JetBrains Mono), priceChangePercent (màu buy/sell), priceChange (dấu +/-)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]\* 5.2 Viết property test cho `TopbarPriceTicker`

    - **Property 1: Price display formatting**
    - **Validates: Requirements 1.2, 1.3, 1.4**
    - Dùng `fast-check`: `fc.float()`, `fc.boolean()` — kiểm tra 2 decimal, dấu +/-, màu buy/sell đúng
    - **Property 2: Price fetch error resilience**
    - **Validates: Requirements 1.5**
    - Sequence N lần thành công + M lần thất bại → giá trị hiển thị = giá trị từ lần thành công cuối

  - [x] 5.3 Cập nhật `apps/frontend/frontend/src/components/CandlestickChart.tsx`

    - Thêm prop `srLevels?: { support: number[], resistance: number[] }`
    - Vẽ `PriceLine` cho mỗi support (màu xanh, dashed) và resistance (màu đỏ, dashed) bằng `series.createPriceLine()`
    - _Requirements: 3.5_

  - [x] 5.4 Tạo `apps/frontend/frontend/src/components/MarketContextPanel.tsx`

    - Fetch `GET /market/context` mỗi 5 phút
    - Hiển thị 3 card: Fear & Greed (số + label), BTC Dominance (%), Funding Rate (màu buy/sell)
    - Hiển thị "—" khi giá trị null
    - _Requirements: 6.5_

  - [x] 5.5 Tạo `apps/frontend/frontend/src/components/AlertPanel.tsx`

    - Form: input số (target price) + select (ABOVE/BELOW) + button "Set Alert"
    - List: hiển thị alerts active, nút xóa từng alert
    - Validation: disable form khi đã có 10 alerts, hiển thị error "Đã đạt giới hạn 10 alerts"
    - Lắng nghe WebSocket event `price-alert-triggered` → hiển thị toast notification
    - _Requirements: 5.1, 5.4, 5.5, 5.7_

  - [x] 5.6 Tạo `apps/frontend/frontend/src/components/BacktestingPanel.tsx`

    - Fetch `GET /signals/backtest?symbol=ETHUSDT&timeframe={tf}` khi timeframe thay đổi
    - Hiển thị: Rule Win Rate (%), AI Win Rate (%), số mẫu
    - Hiển thị "Chưa đủ dữ liệu (cần tối thiểu 10 tín hiệu)" khi `insufficientData = true`
    - _Requirements: 8.5, 8.6_

  - [x] 5.7 Tạo `apps/frontend/frontend/src/components/ConfluenceView.tsx`

    - Bảng 6 hàng × 6 cột: Timeframe, Signal badge, Confidence %, Rule Signal, AI Signal, Updated
    - Confluence Score: đếm signal type phổ biến nhất / 6, hiển thị %
    - Border glow khi tất cả 6 timeframe đồng thuận
    - Auto-refresh mỗi 30s + lắng nghe `signal-changed` WebSocket
    - Skeleton loading cho từng hàng khi đang tải
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.6_

  - [ ]\* 5.8 Viết property test cho `ConfluenceView` — Confluence Score

    - **Property 19: Confluence score calculation**
    - **Validates: Requirements 9.3**
    - Dùng `fast-check`: `fc.array(fc.constantFrom('BUY','SELL','HOLD'), { minLength: 6, maxLength: 6 })` — kiểm tra score = max_count/6; khi tất cả giống nhau → score = 1.0

  - [x] 5.9 Tạo `apps/frontend/frontend/src/components/RiskManagementPanel.tsx`

    - Hiển thị Stop Loss (màu đỏ), Take Profit (màu xanh), R/R Ratio (ví dụ: 1:2.0)
    - Ẩn hoàn toàn khi signal = HOLD
    - Hiển thị "—" khi `riskHints` null
    - _Requirements: 10.4, 10.5, 10.6_

  - [ ]\* 5.10 Viết unit test cho `RiskManagementPanel`

    - Test render với signal=HOLD → panel ẩn hoàn toàn
    - Test render với riskHints=null → hiển thị "—" cho tất cả trường
    - _Requirements: 10.5, 10.6_

  - [x] 5.11 Cập nhật Dashboard layout (`apps/frontend/frontend/src/pages/Dashboard.tsx`)

    - Thay `PriceTicker` bằng `TopbarPriceTicker` trong Topbar
    - Thêm `CandlestickChart` với SR lines (fetch `/signals/candles` khi timeframe thay đổi, skeleton khi loading)
    - Thêm `MarketContextPanel`, `AlertPanel`, `BacktestingPanel`, `ConfluenceView`, `RiskManagementPanel`
    - Truyền `srLevels` từ signal data vào `CandlestickChart`
    - _Requirements: 2.1, 2.2, 2.4, 2.6, 3.4, 4.3, 4.6, 5.1, 6.5, 8.5, 9.1, 10.4_

  - [ ]\* 5.12 Viết property test cho Dashboard — timeframe change triggers data refresh
    - **Property 4: Timeframe change triggers data refresh**
    - **Validates: Requirements 2.4**
    - Khi timeframe thay đổi từ T1 → T2, kiểm tra fetch được gọi với timeframe=T2 và data mới được truyền vào CandlestickChart

- [ ] 6. Checkpoint — Phase 3

  - Đảm bảo tất cả components render đúng, không có TypeScript errors. Hỏi người dùng nếu có vấn đề.

- [x] 7. Phase 4 — Prompt Builder & DeepSeek Enhancement

  - [x] 7.1 Cập nhật `apps/backend/backend/src/modules/analyzer/prompt-builder.ts`

    - Thay đổi signature: `buildPrompt(data: Map<string, AllIndicators>, marketContext?: MarketContext): string`
    - Bổ sung section Market Context: fearGreedIndex (số + label), btcDominance (%), fundingRate
    - Bổ sung section Risk Management: ATR, stopLoss gợi ý, takeProfit gợi ý — yêu cầu DeepSeek xác nhận/điều chỉnh trong reasoning
    - _Requirements: 6.6, 10.3_

  - [ ]\* 7.2 Viết property test cho `PromptBuilder`

    - **Property 13: Prompt contains market context**
    - **Validates: Requirements 6.6**
    - Dùng `fast-check`: MarketContext với fearGreedIndex, btcDominance, fundingRate không null → prompt chứa cả 3 giá trị dưới dạng text
    - **Property 21: Prompt contains risk hints**
    - **Validates: Requirements 10.3**
    - AllIndicators với riskHints không null → prompt chứa giá trị stopLoss và takeProfit

  - [x] 7.3 Cập nhật `apps/backend/backend/src/modules/analyzer/analyzer.service.ts`
    - Inject `MarketContextService`, gọi `getContext()` trước khi build prompt
    - Truyền `marketContext` vào `buildPrompt()`
    - _Requirements: 6.6_

- [ ] 8. Checkpoint — Phase 4

  - Đảm bảo tất cả tests pass, prompt builder hoạt động đúng. Hỏi người dùng nếu có vấn đề.

- [-] 9. Phase 5 — Git Commits

  - [ ] 9.1 Commit Phase 1: `git add . && git commit -m "feat: update AllIndicators with closePrice, SR levels, risk hints; add sr/risk indicators; fix rule engine closePrice bug"`
  - [ ] 9.2 Commit Phase 2: `git add . && git commit -m "feat: add MarketModule (context, volume profile, order book), AlertModule, backtesting service, new signals endpoints"`
  - [ ] 9.3 Commit Phase 3: `git add . && git commit -m "feat: add TopbarPriceTicker, CandlestickChart SR lines, MarketContextPanel, AlertPanel, BacktestingPanel, ConfluenceView, RiskManagementPanel; update Dashboard layout"`
  - [ ] 9.4 Commit Phase 4: `git add . && git commit -m "feat: update PromptBuilder with market context and risk hints sections"`
  - [ ] 9.5 Push tất cả commits: `git push`

## Notes

- Tasks đánh dấu `*` là optional, có thể bỏ qua để triển khai nhanh hơn
- Mỗi task tham chiếu requirements cụ thể để đảm bảo traceability
- Property tests dùng thư viện `fast-check` (TypeScript), mỗi property chạy tối thiểu 100 iterations
- Checkpoints đảm bảo validation từng bước trước khi tiếp tục phase tiếp theo
- AlertService dùng in-memory store — không cần migration DB
- MarketContext và OrderBook là transient data — không persist
