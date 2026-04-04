# Tài liệu Yêu cầu — Crypto DSS Enhancements

## Giới thiệu

Tài liệu này mô tả 10 cải tiến và tính năng mới cho hệ thống Crypto DSS hiện có — một hệ thống hỗ trợ quyết định giao dịch ETH/USDT trên Binance, xây dựng trên Nx monorepo (NestJS backend + React/Vite frontend). Các cải tiến bao gồm: tích hợp giá real-time vào Topbar, nhúng biểu đồ nến vào Dashboard, bổ sung Support/Resistance levels, Volume Profile/Order Book depth, hệ thống Price Alert, mở rộng Market Context, sửa bug Rule Engine, Backtesting/Win Rate, Multi-timeframe confluence view, và Risk Management hints.

## Thuật ngữ

- **Hệ_thống**: Toàn bộ ứng dụng Crypto DSS bao gồm backend NestJS và frontend React
- **Backend**: Ứng dụng NestJS xử lý thu thập dữ liệu, tính toán indicators, phân tích và cung cấp API
- **Frontend**: Ứng dụng React/Vite hiển thị dashboard cho người dùng
- **Topbar**: Thanh header cố định ở đầu trang Dashboard
- **TopbarPriceTicker**: Component hiển thị giá ETH/USDT real-time trong Topbar
- **Dashboard**: Trang chính của frontend hiển thị tất cả thông tin tín hiệu và chỉ số
- **CandlestickChart**: Component biểu đồ nến sử dụng thư viện lightweight-charts
- **Rule_Engine**: Module phân tích tín hiệu dựa trên luật và trọng số của các chỉ số kỹ thuật
- **Indicators_Service**: Module tính toán các chỉ số kỹ thuật từ dữ liệu nến
- **AllIndicators**: Interface chứa tất cả chỉ số kỹ thuật được tính toán (trend, momentum, volatility, volume, patterns)
- **Binance_Service**: Module thu thập dữ liệu từ Binance REST API
- **Alert_Service**: Module quản lý cảnh báo giá (price alerts)
- **Market_Context_Service**: Module thu thập dữ liệu thị trường mở rộng (Fear & Greed, BTC dominance, funding rate)
- **Backtesting_Service**: Module thống kê độ chính xác tín hiệu lịch sử
- **SR_Level**: Mức hỗ trợ (Support) hoặc kháng cự (Resistance) được tính toán từ dữ liệu giá
- **Order_Book**: Sổ lệnh thị trường chứa danh sách bid/ask
- **Volume_Profile**: Phân phối khối lượng giao dịch theo mức giá
- **Confluence_View**: Giao diện tổng hợp tín hiệu của nhiều timeframe cùng lúc
- **ATR**: Average True Range — chỉ số đo độ biến động giá
- **Funding_Rate**: Lãi suất tài trợ trong giao dịch futures, phản ánh tâm lý thị trường
- **BTC_Dominance**: Tỷ lệ vốn hóa Bitcoin so với toàn thị trường crypto
- **Fear_Greed_Index**: Chỉ số tâm lý thị trường từ 0 (Extreme Fear) đến 100 (Extreme Greed)
- **Timeframe**: Khung thời gian phân tích (1m, 5m, 15m, 1h, 4h, 1d)
- **DeepSeek_Service**: Module gọi DeepSeek LLM API để phân tích bổ sung
- **Prompt_Builder**: Module tạo prompt cho DeepSeek
- **SignalType**: Loại tín hiệu giao dịch: BUY, SELL, hoặc HOLD
- **Confidence_Score**: Điểm tin cậy của tín hiệu, giá trị từ 0 đến 1

## Yêu cầu

### Yêu cầu 1: Real-time ETH/USDT Price trong Topbar

**User Story:** Là một trader, tôi muốn thấy giá ETH/USDT real-time cùng phần trăm thay đổi 24h trong Topbar, để nắm bắt ngay tình hình giá mà không cần rời khỏi dashboard.

