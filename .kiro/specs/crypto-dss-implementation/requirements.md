# Tài liệu Yêu cầu — Crypto DSS (Decision Support System)

## Giới thiệu

Crypto DSS là hệ thống hỗ trợ quyết định giao dịch tiền mã hóa, tập trung vào cặp ETH/USDT trên sàn Binance. Hệ thống thu thập dữ liệu OHLCV từ Binance API, tính toán các chỉ số kỹ thuật (technical indicators), phân tích bằng Rule Engine kết hợp DeepSeek LLM, và hiển thị tín hiệu BUY/SELL/HOLD trên React dashboard theo phong cách "Quantex Terminal". Đây là hệ thống hỗ trợ quyết định, không phải bot giao dịch tự động.

## Thuật ngữ

- **Hệ_thống**: Toàn bộ ứng dụng Crypto DSS bao gồm backend NestJS và frontend React
- **Backend**: Ứng dụng NestJS xử lý thu thập dữ liệu, tính toán indicators, phân tích và cung cấp API
- **Frontend**: Ứng dụng React/Vite hiển thị dashboard cho người dùng
- **Binance_Service**: Module thu thập dữ liệu OHLCV từ Binance REST API
- **OHLCV_Service**: Module lưu trữ và quản lý dữ liệu nến (Open/High/Low/Close/Volume) trong PostgreSQL
- **OHLCV_Scheduler**: Bộ lập lịch tự động fetch dữ liệu nến theo chu kỳ
- **Indicators_Service**: Module tính toán các chỉ số kỹ thuật từ dữ liệu nến
- **Rule_Engine**: Module phân tích tín hiệu dựa trên luật và trọng số của các chỉ số kỹ thuật
- **DeepSeek_Service**: Module gọi DeepSeek LLM API (tương thích OpenAI) để phân tích bổ sung
- **Prompt_Builder**: Module tạo prompt tóm tắt dữ liệu đa khung thời gian cho DeepSeek
- **Analyzer_Service**: Module điều phối kết hợp Rule Engine (40%) và DeepSeek (60%) thành tín hiệu cuối cùng
- **Signals_Service**: Module tổng hợp, lưu trữ lịch sử tín hiệu và phát hiện thay đổi tín hiệu
- **Signals_Controller**: REST API controller cung cấp endpoints cho frontend
- **Signals_Gateway**: WebSocket gateway (Socket.io) đẩy tín hiệu real-time khi có thay đổi
- **Signals_Scheduler**: Bộ lập lịch chạy chu trình phân tích mỗi 30 giây
- **Dashboard**: Trang chính của frontend hiển thị tất cả thông tin tín hiệu và chỉ số
- **SignalCard**: Component hiển thị tín hiệu chính với vòng confidence gauge
- **IndicatorPanel**: Component hiển thị bảng các chỉ số kỹ thuật theo 5 tab nhóm
- **Timeframe**: Khung thời gian phân tích (1m, 5m, 15m, 1h, 4h, 1d)
- **Confidence_Score**: Điểm tin cậy của tín hiệu, giá trị từ 0 đến 1
- **Signal_Change_Detection**: Cơ chế chỉ lưu và đẩy tín hiệu khi tín hiệu thực sự thay đổi so với lần trước

## Yêu cầu

### Yêu cầu 1: Khởi tạo Nx Monorepo và Shared Types

**User Story:** Là một lập trình viên, tôi muốn có cấu trúc monorepo chuẩn với thư viện types dùng chung, để backend và frontend có thể chia sẻ kiểu dữ liệu một cách nhất quán.

#### Tiêu chí chấp nhận

