# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Crypto DSS** (Decision Support System) — hệ thống hỗ trợ quyết định giao dịch tiền mã hóa, tập trung vào ETH/USDT trên sàn Binance.

Mục tiêu: dự đoán xu hướng tăng/giảm giá và đưa ra tín hiệu lệnh (BUY/SELL/HOLD) dựa trên các chỉ số kỹ thuật lấy từ Binance API.

## Architecture

### Luồng dữ liệu chính

```
Binance API
    │
    ▼
Data Collector       ← thu thập OHLCV (Open/High/Low/Close/Volume) theo khung thời gian (1m, 5m, 15m, 1h, 4h, 1d)
    │
    ▼
Feature Engineering  ← tính toán các chỉ số kỹ thuật (indicators)
    │
    ▼
Prediction Model     ← mô hình dự đoán tăng/giảm (ML hoặc rule-based)
    │
    ▼
Signal Generator     ← xuất tín hiệu BUY / SELL / HOLD + mức độ tin cậy (confidence)
    │
    ▼
Dashboard / API      ← hiển thị kết quả cho người dùng
```

### Các chỉ số kỹ thuật (Indicators)

| Nhóm        | Chỉ số                                        |
| ----------- | --------------------------------------------- |
| Trend       | EMA (9, 21, 50, 200), SMA, MACD, ADX          |
| Momentum    | RSI (14), Stochastic RSI, CCI, ROC            |
| Volatility  | Bollinger Bands, ATR, Keltner Channel         |
| Volume      | OBV, VWAP, Volume MA, MFI                     |
| Candlestick | Engulfing, Doji, Hammer, Morning/Evening Star |

### Timeframes

Hệ thống phân tích đa khung thời gian (multi-timeframe):

- **Short-term**: 1m, 5m (scalping / intraday)
- **Mid-term**: 15m, 1h (swing trade)
- **Long-term**: 4h, 1d (trend following)

### Nguồn dữ liệu — Binance API

- REST API: lấy dữ liệu lịch sử (klines/candlestick)
- WebSocket: dữ liệu real-time (ticker, depth, trades)
- Endpoint chính: `GET /api/v3/klines`, `GET /api/v3/ticker/24hr`

## Key Design Decisions

- **Symbol mặc định**: `ETHUSDT` trên Binance Spot
- **Label dự đoán**: giá đóng cửa candle tiếp theo tăng hay giảm so với hiện tại (binary classification), hoặc % thay đổi (regression)
- **Tín hiệu đầu ra**: BUY / SELL / HOLD kèm confidence score (0–1)
- **Không tự động đặt lệnh** — đây là hệ thống hỗ trợ quyết định, không phải bot trading tự động