#### Tiêu chí chấp nhận

1. THE TopbarPriceTicker SHALL fetch giá ETH/USDT real-time từ Binance REST API endpoint `GET /api/v3/ticker/24hr?symbol=ETHUSDT` mỗi 15 giây
2. THE TopbarPriceTicker SHALL hiển thị giá hiện tại (lastPrice) với định dạng 2 chữ số thập phân, sử dụng font JetBrains Mono
3. THE TopbarPriceTicker SHALL hiển thị phần trăm thay đổi 24h (priceChangePercent) với màu xanh (var(--buy)) khi dương và màu đỏ (var(--sell)) khi âm
4. THE TopbarPriceTicker SHALL hiển thị giá trị thay đổi tuyệt đối 24h (priceChange) kèm dấu +/- tương ứng
5. IF Binance API trả về lỗi khi fetch giá, THEN THE TopbarPriceTicker SHALL giữ nguyên giá trị hiển thị cuối cùng và không làm crash component
6. WHEN component được mount lần đầu, THE TopbarPriceTicker SHALL fetch giá ngay lập tức mà không chờ đến chu kỳ 15 giây tiếp theo

### Yêu cầu 2: Tích hợp CandlestickChart vào Dashboard

**User Story:** Là một trader, tôi muốn thấy biểu đồ nến ETH/USDT trực tiếp trên Dashboard, để phân tích hành động giá trực quan mà không cần chuyển sang công cụ khác.

#### Tiêu chí chấp nhận

1. THE Dashboard SHALL render component CandlestickChart với dữ liệu nến OHLCV của timeframe đang được chọn
2. THE CandlestickChart SHALL nhận props `candles` (mảng OhlcvCandle) và `timeframe` (string) từ Dashboard
3. THE Dashboard SHALL truyền dữ liệu nến từ API endpoint `GET /signals/candles?symbol=ETHUSDT&timeframe={timeframe}&limit=200` vào CandlestickChart
4. WHEN người dùng thay đổi timeframe, THE Dashboard SHALL cập nhật dữ liệu nến và re-render CandlestickChart với dữ liệu mới
5. THE Backend SHALL cung cấp endpoint `GET /signals/candles` trả về mảng OhlcvCandle theo symbol, timeframe và limit
6. WHILE dữ liệu nến đang được tải, THE Dashboard SHALL hiển thị skeleton placeholder có cùng kích thước với CandlestickChart (height: 300px)

### Yêu cầu 3: Support/Resistance Levels

**User Story:** Là một trader, tôi muốn thấy các mức hỗ trợ và kháng cự quan trọng được tính toán tự động, để xác định điểm vào lệnh (entry) và thoát lệnh (exit) hợp lý.

#### Tiêu chí chấp nhận

1. THE Indicators_Service SHALL tính toán tối thiểu 3 mức Support và 3 mức Resistance từ dữ liệu nến bằng phương pháp phân tích đỉnh/đáy cục bộ (local pivot high/low) trong cửa sổ 20 nến
2. THE Indicators_Service SHALL trả về SR_Level trong AllIndicators dưới dạng mảng `supportLevels: number[]` và `resistanceLevels: number[]`, sắp xếp theo khoảng cách gần nhất với giá hiện tại
3. THE Rule_Engine SHALL sử dụng SR_Level để bổ sung điểm: cộng điểm bullish khi giá gần mức Support (trong phạm vi 0.5% ATR), trừ điểm bearish khi giá gần mức Resistance
4. THE IndicatorPanel SHALL hiển thị danh sách Support/Resistance levels trong tab TREND, mỗi mức hiển thị giá trị số và nhãn S1/S2/S3 hoặc R1/R2/R3
5. THE CandlestickChart SHALL vẽ các đường ngang (horizontal lines) tại mỗi mức SR_Level với màu xanh cho Support và màu đỏ cho Resistance
6. IF không đủ dữ liệu nến để tính SR_Level (ít hơn 50 nến), THEN THE Indicators_Service SHALL trả về mảng rỗng cho supportLevels và resistanceLevels

