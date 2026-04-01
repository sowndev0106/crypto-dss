# Crypto DSS — Frontend Dashboard Design Specification

> **Document type:** Design Specification + Prototype Reference  
> **Created:** 2026-04-02  
> **Stack:** React 18 · Vite 5 · TailwindCSS 3 · lightweight-charts  
> **Prototype:** [`frontend-dashboard-prototype.html`](./frontend-dashboard-prototype.html) — open in browser để xem live preview

---

## 1. Concept & Aesthetic Direction

### "Quantex Terminal"

**Tông:** Industrial-precision dark terminal — giao thoa giữa Bloomberg terminal và màn hình command center quân sự. Không phải đơn thuần "dark mode" — đây là giao diện dành cho người ra quyết định dưới áp lực.

**Ý tưởng cốt lõi:**  
Thị trường crypto cần sự tập trung tuyệt đối. Dashboard không được là nguồn nhiễu — nó phải là bộ khuếch đại tín hiệu. Mỗi pixel phục vụ một mục đích. Màu sắc là ngôn ngữ: xanh lá = mua, đỏ = bán, vàng = chờ.

**Yếu tố khác biệt:**
- **Circular Confidence Gauge** — vòng SVG hình speedometer hiển thị confidence %, thay vì progress bar phẳng thông thường
- **Scan-line texture** — lớp overlay grid mờ trên toàn background, gợi lên màn hình terminal CRT cũ
- **Neon glow border** trên active signal card — cạnh card phát sáng theo màu tín hiệu (green/red/amber)
- **Typewriter animation** cho DeepSeek reasoning text
- **Price ticker** real-time với animation con số

---

## 2. Design System

### 2.1 Color Palette

```css
:root {
  /* === Base Surfaces === */
  --bg-base:      #080b10;  /* backdrop — gần như đen nhưng có tint navy */
  --bg-surface:   #0d1117;  /* card background */
  --bg-elevated:  #161b22;  /* hover state, elevated panels */
  --bg-overlay:   #1c2128;  /* modal, tooltip backdrop */

  /* === Borders === */
  --border:         #21262d;  /* subtle separator */
  --border-strong:  #30363d;  /* card edges */
  --border-focus:   #58a6ff;  /* focused element */

  /* === Signal Colors === */
  --buy:       #00e676;       /* electric mint green */
  --buy-dim:   rgba(0, 230, 118, 0.12);
  --buy-glow:  0 0 24px rgba(0, 230, 118, 0.35);

  --sell:      #ff4757;       /* hot coral red */
  --sell-dim:  rgba(255, 71, 87, 0.12);
  --sell-glow: 0 0 24px rgba(255, 71, 87, 0.35);

  --hold:      #ffd60a;       /* pure amber */
  --hold-dim:  rgba(255, 214, 10, 0.12);
  --hold-glow: 0 0 24px rgba(255, 214, 10, 0.35);

  /* === UI Blue === */
  --active:      #58a6ff;     /* electric blue — links, active states */
  --active-dim:  rgba(88, 166, 255, 0.15);

  /* === Typography === */
  --text-primary:   #e6edf3;  /* main content */
  --text-secondary: #7d8590;  /* labels, captions */
  --text-muted:     #3d444d;  /* disabled, placeholder */
  --text-inverse:   #080b10;  /* on colored backgrounds */
}
```

#### Sử dụng màu tín hiệu:

| Tín hiệu | Background | Border | Text | Glow |
|----------|-----------|--------|------|------|
| **BUY** | `--buy-dim` | `--buy` | `--buy` | `--buy-glow` |
| **SELL** | `--sell-dim` | `--sell` | `--sell` | `--sell-glow` |
| **HOLD** | `--hold-dim` | `--hold` | `--hold` | `--hold-glow` |

---