1. THE Hệ_thống SHALL sử dụng Nx 19+ monorepo với hai ứng dụng: backend (NestJS 10) và frontend (React 18/Vite 5)
2. THE Hệ_thống SHALL có thư viện shared-types tại `libs/shared-types/` chứa tất cả kiểu dữ liệu dùng chung
3. THE Hệ_thống SHALL định nghĩa enum SignalType với 3 giá trị: BUY, SELL, HOLD
4. THE Hệ_thống SHALL định nghĩa enum Timeframe với 6 giá trị: 1m, 5m, 15m, 1h, 4h, 1d
5. THE Hệ_thống SHALL định nghĩa interface OhlcvCandle gồm: symbol, timeframe, openTime, open, high, low, close, volume, closeTime
6. THE Hệ_thống SHALL định nghĩa interface AllIndicators gồm 5 nhóm: TrendIndicators, MomentumIndicators, VolatilityIndicators, VolumeIndicators, CandlestickPatterns
7. THE Hệ_thống SHALL định nghĩa interface SignalResult gồm: id, symbol, timeframe, createdAt, signal, confidence (0-1), ruleSignal, deepseekSignal, deepseekReasoning, indicators

### Yêu cầu 2: Kết nối PostgreSQL và TypeORM

**User Story:** Là một lập trình viên, tôi muốn backend kết nối PostgreSQL qua TypeORM, để lưu trữ dữ liệu nến và lịch sử tín hiệu một cách bền vững.

#### Tiêu chí chấp nhận

1. THE Backend SHALL kết nối PostgreSQL 16 thông qua TypeORM 0.3 với cấu hình từ biến môi trường (.env)
2. THE Backend SHALL sử dụng ConfigModule của NestJS để quản lý các biến: DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DEEPSEEK_API_KEY
3. THE Backend SHALL sử dụng ScheduleModule của NestJS để hỗ trợ các tác vụ lập lịch
4. THE Backend SHALL tự động đồng bộ schema database khi khởi động trong môi trường development (synchronize: true)

### Yêu cầu 3: Thu thập dữ liệu từ Binance API

**User Story:** Là một lập trình viên, tôi muốn hệ thống thu thập dữ liệu nến OHLCV từ Binance, để có nguồn dữ liệu đầu vào cho việc tính toán chỉ số kỹ thuật.

#### Tiêu chí chấp nhận

1. THE Binance_Service SHALL gọi Binance REST API endpoint `GET /api/v3/klines` để lấy dữ liệu nến OHLCV cho cặp ETHUSDT
2. THE Binance_Service SHALL chuyển đổi dữ liệu raw kline từ Binance thành đối tượng OhlcvCandle với các trường: symbol, timeframe, openTime, open, high, low, close, volume, closeTime
3. THE Binance_Service SHALL hỗ trợ tham số: symbol, interval (timeframe), limit (số nến), startTime và endTime (tùy chọn)
4. IF Binance API trả về lỗi, THEN THE Binance_Service SHALL ghi log lỗi và tiếp tục hoạt động mà không làm crash ứng dụng

### Yêu cầu 4: Lưu trữ và quản lý dữ liệu OHLCV

**User Story:** Là một lập trình viên, tôi muốn dữ liệu nến được lưu trữ trong PostgreSQL với cơ chế upsert và dọn dẹp tự động, để đảm bảo dữ liệu luôn cập nhật và không chiếm quá nhiều dung lượng.

#### Tiêu chí chấp nhận

1. THE OHLCV_Service SHALL lưu trữ dữ liệu nến trong bảng `ohlcv` với unique constraint trên (symbol, timeframe, openTime)
2. THE OHLCV_Service SHALL thực hiện upsert khi lưu nến mới — bỏ qua nếu nến đã tồn tại (dựa trên unique constraint)
3. THE OHLCV_Service SHALL cung cấp phương thức truy vấn nến theo symbol, timeframe với giới hạn số lượng, sắp xếp theo openTime giảm dần
4. THE OHLCV_Service SHALL cung cấp phương thức xóa nến cũ hơn một ngày cụ thể
5. THE OHLCV_Service SHALL cung cấp phương thức lấy nến mới nhất theo symbol và timeframe

### Yêu cầu 5: Lập lịch thu thập dữ liệu OHLCV