### Yêu cầu 4: Volume Profile và Order Book Depth

**User Story:** Là một trader, tôi muốn xem độ sâu thị trường (order book) và phân phối khối lượng theo giá, để đánh giá thanh khoản và xác định vùng giá có nhiều lệnh chờ.

#### Tiêu chí chấp nhận

1. THE Binance_Service SHALL fetch Order Book data từ Binance REST API endpoint `GET /api/v3/depth?symbol=ETHUSDT&limit=20` để lấy 20 mức bid và 20 mức ask tốt nhất
2. THE Backend SHALL cung cấp endpoint `GET /market/orderbook?symbol=ETHUSDT` trả về dữ liệu Order_Book gồm: bids (mảng [price, quantity]), asks (mảng [price, quantity]), và bid-ask spread (số)
3. THE Frontend SHALL hiển thị Order Book Depth component trong Dashboard, gồm: thanh bid/ask visualization (bar chart ngang), bid-ask spread hiển thị bằng số và phần trăm
4. THE Binance_Service SHALL tính toán Volume_Profile từ dữ liệu OHLCV: phân chia khoảng giá thành 20 bucket và tổng hợp volume theo từng bucket
5. THE Backend SHALL cung cấp endpoint `GET /market/volume-profile?symbol=ETHUSDT&timeframe={timeframe}` trả về mảng `{ priceLevel: number, volume: number }[]`
6. THE Frontend SHALL hiển thị Volume Profile dưới dạng histogram ngang bên cạnh CandlestickChart, với bar dài hơn tương ứng volume cao hơn
7. IF Binance API trả về lỗi khi fetch Order Book, THEN THE Backend SHALL trả về HTTP 503 với message mô tả lỗi

### Yêu cầu 5: Price Alert và Notification

**User Story:** Là một trader, tôi muốn đặt cảnh báo khi giá ETH chạm một ngưỡng cụ thể, để không cần theo dõi màn hình liên tục và không bỏ lỡ cơ hội giao dịch.

#### Tiêu chí chấp nhận

1. THE Frontend SHALL cung cấp giao diện tạo Price Alert gồm: input nhập giá mục tiêu (target price), dropdown chọn điều kiện (ABOVE / BELOW), và nút "Set Alert"
2. THE Alert_Service SHALL lưu trữ danh sách Price Alert trong bộ nhớ (in-memory) với các trường: id, symbol, targetPrice, condition (ABOVE/BELOW), createdAt, triggered (boolean)
3. WHEN giá ETH/USDT hiện tại vượt qua targetPrice theo đúng condition, THE Alert_Service SHALL đánh dấu alert là triggered và phát sự kiện `price-alert-triggered` qua WebSocket tới tất cả client
4. WHEN Frontend nhận sự kiện `price-alert-triggered`, THE Frontend SHALL hiển thị toast notification với thông tin: symbol, targetPrice, condition, giá hiện tại tại thời điểm trigger
5. THE Frontend SHALL hiển thị danh sách các Price Alert đang active, cho phép người dùng xóa từng alert
6. THE Alert_Service SHALL kiểm tra điều kiện alert mỗi lần nhận giá mới từ chu kỳ fetch 15 giây của TopbarPriceTicker
7. THE Alert_Service SHALL hỗ trợ tối đa 10 alert đồng thời; IF người dùng cố tạo alert thứ 11, THEN THE Frontend SHALL hiển thị thông báo lỗi "Đã đạt giới hạn 10 alerts"

### Yêu cầu 6: Market Context Mở rộng

**User Story:** Là một trader, tôi muốn xem Fear & Greed Index, BTC dominance và funding rate trong dashboard, để hiểu bức tranh toàn cảnh thị trường trước khi ra quyết định giao dịch ETH.

#### Tiêu chí chấp nhận