### 2.2 Typography

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&family=Barlow:wght@300;400;500;600&display=swap');
```

| Role | Font | Weight | Size | Usage |
|------|------|--------|------|-------|
| **Logo / Signal Type** | `Bebas Neue` | 400 | 48–72px | "CRYPTO DSS", "BUY", "SELL", "HOLD" |
| **Numbers / Values** | `JetBrains Mono` | 400–700 | 12–28px | Prices, indicator values, confidence % |
| **Labels / Body** | `Barlow` | 300–600 | 11–16px | Tab names, row labels, descriptions |
| **Monospaced blocks** | `JetBrains Mono` | 400 | 12px | DeepSeek reasoning, AI analysis text |

---

### 2.3 Spacing & Radius

```css
/* Spacing scale (4px base) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;

/* Border radius */
--radius-sm: 4px;   /* inline chips, badges */
--radius-md: 8px;   /* inputs, small cards */
--radius-lg: 12px;  /* main cards */
--radius-xl: 16px;  /* panels */
```

---

### 2.4 Scan-line Background Texture

```css
/* Áp dụng lên body hoặc .bg-terminal */
background-color: var(--bg-base);
background-image:
  repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.012) 2px,
    rgba(255, 255, 255, 0.012) 4px
  );
```

---

## 3. Layout Architecture

### 3.1 Grid Structure (Desktop 1440px)

```
┌──────────────────────────────────────────────────────────────────┐
│  TOPBAR                                                          │
│  [CRYPTO DSS logo] [ETH/USDT ▲ $3,412.50 +1.2%]  [● LIVE] [1h] │
├────────────────────────┬─────────────────────────────────────────┤
│                        │                                         │
│   SIGNAL HERO CARD     │   INDICATOR PANEL                       │
│   ┌──────────────────┐ │   ┌─────────────────────────────────┐   │
│   │  Confidence Ring │ │   │ [TREND][MOMENTUM][VOL][VIX][PAT]│   │
│   │   ┌───────────┐  │ │   ├─────────────────────────────────┤   │
│   │   │   76%     │  │ │   │ EMA 9       3,389.44            │   │
│   │   │  ● BUY    │  │ │   │ EMA 21      3,401.12            │   │
│   │   └───────────┘  │ │   │ MACD Hist   +12.34              │   │
│   ├──────────────────┤ │   │ ADX         34.5  [strong]      │   │
│   │ Rule:  BUY ●     │ │   │ PSAR        3,351.20            │   │
│   │ AI:    BUY ●     │ │   │ Ichimoku …                      │   │
│   ├──────────────────┤ │   └─────────────────────────────────┘   │
│   │ AI Reasoning     │ │                                         │
│   │ ▋ (typewriter)   │ │                                         │
│   └──────────────────┘ │                                         │
│                        │                                         │
├────────────────────────┴─────────────────────────────────────────┤
│  SIGNAL HISTORY                                                  │
│  Time      Signal  Confidence  Rule   AI   Timeframe             │
│  13:45:22  BUY     ████ 76%    BUY   BUY   1h                   │
│  13:00:05  HOLD    ██   42%    HOLD  HOLD  1h                   │
│  ...                                                             │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| `≥ 1280px` | 2-column: Signal (40%) + Indicators (60%) |
| `768–1279px` | Signal trên, Indicators dưới (stacked) |
| `< 768px` | Single column, tabs simplified, compact numbers |

### 3.3 CSS Grid Layout

```css
.dashboard {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  min-height: 100vh;
  gap: 0;
}

.dashboard__main {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  padding: 24px;
  align-items: start;
}

@media (max-width: 1280px) {
  .dashboard__main {
    grid-template-columns: 1fr;
  }
}
```

---

## 4. Component Specifications

### 4.1 Topbar

**Mô tả:** Fixed header, chiều cao 56px. 3 khu vực: logo (trái), price ticker (giữa), controls (phải).

```tsx
// Topbar.tsx
<header className="topbar">
  {/* Left: Brand */}
  <div className="topbar__brand">
    <span className="topbar__logo">CRYPTO DSS</span>
    <span className="topbar__subtitle">Decision Support System</span>
  </div>

  {/* Center: Live Price */}
  <div className="topbar__price">
    <span className="price__symbol">ETH/USDT</span>
    <span className="price__value">3,412.50</span>
    <span className="price__change price__change--up">▲ +1.24%</span>
  </div>

  {/* Right: Status + Timeframe */}
  <div className="topbar__controls">
    <div className="status-dot status-dot--live">
      <span className="dot__pulse" />
      <span>LIVE</span>
    </div>
    <TimeframeSelector />
  </div>
</header>
```