**User Story:** Là một lập trình viên, tôi muốn hệ thống tự động thu thập dữ liệu nến theo chu kỳ, để dữ liệu luôn được cập nhật real-time.

#### Tiêu chí chấp nhận

1. WHEN Backend khởi động, THE OHLCV_Scheduler SHALL fetch 500 nến lịch sử cho tất cả 6 timeframe của cặp ETHUSDT
2. THE OHLCV_Scheduler SHALL chạy mỗi 30 giây để fetch 3 nến mới nhất cho tất cả 6 timeframe, cập nhật nến đang hình thành
3. THE OHLCV_Scheduler SHALL chạy hàng tuần (Chủ nhật 2:00 AM) để xóa dữ liệu OHLCV cũ hơn 2 năm
4. IF việc fetch dữ liệu cho một timeframe thất bại, THEN THE OHLCV_Scheduler SHALL ghi log lỗi và tiếp tục fetch các timeframe còn lại

### Yêu cầu 6: Tính toán chỉ số kỹ thuật (Technical Indicators)

**User Story:** Là một lập trình viên, tôi muốn hệ thống tính toán đầy đủ các chỉ số kỹ thuật từ dữ liệu nến, để cung cấp dữ liệu đầu vào cho Rule Engine và DeepSeek phân tích.

#### Tiêu chí chấp nhận

1. THE Indicators_Service SHALL tính toán nhóm Trend gồm: EMA (9, 21, 50, 200), DEMA 9, TEMA 9, MACD (12/26/9), ADX (14), Parabolic SAR, Ichimoku Cloud (9/26/52/26)
2. THE Indicators_Service SHALL tính toán nhóm Momentum gồm: RSI (14), Stochastic RSI (14/14/3/3), Stochastic Oscillator (14/3), Williams %R (14), CCI (20), ROC (12)
3. THE Indicators_Service SHALL tính toán nhóm Volatility gồm: Bollinger Bands (20/2), ATR (14)
4. THE Indicators_Service SHALL tính toán nhóm Volume gồm: OBV, VWAP, MFI (14), CMF (20)
5. THE Indicators_Service SHALL phát hiện nhóm Candlestick Patterns gồm: Doji, Hammer, Bullish Engulfing, Bearish Engulfing, Morning Star, Evening Star
6. THE Indicators_Service SHALL sử dụng thư viện `technicalindicators` npm để tính toán các chỉ số
7. WHEN dữ liệu nến chưa đủ số lượng tối thiểu cho một chỉ số (ví dụ: EMA 200 cần 200 nến), THE Indicators_Service SHALL trả về null cho chỉ số đó thay vì gây lỗi
8. THE Indicators_Service SHALL nhận đầu vào là mảng OhlcvEntity và trả về đối tượng AllIndicators hoàn chỉnh

### Yêu cầu 7: Rule Engine — Phân tích dựa trên luật

**User Story:** Là một lập trình viên, tôi muốn có Rule Engine đánh giá tín hiệu dựa trên trọng số của các chỉ số kỹ thuật, để có một nguồn phân tích xác định và nhất quán.

#### Tiêu chí chấp nhận

1. THE Rule_Engine SHALL nhận đầu vào là đối tượng AllIndicators và trả về SignalType (BUY/SELL/HOLD) kèm Confidence_Score (0-1)
2. THE Rule_Engine SHALL sử dụng hệ thống trọng số (weighted scoring) để đánh giá từng chỉ số: mỗi chỉ số đóng góp điểm bullish hoặc bearish theo trọng số riêng
3. THE Rule_Engine SHALL xác định tín hiệu BUY khi tổng điểm bullish vượt ngưỡng dương, SELL khi vượt ngưỡng âm, và HOLD khi nằm trong vùng trung tính
4. THE Rule_Engine SHALL bỏ qua các chỉ số có giá trị null trong quá trình tính điểm mà không ảnh hưởng đến kết quả

### Yêu cầu 8: DeepSeek LLM — Phân tích bằng AI