1. THE Market_Context_Service SHALL fetch Fear & Greed Index từ API `https://api.alternative.me/fng/?limit=1` mỗi 1 giờ và cache kết quả
2. THE Market_Context_Service SHALL fetch BTC dominance từ CoinGecko API `https://api.coingecko.com/api/v3/global` mỗi 5 phút và cache kết quả
3. THE Market_Context_Service SHALL fetch ETH/USDT perpetual funding rate từ Binance API `GET /fapi/v1/fundingRate?symbol=ETHUSDT&limit=1` mỗi 1 giờ và cache kết quả
4. THE Backend SHALL cung cấp endpoint `GET /market/context` trả về đối tượng gồm: `fearGreedIndex` (số 0-100 và label), `btcDominance` (phần trăm), `fundingRate` (số thập phân)
5. THE Frontend SHALL hiển thị Market Context panel trong Dashboard với 3 chỉ số: Fear & Greed Index (kèm label: Extreme Fear/Fear/Neutral/Greed/Extreme Greed), BTC Dominance (%), Funding Rate (với màu xanh khi dương, đỏ khi âm)
6. THE Prompt_Builder SHALL bổ sung dữ liệu Market Context (fearGreedIndex, btcDominance, fundingRate) vào prompt gửi DeepSeek để cải thiện chất lượng phân tích
7. IF bất kỳ API nào trong Market_Context_Service trả về lỗi, THEN THE Market_Context_Service SHALL trả về giá trị null cho chỉ số đó và ghi log lỗi, không làm ảnh hưởng đến các chỉ số còn lại

### Yêu cầu 7: Rule Engine Fix — Sử dụng Close Price Thực tế

**User Story:** Là một lập trình viên, tôi muốn Rule Engine sử dụng giá close thực tế thay vì EMA9 làm proxy, để tín hiệu BUY/SELL/HOLD phản ánh đúng vị trí giá so với Bollinger Bands và các ngưỡng kỹ thuật.

#### Tiêu chí chấp nhận

1. THE AllIndicators interface SHALL bổ sung trường `closePrice: number` để truyền giá close của nến mới nhất vào Rule Engine
2. THE Indicators_Service SHALL gán giá trị `closePrice` bằng giá close của nến cuối cùng trong mảng OhlcvEntity đầu vào
3. THE Rule_Engine SHALL sử dụng `indicators.closePrice` thay vì `trend.ema9` khi so sánh vị trí giá với Bollinger Bands (bbLower, bbUpper)
4. THE Rule_Engine SHALL sử dụng `indicators.closePrice` thay vì `trend.ema9` khi so sánh giá với các mức Support/Resistance
5. WHEN `indicators.closePrice` là null hoặc undefined, THE Rule_Engine SHALL bỏ qua các phép so sánh phụ thuộc vào closePrice và không ảnh hưởng đến các phần tính điểm khác

### Yêu cầu 8: Backtesting và Win Rate

**User Story:** Là một trader, tôi muốn biết tỷ lệ chính xác (win rate) của các tín hiệu BUY/SELL trong quá khứ theo từng timeframe, để đánh giá độ tin cậy của hệ thống trước khi ra quyết định.

#### Tiêu chí chấp nhận

1. THE Backtesting_Service SHALL tính toán win rate cho Rule Engine và DeepSeek riêng biệt, theo từng timeframe, dựa trên lịch sử tín hiệu đã lưu trong bảng `signals`
2. THE Backtesting_Service SHALL định nghĩa một tín hiệu BUY là "thắng" (win) nếu giá close của nến tiếp theo sau tín hiệu cao hơn giá close tại thời điểm tín hiệu; tín hiệu SELL là "thắng" nếu giá close nến tiếp theo thấp hơn
3. THE Backtesting_Service SHALL tính win rate theo công thức: `winRate = (số tín hiệu thắng) / (tổng số tín hiệu BUY + SELL)`, trả về giá trị từ 0 đến 1
4. THE Backend SHALL cung cấp endpoint `GET /signals/backtest?symbol=ETHUSDT&timeframe={timeframe}` trả về đối tượng gồm: `ruleWinRate`, `deepseekWinRate`, `totalSignals`, `winCount`, `lossCount`
5. THE Frontend SHALL hiển thị Backtesting panel trong Dashboard với win rate của Rule Engine và DeepSeek cho timeframe đang chọn, hiển thị dưới dạng phần trăm kèm số lượng tín hiệu mẫu
6. IF tổng số tín hiệu BUY + SELL ít hơn 10, THEN THE Backtesting_Service SHALL trả về `winRate: null` và thông báo "Chưa đủ dữ liệu (cần tối thiểu 10 tín hiệu)"