**CSS nổi bật:**
```css
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
}

.topbar__logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: 0.1em;
  color: var(--active);
}

.price__value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Pulsing green dot for live status */
.status-dot--live .dot__pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--buy);
  animation: pulse-live 2s ease-in-out infinite;
  box-shadow: 0 0 0 0 var(--buy);
}

@keyframes pulse-live {
  0%   { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(0, 230, 118, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); }
}
```

---

### 4.2 TimeframeSelector

```tsx
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

<div className="timeframe-selector">
  {TIMEFRAMES.map((tf) => (
    <button
      key={tf}
      className={`tf-btn ${timeframe === tf ? 'tf-btn--active' : ''}`}
      onClick={() => setTimeframe(tf)}
    >
      {tf}
    </button>
  ))}
</div>
```

```css
.timeframe-selector {
  display: flex;
  gap: 4px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 3px;
}

.tf-btn {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tf-btn:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.tf-btn--active {
  background: var(--active);
  color: var(--bg-base);
  font-weight: 700;
}
```

---

### 4.3 SignalCard (Hero Component)

**Đây là component quan trọng nhất.** Thiết kế xung quanh vòng confidence gauge hình cung (arc SVG), với signal type hiển thị ở trung tâm bằng font Bebas Neue cỡ lớn.

#### 4.3.1 Confidence Arc Gauge

SVG arc được vẽ tay, progress từ `220°` đến `-40°` (tổng 240° cung). Màu fill tương ứng với signal.

```tsx
interface GaugeProps {
  value: number;       // 0–100
  signal: 'BUY' | 'SELL' | 'HOLD';
}

function ConfidenceGauge({ value, signal }: GaugeProps) {
  const radius = 80;
  const cx = 100, cy = 100;
  const totalAngle = 240; // degrees
  const startAngle = 150; // degrees from east (clockwise)
  
  // Convert to SVG arc path
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startRad = toRad(startAngle);
  const endRad = toRad(startAngle + totalAngle * (value / 100));

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = totalAngle * (value / 100) > 180 ? 1 : 0;

  const colorVar = { BUY: 'var(--buy)', SELL: 'var(--sell)', HOLD: 'var(--hold)' }[signal];

  return (
    <svg viewBox="0 0 200 200" className="confidence-gauge">
      {/* Track arc (gray) */}
      <path
        d={`M ${cx + radius * Math.cos(toRad(startAngle))} ${cy + radius * Math.sin(toRad(startAngle))}
            A ${radius} ${radius} 0 1 1
            ${cx + radius * Math.cos(toRad(startAngle + totalAngle))} ${cy + radius * Math.sin(toRad(startAngle + totalAngle))}`}
        fill="none"
        stroke="var(--bg-elevated)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Value arc (colored) */}
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
        fill="none"
        stroke={colorVar}
        strokeWidth="10"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${colorVar})` }}
      />
      {/* Center: % value */}
      <text x={cx} y={cy - 10} textAnchor="middle"
            fontFamily="JetBrains Mono" fontSize="28" fontWeight="700"
            fill="var(--text-primary)">
        {value}%
      </text>
      {/* Center: label */}
      <text x={cx} y={cy + 16} textAnchor="middle"
            fontFamily="Barlow" fontSize="11" letterSpacing="0.15em"
            fill="var(--text-secondary)">
        CONFIDENCE
      </text>
    </svg>
  );
}
```

#### 4.3.2 Full SignalCard Component

```tsx
export function SignalCard({ signal, isLoading, onRefresh }: Props) {
  const signalType = signal?.signal ?? 'HOLD';
  const confidence = Math.round((signal?.confidence ?? 0) * 100);

  const glowClass = {
    BUY: 'signal-card--buy',
    SELL: 'signal-card--sell',
    HOLD: 'signal-card--hold',
  }[signalType];

  return (
    <div className={`signal-card ${glowClass}`}>
      {/* Gauge + Signal Type */}
      <div className="signal-card__hero">
        <div className="signal-card__gauge">
          <ConfidenceGauge value={confidence} signal={signalType} />
        </div>
        <div className="signal-card__type">
          <span className="signal-type-label">{signalType}</span>
          <span className="signal-card__time">
            {signal?.createdAt ? new Date(signal.createdAt).toLocaleTimeString() : '—'}
          </span>
        </div>
      </div>

      {/* Rule vs AI comparison */}
      <div className="signal-card__sources">
        <div className="source-item">
          <span className="source-item__label">RULE ENGINE</span>
          <SignalBadge value={signal?.ruleSignal} />
        </div>
        <div className="source-divider" />
        <div className="source-item">
          <span className="source-item__label">DEEPSEEK AI</span>
          <SignalBadge value={signal?.deepseekSignal} />
        </div>
      </div>

      {/* AI Reasoning */}
      {signal?.deepseekReasoning && (
        <div className="signal-card__reasoning">
          <span className="reasoning__label">AI ANALYSIS</span>
          <p className="reasoning__text">{signal.deepseekReasoning}</p>
        </div>
      )}

      {/* Refresh button */}
      <button
        className="signal-card__refresh"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? 'ANALYZING...' : 'REFRESH SIGNAL'}
      </button>
    </div>
  );
}
```

```css
.signal-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  padding: 24px;
  transition: box-shadow 0.4s ease, border-color 0.4s ease;
}