**User Story:** Là một lập trình viên, tôi muốn hệ thống gọi DeepSeek API để phân tích bổ sung bằng AI, để có góc nhìn đa chiều hơn so với chỉ dùng luật cứng.

#### Tiêu chí chấp nhận

1. THE DeepSeek_Service SHALL sử dụng thư viện `openai` npm với base URL `https://api.deepseek.com` để gọi DeepSeek API
2. THE DeepSeek_Service SHALL gửi prompt chứa tóm tắt dữ liệu chỉ số kỹ thuật đa khung thời gian và nhận về tín hiệu BUY/SELL/HOLD kèm lý do phân tích
3. THE Prompt_Builder SHALL tạo prompt tóm tắt dữ liệu indicators cho tất cả timeframe đang phân tích, bao gồm giá trị các chỉ số chính và xu hướng hiện tại
4. IF DeepSeek API trả về lỗi hoặc timeout, THEN THE DeepSeek_Service SHALL ghi log lỗi và trả về tín hiệu HOLD với confidence 0 làm giá trị mặc định
5. THE DeepSeek_Service SHALL trả về đối tượng gồm: signal (SignalType), confidence (0-1), reasoning (chuỗi giải thích lý do)

### Yêu cầu 9: Analyzer Service — Điều phối phân tích

**User Story:** Là một lập trình viên, tôi muốn có module điều phối kết hợp kết quả từ Rule Engine và DeepSeek, để tạo ra tín hiệu cuối cùng có trọng số hợp lý.

#### Tiêu chí chấp nhận

1. THE Analyzer_Service SHALL điều phối quá trình phân tích: lấy dữ liệu nến → tính indicators → chạy Rule Engine và DeepSeek song song → kết hợp kết quả
2. THE Analyzer_Service SHALL kết hợp tín hiệu từ Rule Engine (trọng số 40%) và DeepSeek (trọng số 60%) để tạo tín hiệu cuối cùng
3. THE Analyzer_Service SHALL tính Confidence_Score cuối cùng bằng trung bình có trọng số: (rule_confidence × 0.4) + (deepseek_confidence × 0.6)
4. THE Analyzer_Service SHALL xác định SignalType cuối cùng dựa trên tổng điểm có trọng số: BUY nếu điểm dương vượt ngưỡng, SELL nếu điểm âm vượt ngưỡng, HOLD nếu nằm trong vùng trung tính
5. THE Analyzer_Service SHALL trả về SignalResult hoàn chỉnh gồm: signal, confidence, ruleSignal, deepseekSignal, deepseekReasoning, indicators

### Yêu cầu 10: Lưu trữ và quản lý lịch sử tín hiệu

**User Story:** Là một lập trình viên, tôi muốn hệ thống lưu lịch sử tín hiệu với cơ chế phát hiện thay đổi, để chỉ ghi nhận khi tín hiệu thực sự thay đổi và giữ dung lượng database hợp lý.

#### Tiêu chí chấp nhận

1. THE Signals_Service SHALL lưu tín hiệu vào bảng `signals` với các trường: id, symbol, timeframe, signal, confidence, ruleSignal, deepseekSignal, deepseekReasoning, indicators (JSON), createdAt
2. THE Signals_Service SHALL thực hiện Signal_Change_Detection: chỉ lưu tín hiệu mới vào database khi SignalType thay đổi so với tín hiệu gần nhất cùng symbol và timeframe
3. THE Signals_Service SHALL giới hạn tối đa 200 bản ghi tín hiệu cho mỗi timeframe — tự động xóa bản ghi cũ nhất khi vượt giới hạn
4. THE Signals_Service SHALL cung cấp phương thức lấy tín hiệu mới nhất theo symbol và timeframe
5. THE Signals_Service SHALL cung cấp phương thức lấy lịch sử tín hiệu theo symbol và timeframe với phân trang

### Yêu cầu 11: REST API Endpoints