### Yêu cầu 9: Multi-timeframe Confluence View

**User Story:** Là một trader, tôi muốn xem tín hiệu của tất cả 6 timeframe cùng một lúc dưới dạng bảng/matrix, để nhanh chóng xác định sự đồng thuận (confluence) giữa các khung thời gian.

#### Tiêu chí chấp nhận

1. THE Frontend SHALL cung cấp Confluence View component hiển thị bảng 6 hàng (1m, 5m, 15m, 1h, 4h, 1d) với các cột: Timeframe, Signal (BUY/SELL/HOLD badge), Confidence (%), Rule Signal, AI Signal, Thời gian cập nhật
2. THE Backend SHALL cung cấp endpoint `GET /signals/confluence?symbol=ETHUSDT` trả về mảng SignalResult mới nhất cho tất cả 6 timeframe trong một lần gọi
3. THE Confluence View SHALL tính toán và hiển thị "Confluence Score" — tỷ lệ đồng thuận giữa các timeframe: số timeframe có cùng SignalType chia cho tổng 6 timeframe, hiển thị dưới dạng phần trăm
4. WHEN tất cả 6 timeframe đều có cùng SignalType, THE Confluence View SHALL hiển thị highlight đặc biệt (border glow) để nhấn mạnh sự đồng thuận tuyệt đối
5. THE Confluence View SHALL tự động refresh dữ liệu mỗi 30 giây hoặc khi nhận sự kiện `signal-changed` từ WebSocket
6. THE Confluence View SHALL hiển thị skeleton loading cho từng hàng trong khi dữ liệu đang được tải

### Yêu cầu 10: Risk Management Hints

**User Story:** Là một trader, tôi muốn nhận gợi ý về stop-loss, take-profit và position sizing dựa trên ATR, để quản lý rủi ro một cách có hệ thống thay vì ước tính thủ công.

#### Tiêu chí chấp nhận

1. THE Indicators_Service SHALL tính toán Risk Management hints từ ATR(14) và giá close hiện tại: `stopLoss = closePrice - (ATR × 1.5)`, `takeProfit = closePrice + (ATR × 3.0)`, `riskRewardRatio = (takeProfit - closePrice) / (closePrice - stopLoss)`
2. THE AllIndicators interface SHALL bổ sung trường `riskHints: { stopLoss: number, takeProfit: number, riskRewardRatio: number } | null`
3. THE Prompt_Builder SHALL bổ sung thông tin Risk Management (ATR, stopLoss gợi ý, takeProfit gợi ý) vào prompt gửi DeepSeek, yêu cầu DeepSeek xác nhận hoặc điều chỉnh các mức này trong phần reasoning
4. THE Frontend SHALL hiển thị Risk Management panel trong SignalCard hoặc khu vực riêng, gồm: Stop Loss (giá trị số màu đỏ), Take Profit (giá trị số màu xanh), Risk/Reward Ratio (ví dụ: 1:2.0)
5. WHEN SignalType là HOLD, THE Frontend SHALL ẩn Risk Management panel vì không có vị thế giao dịch cần quản lý
6. IF ATR là null (không đủ dữ liệu), THEN THE Frontend SHALL hiển thị "—" cho tất cả các trường Risk Management thay vì giá trị số