.signal-card--buy {
  border-color: var(--buy);
  box-shadow: var(--buy-glow), inset 0 0 60px rgba(0, 230, 118, 0.03);
}
.signal-card--sell {
  border-color: var(--sell);
  box-shadow: var(--sell-glow), inset 0 0 60px rgba(255, 71, 87, 0.03);
}
.signal-card--hold {
  border-color: var(--hold);
  box-shadow: var(--hold-glow), inset 0 0 60px rgba(255, 214, 10, 0.03);
}

.signal-type-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 64px;
  line-height: 1;
  letter-spacing: 0.05em;
}

.signal-card--buy  .signal-type-label { color: var(--buy); }
.signal-card--sell .signal-type-label { color: var(--sell); }
.signal-card--hold .signal-type-label { color: var(--hold); }

.signal-card__sources {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin: 16px 0;
}

.source-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

.source-item__label {
  font-family: 'Barlow', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

.signal-card__reasoning {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  margin: 0 0 16px;
}

.reasoning__label {
  font-family: 'Barlow', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--active);
  display: block;
  margin-bottom: 6px;
}

.reasoning__text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.signal-card__refresh {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-family: 'Barlow', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.signal-card__refresh:hover {
  border-color: var(--active);
  color: var(--active);
  background: var(--active-dim);
}
.signal-card__refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### 4.4 SignalBadge

```tsx
function SignalBadge({ value }: { value: 'BUY' | 'SELL' | 'HOLD' | null }) {
  if (!value) return <span className="signal-badge signal-badge--null">—</span>;
  return (
    <span className={`signal-badge signal-badge--${value.toLowerCase()}`}>
      {value}
    </span>
  );
}
```

```css
.signal-badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 4px;
}

.signal-badge--buy  { background: var(--buy-dim);  color: var(--buy);  border: 1px solid var(--buy); }
.signal-badge--sell { background: var(--sell-dim); color: var(--sell); border: 1px solid var(--sell); }
.signal-badge--hold { background: var(--hold-dim); color: var(--hold); border: 1px solid var(--hold); }
.signal-badge--null { color: var(--text-muted); }
```

---

### 4.5 IndicatorPanel

Tab navigation cho 5 nhóm indicators. Mỗi tab là một danh sách rows với label + value.

#### Thiết kế Row

```tsx
function IndicatorRow({
  label,
  value,
  status,  // 'bullish' | 'bearish' | 'neutral' | undefined
}: {
  label: string;
  value: string | number | null;
  status?: 'bullish' | 'bearish' | 'neutral';
}) {
  const formatted = value === null || value === undefined
    ? '—'
    : typeof value === 'number'
      ? value.toFixed(2)
      : value;

  return (
    <div className="indicator-row">
      <span className="indicator-row__label">{label}</span>
      <div className="indicator-row__right">
        {status && <span className={`indicator-dot indicator-dot--${status}`} />}
        <span className="indicator-row__value">{formatted}</span>
      </div>
    </div>
  );
}
```

```css
.indicator-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.indicator-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--bg-base);
}

.indicator-tab {
  flex: 1;
  padding: 10px 0;
  font-family: 'Barlow', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  position: relative;
}
.indicator-tab:hover { color: var(--text-secondary); }
.indicator-tab--active {
  color: var(--active);
  background: var(--active-dim);
}
.indicator-tab--active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: var(--active);
}

.indicator-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 16px;
  border-bottom: 1px solid var(--border);
}
.indicator-row:last-child { border-bottom: none; }
.indicator-row:hover { background: var(--bg-elevated); }

.indicator-row__label {
  font-family: 'Barlow', sans-serif;
  font-size: 12px;
  color: var(--text-secondary);
}
.indicator-row__value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}
.indicator-dot--bullish { background: var(--buy); }
.indicator-dot--bearish { background: var(--sell); }
.indicator-dot--neutral { background: var(--hold); }

/* Section header (Trend, Momentum, etc.) */
.indicator-section-header {
  padding: 6px 16px;
  font-family: 'Barlow', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: var(--text-muted);
  text-transform: uppercase;
  background: var(--bg-base);
  border-bottom: 1px solid var(--border);
}
```

#### Tab content mapping

| Tab | Hiển thị |
|-----|---------|
| **TREND** | EMA 9/21/50/200, DEMA 9, TEMA 9, MACD (MACD/Signal/Hist), ADX, PSAR, Ichimoku 4 lines |
| **MOMENTUM** | RSI 14 (+ mini bar), StochRSI K/D, Stochastic K/D, Williams %R, CCI, ROC |
| **VOLATILITY** | BB Upper/Mid/Lower, ATR, Bandwidth % |
| **VOLUME** | VWAP, OBV, MFI, CMF |
| **PATTERNS** | Active pattern badges grid |

##### RSI Mini Bar (inline visual)

```tsx
function RsiRow({ value }: { value: number | null }) {
  if (!value) return <IndicatorRow label="RSI (14)" value={null} />;
  
  const status = value > 70 ? 'bearish' : value < 30 ? 'bullish' : 'neutral';
  const zone = value > 70 ? 'OVERBOUGHT' : value < 30 ? 'OVERSOLD' : '';

  return (
    <div className="indicator-row">
      <span className="indicator-row__label">RSI (14)</span>
      <div className="indicator-row__right indicator-row__right--rsi">
        <div className="rsi-bar-track">
          <div
            className={`rsi-bar-fill rsi-bar-fill--${status}`}
            style={{ width: `${value}%` }}
          />
          {/* Overbought/oversold markers */}
          <div className="rsi-marker rsi-marker--30" />
          <div className="rsi-marker rsi-marker--70" />
        </div>
        <span className="indicator-row__value">{value.toFixed(1)}</span>
        {zone && <span className={`rsi-zone rsi-zone--${status}`}>{zone}</span>}
      </div>
    </div>
  );
}
```

#### Patterns Tab

```tsx
function PatternsTab({ patterns }: { patterns: CandlestickPatterns | null }) {
  if (!patterns) return null;

  const PATTERN_LABELS: Record<keyof CandlestickPatterns, { label: string; type: 'bullish' | 'bearish' | 'neutral' }> = {
    doji:             { label: 'Doji',               type: 'neutral' },
    hammer:           { label: 'Hammer',             type: 'bullish' },
    bullishEngulfing: { label: 'Bullish Engulfing',  type: 'bullish' },
    bearishEngulfing: { label: 'Bearish Engulfing',  type: 'bearish' },
    morningStar:      { label: 'Morning Star',       type: 'bullish' },
    eveningStar:      { label: 'Evening Star',       type: 'bearish' },
  };

  const active = Object.entries(patterns).filter(([, v]) => v);
  const inactive = Object.entries(patterns).filter(([, v]) => !v);

  return (
    <div className="patterns-grid">
      {active.length === 0 && (
        <p className="patterns-empty">No patterns detected</p>
      )}
      {active.map(([key]) => {
        const meta = PATTERN_LABELS[key as keyof CandlestickPatterns];
        return (
          <span key={key} className={`pattern-badge pattern-badge--${meta.type} pattern-badge--active`}>
            {meta.label}
          </span>
        );
      })}
      {inactive.map(([key]) => {
        const meta = PATTERN_LABELS[key as keyof CandlestickPatterns];
        return (
          <span key={key} className="pattern-badge pattern-badge--inactive">
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
```

```css
.patterns-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
}

.pattern-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-family: 'Barlow', sans-serif;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid transparent;
}
.pattern-badge--active.pattern-badge--bullish { background: var(--buy-dim);  color: var(--buy);  border-color: var(--buy); }
.pattern-badge--active.pattern-badge--bearish { background: var(--sell-dim); color: var(--sell); border-color: var(--sell); }
.pattern-badge--active.pattern-badge--neutral { background: var(--hold-dim); color: var(--hold); border-color: var(--hold); }
.pattern-badge--inactive {
  background: transparent;
  color: var(--text-muted);
  border-color: var(--border);
  opacity: 0.5;
}
```

---

### 4.6 SignalToast (Real-time Notification)

```tsx
export function SignalToast({ event, onClose }: { event: SignalChangedEvent; onClose: () => void }) {
  // Auto dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, []);

  const signalClass = `toast--${event.signal.toLowerCase()}`;

  return (
    <div className={`signal-toast ${signalClass}`} role="alert">
      <div className="toast__signal">
        <span className="toast__type">{event.signal}</span>
        <span className="toast__confidence">
          {Math.round(event.confidence * 100)}%
        </span>
      </div>
      <div className="toast__meta">
        <span className="toast__symbol">{event.symbol}</span>
        <span className="toast__separator">·</span>
        <span className="toast__tf">{event.timeframe}</span>
        <span className="toast__separator">·</span>
        <span className="toast__time">
          {new Date(event.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <button className="toast__close" onClick={onClose} aria-label="Close">×</button>
      {/* Auto-dismiss progress bar */}
      <div className="toast__progress" />
    </div>
  );
}
```

```css
.signal-toast {
  position: fixed;
  top: 72px;
  right: 24px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  min-width: 260px;
  animation: toast-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

@keyframes toast-enter {
  from { transform: translateX(calc(100% + 40px)); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

.toast--buy  { background: var(--buy-dim);  border-color: var(--buy);  box-shadow: var(--buy-glow); }
.toast--sell { background: var(--sell-dim); border-color: var(--sell); box-shadow: var(--sell-glow); }
.toast--hold { background: var(--hold-dim); border-color: var(--hold); box-shadow: var(--hold-glow); }

.toast__type {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px;
  letter-spacing: 0.08em;
}
.toast--buy  .toast__type { color: var(--buy); }
.toast--sell .toast__type { color: var(--sell); }
.toast--hold .toast__type { color: var(--hold); }

.toast__confidence {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-left: 8px;
}

.toast__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Barlow', sans-serif;
  font-size: 12px;
  color: var(--text-secondary);
}

.toast__close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
}

.toast__progress {
  position: absolute;
  bottom: 0; left: 0;
  height: 2px;
  background: currentColor;
  animation: toast-progress 8s linear forwards;
}
@keyframes toast-progress {
  from { width: 100%; }
  to   { width: 0; }
}
```

---

### 4.7 SignalHistory Table

```tsx
export function SignalHistory({ signals }: { signals: SignalResult[] }) {
  return (
    <div className="history-panel">
      <div className="history-panel__header">
        <span>SIGNAL HISTORY</span>
        <span className="history-panel__count">{signals.length} records</span>
      </div>
      <table className="history-table">
        <thead>
          <tr>
            <th>TIME</th>
            <th>TIMEFRAME</th>
            <th>SIGNAL</th>
            <th>CONFIDENCE</th>
            <th>RULE</th>
            <th>AI</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((s) => (
            <tr key={s.id} className={`history-row history-row--${s.signal.toLowerCase()}`}>
              <td>{new Date(s.createdAt).toLocaleTimeString()}</td>
              <td>
                <span className="history-tf">{s.timeframe}</span>
              </td>
              <td>
                <SignalBadge value={s.signal} />
              </td>
              <td>
                <div className="history-confidence">
                  <div
                    className="history-confidence__bar"
                    style={{ width: `${s.confidence * 100}%` }}
                  />
                  <span>{Math.round(s.confidence * 100)}%</span>
                </div>
              </td>
              <td><SignalBadge value={s.ruleSignal} /></td>
              <td><SignalBadge value={s.deepseekSignal} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 5. Loading States

### Skeleton pulse (Tailwind + CSS)

```tsx
function SkeletonSignalCard() {
  return (
    <div className="signal-card">
      <div className="skeleton skeleton--circle" /> {/* gauge */}
      <div className="skeleton skeleton--text skeleton--xl" /> {/* BUY/SELL/HOLD */}
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text skeleton--sm" />
    </div>
  );
}
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    var(--bg-overlay)  50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
@keyframes skeleton-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

.skeleton--circle { width: 160px; height: 160px; border-radius: 50%; }
.skeleton--text   { height: 16px; margin: 6px 0; }
.skeleton--xl     { height: 48px; width: 80px; }
.skeleton--sm     { width: 60%; }
```

---

## 6. Animation & Motion Summary

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page load — cards stagger | `fadeInUp` | 400ms, delay +80ms per card | `ease-out` |
| Signal type change | `scale(1.15) → scale(1)` | 300ms | `ease-out` |
| Confidence gauge arc | SVG stroke-dashoffset | 600ms | `ease-in-out` |
| Live price change | flash green/red bg | 300ms | `ease` |
| Toast enter | translateX + spring | 300ms | `cubic-bezier(0.34,1.56,0.64,1)` |
| Tab switch | opacity 0→1 | 150ms | `ease` |
| Skeleton shimmer | background-position | 1500ms | `ease-in-out` |
| Live dot pulse | box-shadow expand | 2000ms | `ease-in-out` ∞ |
| Refresh button spin | rotate 360° | 700ms | `ease` |

---

## 7. File Structure (Frontend)

```
apps/frontend/src/
├── styles/
│   ├── index.css         ← CSS variables, reset, scan-line texture
│   ├── components.css    ← shared component styles
│   └── animations.css    ← keyframe definitions
├── components/
│   ├── SignalCard.tsx
│   ├── SignalBadge.tsx
│   ├── ConfidenceGauge.tsx
│   ├── IndicatorPanel.tsx
│   ├── IndicatorRow.tsx
│   ├── RsiRow.tsx
│   ├── PatternsTab.tsx
│   ├── SignalToast.tsx
│   ├── SignalHistory.tsx
│   ├── Topbar.tsx
│   └── TimeframeSelector.tsx
├── pages/
│   └── Dashboard.tsx
├── hooks/
│   └── useSignalSocket.ts
└── api/
    └── signals.api.ts
```

---

## 8. Tailwind Config Extension

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display:  ['Bebas Neue', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
        ui:       ['Barlow', 'sans-serif'],
      },
      colors: {
        buy:  '#00e676',
        sell: '#ff4757',
        hold: '#ffd60a',
        terminal: {
          base:     '#080b10',
          surface:  '#0d1117',
          elevated: '#161b22',
        },
      },
      keyframes: {
        'toast-enter': {
          from: { transform: 'translateX(calc(100% + 40px))', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-live': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,230,118,0.6)' },
          '70%':       { boxShadow: '0 0 0 8px rgba(0,230,118,0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'toast-enter': 'toast-enter 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-live':  'pulse-live 2s ease-in-out infinite',
        shimmer:       'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
};
```

---

## 9. Xem Live Prototype

Mở file [frontend-dashboard-prototype.html](./frontend-dashboard-prototype.html) trong trình duyệt để xem toàn bộ dashboard với mock data tĩnh — không cần server, không cần build.

Prototype bao gồm:
- ✅ Topbar với live price ticker (animation)
- ✅ SignalCard với Confidence Arc Gauge (SVG)
- ✅ IndicatorPanel với 5 tabs đầy đủ
- ✅ SignalToast (click "Trigger Toast" để test)
- ✅ SignalHistory table
- ✅ Responsive layout
- ✅ Tất cả CSS variables + scan-line texture
- ✅ Loading skeleton demo