**User Story:** Là một lập trình viên frontend, tôi muốn có REST API rõ ràng để lấy dữ liệu tín hiệu, để frontend có thể hiển thị thông tin cho người dùng.

#### Tiêu chí chấp nhận

1. THE Signals_Controller SHALL cung cấp endpoint `POST /signals/generate` để kích hoạt phân tích thủ công cho một symbol và timeframe cụ thể, trả về SignalResult
2. THE Signals_Controller SHALL cung cấp endpoint `GET /signals/latest?symbol=ETHUSDT&timeframe=1h` để lấy tín hiệu mới nhất
3. THE Signals_Controller SHALL cung cấp endpoint `GET /signals/history?symbol=ETHUSDT&timeframe=1h&limit=50` để lấy lịch sử tín hiệu
4. THE Signals_Controller SHALL bật CORS để frontend có thể gọi API từ domain khác

### Yêu cầu 12: WebSocket Real-time Push

**User Story:** Là một người dùng, tôi muốn nhận tín hiệu mới ngay lập tức khi có thay đổi, để không bỏ lỡ cơ hội giao dịch.

#### Tiêu chí chấp nhận

1. THE Signals_Gateway SHALL sử dụng @nestjs/websockets với Socket.io để tạo WebSocket gateway
2. WHEN Signal_Change_Detection phát hiện tín hiệu thay đổi, THE Signals_Gateway SHALL đẩy sự kiện `signal-changed` chứa SignalResult mới tới tất cả client đang kết nối
3. THE Signals_Gateway SHALL hỗ trợ client subscribe theo symbol và timeframe cụ thể
4. THE Signals_Gateway SHALL ghi log khi client kết nối và ngắt kết nối

### Yêu cầu 13: Chu trình phân tích tự động

**User Story:** Là một người dùng, tôi muốn hệ thống tự động phân tích và cập nhật tín hiệu liên tục, để dashboard luôn hiển thị thông tin mới nhất.

#### Tiêu chí chấp nhận

1. THE Signals_Scheduler SHALL chạy chu trình phân tích mỗi 30 giây cho tất cả 6 timeframe của cặp ETHUSDT
2. THE Signals_Scheduler SHALL gọi Analyzer_Service để phân tích, sau đó gọi Signals_Service để kiểm tra thay đổi và lưu trữ
3. WHEN tín hiệu thay đổi, THE Signals_Scheduler SHALL thông báo Signals_Gateway để đẩy tín hiệu mới qua WebSocket
4. IF quá trình phân tích cho một timeframe thất bại, THEN THE Signals_Scheduler SHALL ghi log lỗi và tiếp tục phân tích các timeframe còn lại

### Yêu cầu 14: Frontend Dashboard — Layout và Design System

**User Story:** Là một người dùng, tôi muốn dashboard có giao diện "Quantex Terminal" chuyên nghiệp và dễ đọc, để tập trung vào việc ra quyết định giao dịch.

#### Tiêu chí chấp nhận

1. THE Frontend SHALL sử dụng thiết kế "Quantex Terminal" với tông màu dark terminal: --bg-base (#080b10), --bg-surface (#0d1117), --bg-elevated (#161b22)
2. THE Frontend SHALL sử dụng 3 font chữ: Bebas Neue (logo, signal type), JetBrains Mono (số liệu, giá), Barlow (labels, body text)
3. THE Frontend SHALL sử dụng màu tín hiệu: --buy (#00e676) cho BUY, --sell (#ff4757) cho SELL, --hold (#ffd60a) cho HOLD, mỗi màu có biến thể dim và glow
4. THE Frontend SHALL có scan-line background texture tạo hiệu ứng màn hình terminal CRT
5. THE Frontend SHALL responsive với 3 breakpoint: 2 cột (≥1280px), xếp chồng (768-1279px), 1 cột (<768px)
6. THE Dashboard SHALL có layout grid gồm: Topbar (cố định trên cùng), Main area (SignalCard + IndicatorPanel), SignalHistory (phía dưới)

### Yêu cầu 15: Topbar Component

**User Story:** Là một người dùng, tôi muốn thanh trên cùng hiển thị thông tin cơ bản và cho phép chọn timeframe, để nhanh chóng nắm bắt tình hình và chuyển đổi khung phân tích.

#### Tiêu chí chấp nhận

1. THE Topbar SHALL hiển thị logo "CRYPTO DSS" với subtitle "Decision Support System" ở bên trái
2. THE Topbar SHALL hiển thị giá ETH/USDT real-time ở giữa, bao gồm: tên cặp, giá hiện tại (font JetBrains Mono), phần trăm thay đổi (xanh nếu tăng, đỏ nếu giảm)
3. THE Topbar SHALL hiển thị trạng thái kết nối "LIVE" với chấm xanh nhấp nháy (pulse animation) ở bên phải
4. THE Topbar SHALL chứa TimeframeSelector cho phép chọn 1 trong 6 timeframe: 1m, 5m, 15m, 1h, 4h, 1d
5. THE Topbar SHALL cố định ở đầu trang (sticky) với chiều cao 56px và backdrop-filter blur

### Yêu cầu 16: SignalCard Component

**User Story:** Là một người dùng, tôi muốn thấy tín hiệu giao dịch hiện tại một cách trực quan và nổi bật, để ra quyết định nhanh chóng.

#### Tiêu chí chấp nhận

1. THE SignalCard SHALL hiển thị vòng SVG Confidence Gauge hình cung (arc 240°) với màu tương ứng tín hiệu, hiển thị phần trăm confidence ở trung tâm
2. THE SignalCard SHALL hiển thị SignalType (BUY/SELL/HOLD) bằng font Bebas Neue cỡ 64px với màu tương ứng
3. THE SignalCard SHALL có viền neon glow phát sáng theo màu tín hiệu: xanh cho BUY, đỏ cho SELL, vàng cho HOLD
4. THE SignalCard SHALL hiển thị so sánh Rule Engine vs DeepSeek AI: mỗi nguồn hiển thị SignalBadge riêng biệt
5. THE SignalCard SHALL hiển thị phần AI Reasoning chứa lý do phân tích từ DeepSeek, sử dụng font JetBrains Mono 11px
6. THE SignalCard SHALL có nút "REFRESH SIGNAL" để kích hoạt phân tích thủ công, hiển thị "ANALYZING..." khi đang xử lý
7. THE SignalCard SHALL hiển thị thời gian tạo tín hiệu gần nhất

### Yêu cầu 17: IndicatorPanel Component

**User Story:** Là một người dùng, tôi muốn xem chi tiết tất cả chỉ số kỹ thuật theo nhóm, để hiểu rõ cơ sở của tín hiệu.

#### Tiêu chí chấp nhận

1. THE IndicatorPanel SHALL có 5 tab: TREND, MOMENTUM, VOLATILITY, VOLUME, PATTERNS
2. THE IndicatorPanel SHALL hiển thị mỗi chỉ số trên một hàng (IndicatorRow) gồm: label bên trái, giá trị số bên phải (font JetBrains Mono), chấm trạng thái (bullish=xanh, bearish=đỏ, neutral=vàng)
3. WHEN tab TREND được chọn, THE IndicatorPanel SHALL hiển thị: EMA 9/21/50/200, DEMA 9, TEMA 9, MACD (MACD/Signal/Histogram), ADX, PSAR, Ichimoku (4 đường)
4. WHEN tab MOMENTUM được chọn, THE IndicatorPanel SHALL hiển thị: RSI 14 (kèm mini bar trực quan với vùng overbought/oversold), StochRSI K/D, Stochastic K/D, Williams %R, CCI, ROC
5. WHEN tab VOLATILITY được chọn, THE IndicatorPanel SHALL hiển thị: Bollinger Bands (Upper/Mid/Lower), ATR
6. WHEN tab VOLUME được chọn, THE IndicatorPanel SHALL hiển thị: VWAP, OBV, MFI, CMF
7. WHEN tab PATTERNS được chọn, THE IndicatorPanel SHALL hiển thị lưới badge cho các mẫu nến: badge active có màu (bullish=xanh, bearish=đỏ, neutral=vàng), badge inactive mờ
8. WHEN giá trị chỉ số là null, THE IndicatorPanel SHALL hiển thị ký tự "—" thay vì số

### Yêu cầu 18: SignalHistory Component

**User Story:** Là một người dùng, tôi muốn xem lịch sử các tín hiệu đã phát, để theo dõi xu hướng thay đổi tín hiệu theo thời gian.

#### Tiêu chí chấp nhận

1. THE SignalHistory SHALL hiển thị bảng lịch sử tín hiệu với các cột: TIME, TIMEFRAME, SIGNAL, CONFIDENCE, RULE, AI
2. THE SignalHistory SHALL hiển thị confidence dưới dạng thanh progress bar kèm phần trăm
3. THE SignalHistory SHALL hiển thị signal và rule/AI dưới dạng SignalBadge có màu tương ứng
4. THE SignalHistory SHALL hiển thị header gồm tiêu đề "SIGNAL HISTORY" và số lượng bản ghi

### Yêu cầu 19: SignalToast — Thông báo real-time

**User Story:** Là một người dùng, tôi muốn nhận thông báo trực quan khi tín hiệu thay đổi, để không bỏ lỡ sự kiện quan trọng ngay cả khi không nhìn vào dashboard.

#### Tiêu chí chấp nhận

1. WHEN Signals_Gateway đẩy sự kiện `signal-changed`, THE SignalToast SHALL hiển thị thông báo toast ở góc trên bên phải màn hình
2. THE SignalToast SHALL hiển thị: SignalType (font Bebas Neue), confidence %, symbol, timeframe, thời gian
3. THE SignalToast SHALL có viền và glow màu tương ứng tín hiệu (BUY=xanh, SELL=đỏ, HOLD=vàng)
4. THE SignalToast SHALL tự động đóng sau 8 giây với thanh progress bar đếm ngược
5. THE SignalToast SHALL có animation slide-in từ bên phải khi xuất hiện
6. THE SignalToast SHALL có nút đóng (×) để người dùng tắt thủ công

### Yêu cầu 20: Loading States và Skeleton

**User Story:** Là một người dùng, tôi muốn thấy trạng thái loading rõ ràng khi dữ liệu đang tải, để biết hệ thống đang hoạt động.

#### Tiêu chí chấp nhận

1. WHILE dữ liệu tín hiệu đang được tải, THE Dashboard SHALL hiển thị skeleton loading cho SignalCard gồm: vòng tròn skeleton (gauge), khối text skeleton (signal type), các dòng skeleton (thông tin)
2. WHILE dữ liệu indicators đang được tải, THE Dashboard SHALL hiển thị skeleton loading cho IndicatorPanel
3. THE Skeleton SHALL sử dụng animation shimmer (gradient di chuyển) với màu --bg-elevated và --bg-overlay

### Yêu cầu 21: Kết nối WebSocket từ Frontend

**User Story:** Là một lập trình viên frontend, tôi muốn có hook React kết nối WebSocket tới backend, để nhận tín hiệu real-time và cập nhật dashboard tự động.

#### Tiêu chí chấp nhận

1. THE Frontend SHALL sử dụng hook `useSignalSocket` kết nối tới Signals_Gateway qua socket.io-client
2. WHEN nhận sự kiện `signal-changed` từ WebSocket, THE Frontend SHALL tự động cập nhật SignalCard và SignalHistory với dữ liệu mới
3. WHEN nhận sự kiện `signal-changed` từ WebSocket, THE Frontend SHALL hiển thị SignalToast thông báo
4. THE Frontend SHALL sử dụng API module (`signals.api.ts`) để gọi REST endpoints: fetchLatestSignal, fetchSignalHistory, generateSignal
