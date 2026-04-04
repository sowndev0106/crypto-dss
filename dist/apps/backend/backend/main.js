/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(6);
const schedule_1 = __webpack_require__(7);
const app_controller_1 = __webpack_require__(8);
const app_service_1 = __webpack_require__(9);
const ohlcv_module_1 = __webpack_require__(10);
const indicators_module_1 = __webpack_require__(19);
const analyzer_module_1 = __webpack_require__(29);
const signals_module_1 = __webpack_require__(43);
const market_module_1 = __webpack_require__(40);
const alert_module_1 = __webpack_require__(52);
const ohlcv_entity_1 = __webpack_require__(11);
const signals_entity_1 = __webpack_require__(44);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST', 'localhost'),
                    port: configService.get('DATABASE_PORT', 5432),
                    username: configService.get('DATABASE_USER', 'postgres'),
                    password: configService.get('DATABASE_PASSWORD', 'postgres'),
                    database: configService.get('DATABASE_NAME', 'crypto_dss'),
                    entities: [ohlcv_entity_1.OhlcvEntity, signals_entity_1.SignalEntity],
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            ohlcv_module_1.OhlcvModule,
            indicators_module_1.IndicatorsModule,
            analyzer_module_1.AnalyzerModule,
            signals_module_1.SignalsModule,
            market_module_1.MarketModule,
            alert_module_1.AlertModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/typeorm");

/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/schedule");

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_service_1 = __webpack_require__(9);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OhlcvModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const ohlcv_entity_1 = __webpack_require__(11);
const ohlcv_service_1 = __webpack_require__(13);
const ohlcv_scheduler_1 = __webpack_require__(14);
const ohlcv_controller_1 = __webpack_require__(17);
const binance_module_1 = __webpack_require__(18);
let OhlcvModule = class OhlcvModule {
};
exports.OhlcvModule = OhlcvModule;
exports.OhlcvModule = OhlcvModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ohlcv_entity_1.OhlcvEntity]), binance_module_1.BinanceModule],
        controllers: [ohlcv_controller_1.OhlcvController],
        providers: [ohlcv_service_1.OhlcvService, ohlcv_scheduler_1.OhlcvScheduler],
        exports: [ohlcv_service_1.OhlcvService],
    })
], OhlcvModule);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OhlcvEntity = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
let OhlcvEntity = class OhlcvEntity {
};
exports.OhlcvEntity = OhlcvEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], OhlcvEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    tslib_1.__metadata("design:type", String)
], OhlcvEntity.prototype, "symbol", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ length: 5 }),
    tslib_1.__metadata("design:type", String)
], OhlcvEntity.prototype, "timeframe", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    tslib_1.__metadata("design:type", Number)
], OhlcvEntity.prototype, "openTime", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8 }),
    tslib_1.__metadata("design:type", Number)
], OhlcvEntity.prototype, "open", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8 }),
    tslib_1.__metadata("design:type", Number)
], OhlcvEntity.prototype, "high", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8 }),
    tslib_1.__metadata("design:type", Number)
], OhlcvEntity.prototype, "low", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8 }),
    tslib_1.__metadata("design:type", Number)
], OhlcvEntity.prototype, "close", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 8 }),
    tslib_1.__metadata("design:type", Number)
], OhlcvEntity.prototype, "volume", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    tslib_1.__metadata("design:type", Number)
], OhlcvEntity.prototype, "closeTime", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], OhlcvEntity.prototype, "createdAt", void 0);
exports.OhlcvEntity = OhlcvEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('ohlcv'),
    (0, typeorm_1.Unique)(['symbol', 'timeframe', 'openTime'])
], OhlcvEntity);


/***/ }),
/* 12 */
/***/ ((module) => {

"use strict";
module.exports = require("typeorm");

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OhlcvService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const typeorm_2 = __webpack_require__(12);
const ohlcv_entity_1 = __webpack_require__(11);
let OhlcvService = class OhlcvService {
    constructor(ohlcvRepository) {
        this.ohlcvRepository = ohlcvRepository;
    }
    async upsertCandles(candles) {
        if (candles.length === 0)
            return;
        await this.ohlcvRepository
            .createQueryBuilder()
            .insert()
            .into(ohlcv_entity_1.OhlcvEntity)
            .values(candles)
            .orIgnore()
            .execute();
    }
    async getCandles(symbol, timeframe, limit) {
        return this.ohlcvRepository.find({
            where: { symbol, timeframe },
            order: { openTime: 'DESC' },
            take: limit,
        });
    }
    async getLatestCandle(symbol, timeframe) {
        return this.ohlcvRepository.findOne({
            where: { symbol, timeframe },
            order: { openTime: 'DESC' },
        });
    }
    async deleteOlderThan(date) {
        const result = await this.ohlcvRepository
            .createQueryBuilder()
            .delete()
            .from(ohlcv_entity_1.OhlcvEntity)
            .where('openTime < :cutoff', { cutoff: date.getTime() })
            .execute();
        return result.affected ?? 0;
    }
};
exports.OhlcvService = OhlcvService;
exports.OhlcvService = OhlcvService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(ohlcv_entity_1.OhlcvEntity)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], OhlcvService);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var OhlcvScheduler_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OhlcvScheduler = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const schedule_1 = __webpack_require__(7);
const binance_service_1 = __webpack_require__(15);
const ohlcv_service_1 = __webpack_require__(13);
let OhlcvScheduler = OhlcvScheduler_1 = class OhlcvScheduler {
    constructor(binanceService, ohlcvService) {
        this.binanceService = binanceService;
        this.ohlcvService = ohlcvService;
        this.logger = new common_1.Logger(OhlcvScheduler_1.name);
        this.SYMBOL = 'ETHUSDT';
        this.TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];
    }
    async onModuleInit() {
        this.logger.log('Fetching historical candles on startup...');
        for (const timeframe of this.TIMEFRAMES) {
            try {
                const candles = await this.binanceService.fetchKlines(this.SYMBOL, timeframe, 500);
                await this.ohlcvService.upsertCandles(candles);
                this.logger.log(`Fetched 500 historical candles for ${timeframe}`);
            }
            catch (error) {
                this.logger.error(`Failed to fetch historical candles for ${timeframe}: ${error.message}`);
            }
        }
    }
    async fetchLatestCandles() {
        for (const timeframe of this.TIMEFRAMES) {
            try {
                const candles = await this.binanceService.fetchKlines(this.SYMBOL, timeframe, 3);
                await this.ohlcvService.upsertCandles(candles);
            }
            catch (error) {
                this.logger.error(`Failed to fetch latest candles for ${timeframe}: ${error.message}`);
            }
        }
    }
    async cleanupOldData() {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        try {
            const deleted = await this.ohlcvService.deleteOlderThan(twoYearsAgo);
            this.logger.log(`Cleaned up ${deleted} OHLCV records older than 2 years`);
        }
        catch (error) {
            this.logger.error(`Failed to cleanup old OHLCV data: ${error.message}`);
        }
    }
};
exports.OhlcvScheduler = OhlcvScheduler;
tslib_1.__decorate([
    (0, schedule_1.Cron)('*/30 * * * * *'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], OhlcvScheduler.prototype, "fetchLatestCandles", null);
tslib_1.__decorate([
    (0, schedule_1.Cron)('0 2 * * 0'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], OhlcvScheduler.prototype, "cleanupOldData", null);
exports.OhlcvScheduler = OhlcvScheduler = OhlcvScheduler_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof binance_service_1.BinanceService !== "undefined" && binance_service_1.BinanceService) === "function" ? _a : Object, typeof (_b = typeof ohlcv_service_1.OhlcvService !== "undefined" && ohlcv_service_1.OhlcvService) === "function" ? _b : Object])
], OhlcvScheduler);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var BinanceService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BinanceService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const axios_1 = tslib_1.__importDefault(__webpack_require__(16));
let BinanceService = BinanceService_1 = class BinanceService {
    constructor() {
        this.logger = new common_1.Logger(BinanceService_1.name);
        this.baseUrl = 'https://api.binance.com/api/v3/klines';
    }
    async fetchKlines(symbol, interval, limit = 500, startTime, endTime) {
        try {
            const params = { symbol, interval, limit };
            if (startTime !== undefined)
                params.startTime = startTime;
            if (endTime !== undefined)
                params.endTime = endTime;
            const response = await axios_1.default.get(this.baseUrl, { params });
            return response.data.map((raw) => ({
                symbol,
                timeframe: interval,
                openTime: raw[0],
                open: parseFloat(raw[1]),
                high: parseFloat(raw[2]),
                low: parseFloat(raw[3]),
                close: parseFloat(raw[4]),
                volume: parseFloat(raw[5]),
                closeTime: raw[6],
            }));
        }
        catch (error) {
            this.logger.error(`Failed to fetch klines for ${symbol} ${interval}: ${error.message}`);
            throw error;
        }
    }
};
exports.BinanceService = BinanceService;
exports.BinanceService = BinanceService = BinanceService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], BinanceService);


/***/ }),
/* 16 */
/***/ ((module) => {

"use strict";
module.exports = require("axios");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OhlcvController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const ohlcv_service_1 = __webpack_require__(13);
let OhlcvController = class OhlcvController {
    constructor(ohlcvService) {
        this.ohlcvService = ohlcvService;
    }
    async getCandles(symbol, timeframe, limit = 200) {
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, Number(limit));
        return candles.reverse(); // chronological order
    }
};
exports.OhlcvController = OhlcvController;
tslib_1.__decorate([
    (0, common_1.Get)('candles'),
    tslib_1.__param(0, (0, common_1.Query)('symbol')),
    tslib_1.__param(1, (0, common_1.Query)('timeframe')),
    tslib_1.__param(2, (0, common_1.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OhlcvController.prototype, "getCandles", null);
exports.OhlcvController = OhlcvController = tslib_1.__decorate([
    (0, common_1.Controller)('ohlcv'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof ohlcv_service_1.OhlcvService !== "undefined" && ohlcv_service_1.OhlcvService) === "function" ? _a : Object])
], OhlcvController);


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BinanceModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const binance_service_1 = __webpack_require__(15);
let BinanceModule = class BinanceModule {
};
exports.BinanceModule = BinanceModule;
exports.BinanceModule = BinanceModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [binance_service_1.BinanceService],
        exports: [binance_service_1.BinanceService],
    })
], BinanceModule);


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IndicatorsModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const indicators_service_1 = __webpack_require__(20);
const ohlcv_module_1 = __webpack_require__(10);
let IndicatorsModule = class IndicatorsModule {
};
exports.IndicatorsModule = IndicatorsModule;
exports.IndicatorsModule = IndicatorsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [ohlcv_module_1.OhlcvModule],
        providers: [indicators_service_1.IndicatorsService],
        exports: [indicators_service_1.IndicatorsService],
    })
], IndicatorsModule);


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IndicatorsService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const trend_indicators_1 = __webpack_require__(21);
const momentum_indicators_1 = __webpack_require__(23);
const volatility_indicators_1 = __webpack_require__(24);
const volume_indicators_1 = __webpack_require__(25);
const patterns_indicators_1 = __webpack_require__(26);
const sr_indicators_1 = __webpack_require__(27);
const risk_indicators_1 = __webpack_require__(28);
let IndicatorsService = class IndicatorsService {
    calculate(candles) {
        const trend = (0, trend_indicators_1.calcTrend)(candles);
        const momentum = (0, momentum_indicators_1.calcMomentum)(candles);
        const volatility = (0, volatility_indicators_1.calcVolatility)(candles);
        const volume = (0, volume_indicators_1.calcVolume)(candles);
        const patterns = (0, patterns_indicators_1.calcPatterns)(candles);
        const lastCandle = candles[candles.length - 1];
        const closePrice = lastCandle ? parseFloat(lastCandle.close) : null;
        const sr = (0, sr_indicators_1.calcSupportResistance)(candles);
        const riskHints = closePrice !== null ? (0, risk_indicators_1.calcRiskHints)(closePrice, volatility.atr) : null;
        return {
            trend,
            momentum,
            volatility,
            volume,
            patterns,
            closePrice,
            supportLevels: sr.support,
            resistanceLevels: sr.resistance,
            riskHints,
        };
    }
};
exports.IndicatorsService = IndicatorsService;
exports.IndicatorsService = IndicatorsService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], IndicatorsService);


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calcTrend = calcTrend;
const technicalindicators_1 = __webpack_require__(22);
function calcDEMA(values, period) {
    try {
        const ema1 = technicalindicators_1.EMA.calculate({ period, values });
        if (ema1.length < period)
            return null;
        const ema2 = technicalindicators_1.EMA.calculate({ period, values: ema1 });
        if (ema2.length === 0)
            return null;
        return 2 * ema1[ema1.length - 1] - ema2[ema2.length - 1];
    }
    catch {
        return null;
    }
}
function calcTEMA(values, period) {
    try {
        const ema1 = technicalindicators_1.EMA.calculate({ period, values });
        if (ema1.length < period)
            return null;
        const ema2 = technicalindicators_1.EMA.calculate({ period, values: ema1 });
        if (ema2.length < period)
            return null;
        const ema3 = technicalindicators_1.EMA.calculate({ period, values: ema2 });
        if (ema3.length === 0)
            return null;
        return 3 * ema1[ema1.length - 1] - 3 * ema2[ema2.length - 1] + ema3[ema3.length - 1];
    }
    catch {
        return null;
    }
}
function calcTrend(candles) {
    const reversed = [...candles].reverse();
    const closes = reversed.map(c => parseFloat(c.close));
    const highs = reversed.map(c => parseFloat(c.high));
    const lows = reversed.map(c => parseFloat(c.low));
    let ema9 = null;
    try {
        const r = technicalindicators_1.EMA.calculate({ period: 9, values: closes });
        ema9 = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        ema9 = null;
    }
    let ema21 = null;
    try {
        const r = technicalindicators_1.EMA.calculate({ period: 21, values: closes });
        ema21 = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        ema21 = null;
    }
    let ema50 = null;
    try {
        const r = technicalindicators_1.EMA.calculate({ period: 50, values: closes });
        ema50 = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        ema50 = null;
    }
    let ema200 = null;
    try {
        const r = technicalindicators_1.EMA.calculate({ period: 200, values: closes });
        ema200 = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        ema200 = null;
    }
    const dema9 = calcDEMA(closes, 9);
    const tema9 = calcTEMA(closes, 9);
    let macd = { value: null, signal: null, histogram: null };
    try {
        const r = technicalindicators_1.MACD.calculate({
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            values: closes,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });
        if (r.length > 0) {
            const last = r[r.length - 1];
            macd = {
                value: last.MACD ?? null,
                signal: last.signal ?? null,
                histogram: last.histogram ?? null,
            };
        }
    }
    catch {
        macd = { value: null, signal: null, histogram: null };
    }
    let adx = null;
    try {
        const r = technicalindicators_1.ADX.calculate({ period: 14, high: highs, low: lows, close: closes });
        adx = r.length > 0 ? r[r.length - 1].adx : null;
    }
    catch {
        adx = null;
    }
    let psar = null;
    try {
        const r = technicalindicators_1.PSAR.calculate({ step: 0.02, max: 0.2, high: highs, low: lows });
        psar = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        psar = null;
    }
    let ichimoku = { tenkan: null, kijun: null, senkouA: null, senkouB: null };
    try {
        const r = technicalindicators_1.IchimokuCloud.calculate({
            conversionPeriod: 9,
            basePeriod: 26,
            spanPeriod: 52,
            displacement: 26,
            high: highs,
            low: lows,
        });
        if (r.length > 0) {
            const last = r[r.length - 1];
            ichimoku = {
                tenkan: last.conversion ?? null,
                kijun: last.base ?? null,
                senkouA: last.spanA ?? null,
                senkouB: last.spanB ?? null,
            };
        }
    }
    catch {
        ichimoku = { tenkan: null, kijun: null, senkouA: null, senkouB: null };
    }
    return { ema9, ema21, ema50, ema200, dema9, tema9, macd, adx, psar, ichimoku };
}


/***/ }),
/* 22 */
/***/ ((module) => {

"use strict";
module.exports = require("technicalindicators");

/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calcMomentum = calcMomentum;
const technicalindicators_1 = __webpack_require__(22);
function calcMomentum(candles) {
    const reversed = [...candles].reverse();
    const closes = reversed.map(c => parseFloat(c.close));
    const highs = reversed.map(c => parseFloat(c.high));
    const lows = reversed.map(c => parseFloat(c.low));
    let rsi = null;
    try {
        const r = technicalindicators_1.RSI.calculate({ period: 14, values: closes });
        rsi = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        rsi = null;
    }
    let stochRsiK = null;
    let stochRsiD = null;
    try {
        const r = technicalindicators_1.StochasticRSI.calculate({
            rsiPeriod: 14,
            stochasticPeriod: 14,
            kPeriod: 3,
            dPeriod: 3,
            values: closes,
        });
        if (r.length > 0) {
            const last = r[r.length - 1];
            stochRsiK = last.k ?? null;
            stochRsiD = last.d ?? null;
        }
    }
    catch {
        stochRsiK = null;
        stochRsiD = null;
    }
    let stochK = null;
    let stochD = null;
    try {
        const r = technicalindicators_1.Stochastic.calculate({
            period: 14,
            signalPeriod: 3,
            high: highs,
            low: lows,
            close: closes,
        });
        if (r.length > 0) {
            const last = r[r.length - 1];
            stochK = last.k ?? null;
            stochD = last.d ?? null;
        }
    }
    catch {
        stochK = null;
        stochD = null;
    }
    let williamsR = null;
    try {
        const r = technicalindicators_1.WilliamsR.calculate({ period: 14, high: highs, low: lows, close: closes });
        williamsR = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        williamsR = null;
    }
    let cci = null;
    try {
        const r = technicalindicators_1.CCI.calculate({ period: 20, high: highs, low: lows, close: closes });
        cci = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        cci = null;
    }
    let roc = null;
    try {
        const r = technicalindicators_1.ROC.calculate({ period: 12, values: closes });
        roc = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        roc = null;
    }
    return { rsi, stochRsiK, stochRsiD, stochK, stochD, williamsR, cci, roc };
}


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calcVolatility = calcVolatility;
const technicalindicators_1 = __webpack_require__(22);
function calcVolatility(candles) {
    const reversed = [...candles].reverse();
    const closes = reversed.map(c => parseFloat(c.close));
    const highs = reversed.map(c => parseFloat(c.high));
    const lows = reversed.map(c => parseFloat(c.low));
    let bbUpper = null;
    let bbMiddle = null;
    let bbLower = null;
    try {
        const r = technicalindicators_1.BollingerBands.calculate({ period: 20, stdDev: 2, values: closes });
        if (r.length > 0) {
            const last = r[r.length - 1];
            bbUpper = last.upper ?? null;
            bbMiddle = last.middle ?? null;
            bbLower = last.lower ?? null;
        }
    }
    catch {
        bbUpper = null;
        bbMiddle = null;
        bbLower = null;
    }
    let atr = null;
    try {
        const r = technicalindicators_1.ATR.calculate({ period: 14, high: highs, low: lows, close: closes });
        atr = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        atr = null;
    }
    return { bbUpper, bbMiddle, bbLower, atr };
}


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calcVolume = calcVolume;
const technicalindicators_1 = __webpack_require__(22);
function calcVolume(candles) {
    const reversed = [...candles].reverse();
    const closes = reversed.map(c => parseFloat(c.close));
    const highs = reversed.map(c => parseFloat(c.high));
    const lows = reversed.map(c => parseFloat(c.low));
    const volumes = reversed.map(c => parseFloat(c.volume));
    let obv = null;
    try {
        const r = technicalindicators_1.OBV.calculate({ close: closes, volume: volumes });
        obv = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        obv = null;
    }
    let vwap = null;
    try {
        const r = technicalindicators_1.VWAP.calculate({ high: highs, low: lows, close: closes, volume: volumes });
        vwap = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        vwap = null;
    }
    let mfi = null;
    try {
        const r = technicalindicators_1.MFI.calculate({ period: 14, high: highs, low: lows, close: closes, volume: volumes });
        mfi = r.length > 0 ? r[r.length - 1] : null;
    }
    catch {
        mfi = null;
    }
    let cmf = null;
    try {
        const period = 20;
        if (closes.length >= period) {
            let sumMfvVol = 0;
            let sumVol = 0;
            for (let i = closes.length - period; i < closes.length; i++) {
                const range = highs[i] - lows[i];
                const mfv = range !== 0
                    ? ((closes[i] - lows[i]) - (highs[i] - closes[i])) / range
                    : 0;
                sumMfvVol += mfv * volumes[i];
                sumVol += volumes[i];
            }
            cmf = sumVol !== 0 ? sumMfvVol / sumVol : null;
        }
    }
    catch {
        cmf = null;
    }
    return { obv, vwap, mfi, cmf };
}


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calcPatterns = calcPatterns;
function calcPatterns(candles) {
    // candles are DESC (newest first), take last 3 most recent
    const recent = candles.slice(0, 3).reverse(); // chronological order: [oldest, middle, newest]
    const result = {
        doji: false,
        hammer: false,
        bullishEngulfing: false,
        bearishEngulfing: false,
        morningStar: false,
        eveningStar: false,
    };
    if (recent.length === 0)
        return result;
    const parse = (c) => ({
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
    });
    const curr = parse(recent[recent.length - 1]);
    const prev = recent.length >= 2 ? parse(recent[recent.length - 2]) : null;
    const first = recent.length >= 3 ? parse(recent[0]) : null;
    // Doji: body < 10% of range
    const currRange = curr.high - curr.low;
    const currBody = Math.abs(curr.open - curr.close);
    if (currRange > 0 && currBody / currRange < 0.1) {
        result.doji = true;
    }
    // Hammer: lower shadow >= 2 * body, upper shadow <= 0.1 * body, bullish context (close > open)
    if (currBody > 0) {
        const upperShadow = curr.high - Math.max(curr.open, curr.close);
        const lowerShadow = Math.min(curr.open, curr.close) - curr.low;
        if (lowerShadow >= 2 * currBody && upperShadow <= 0.1 * currBody && curr.close > curr.open) {
            result.hammer = true;
        }
    }
    if (prev) {
        const prevBody = Math.abs(prev.open - prev.close);
        const prevBullish = prev.close > prev.open;
        const prevBearish = prev.close < prev.open;
        const currBullish = curr.close > curr.open;
        const currBearish = curr.close < curr.open;
        // Bullish Engulfing: current bullish, completely engulfs previous bearish
        if (currBullish && prevBearish && curr.open < prev.close && curr.close > prev.open) {
            result.bullishEngulfing = true;
        }
        // Bearish Engulfing: current bearish, completely engulfs previous bullish
        if (currBearish && prevBullish && curr.open > prev.close && curr.close < prev.open) {
            result.bearishEngulfing = true;
        }
        // Morning Star: 3-candle (bearish, small body, bullish)
        if (first) {
            const firstBearish = first.close < first.open;
            const firstBody = Math.abs(first.open - first.close);
            const smallBody = prevBody < firstBody * 0.3;
            if (firstBearish && smallBody && currBullish) {
                result.morningStar = true;
            }
            // Evening Star: 3-candle (bullish, small body, bearish)
            const firstBullish = first.close > first.open;
            if (firstBullish && smallBody && currBearish) {
                result.eveningStar = true;
            }
        }
    }
    return result;
}


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calcSupportResistance = calcSupportResistance;
const MIN_CANDLES = 50;
const WINDOW = 10;
const MAX_LEVELS = 3;
function calcSupportResistance(candles) {
    if (candles.length < MIN_CANDLES) {
        return { support: [], resistance: [] };
    }
    const highs = candles.map(c => parseFloat(c.high));
    const lows = candles.map(c => parseFloat(c.low));
    const closePrice = parseFloat(candles[candles.length - 1].close);
    const pivotHighs = [];
    const pivotLows = [];
    for (let i = WINDOW; i < candles.length - WINDOW; i++) {
        const high = highs[i];
        const low = lows[i];
        const isHighest = highs.slice(i - WINDOW, i).every(h => h <= high) &&
            highs.slice(i + 1, i + WINDOW + 1).every(h => h <= high);
        if (isHighest)
            pivotHighs.push(high);
        const isLowest = lows.slice(i - WINDOW, i).every(l => l >= low) &&
            lows.slice(i + 1, i + WINDOW + 1).every(l => l >= low);
        if (isLowest)
            pivotLows.push(low);
    }
    // Support: pivot lows below current price, sorted by distance ascending
    const support = pivotLows
        .filter(l => l < closePrice)
        .sort((a, b) => Math.abs(a - closePrice) - Math.abs(b - closePrice))
        .slice(0, MAX_LEVELS);
    // Resistance: pivot highs above current price, sorted by distance ascending
    const resistance = pivotHighs
        .filter(h => h > closePrice)
        .sort((a, b) => Math.abs(a - closePrice) - Math.abs(b - closePrice))
        .slice(0, MAX_LEVELS);
    return { support, resistance };
}


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calcRiskHints = calcRiskHints;
const SL_MULTIPLIER = 1.5;
const TP_MULTIPLIER = 3.0;
function calcRiskHints(closePrice, atr) {
    if (atr === null || atr <= 0)
        return null;
    const stopLoss = closePrice - atr * SL_MULTIPLIER;
    const takeProfit = closePrice + atr * TP_MULTIPLIER;
    const riskRewardRatio = (takeProfit - closePrice) / (closePrice - stopLoss);
    return { stopLoss, takeProfit, riskRewardRatio };
}


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyzerModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const rule_engine_service_1 = __webpack_require__(30);
const deepseek_service_1 = __webpack_require__(31);
const analyzer_service_1 = __webpack_require__(38);
const indicators_module_1 = __webpack_require__(19);
const ohlcv_module_1 = __webpack_require__(10);
const market_module_1 = __webpack_require__(40);
let AnalyzerModule = class AnalyzerModule {
};
exports.AnalyzerModule = AnalyzerModule;
exports.AnalyzerModule = AnalyzerModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [indicators_module_1.IndicatorsModule, ohlcv_module_1.OhlcvModule, market_module_1.MarketModule],
        providers: [rule_engine_service_1.RuleEngineService, deepseek_service_1.DeepSeekService, analyzer_service_1.AnalyzerService],
        exports: [analyzer_service_1.AnalyzerService],
    })
], AnalyzerModule);


/***/ }),
/* 30 */
/***/ (() => {

throw new Error("Module parse failed: Unexpected token (20:1)\nFile was processed with these loaders:\n * ../../../node_modules/ts-loader/index.js\nYou may need an additional loader to handle the result of these loaders.\n|     (0, common_1.Injectable)()\n| ], RuleEngineService);\n>  !== null;\n| {\n|     if (momentum.rsi < 30)");

/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var DeepSeekService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeepSeekService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(5);
const openai_1 = tslib_1.__importDefault(__webpack_require__(32));
const shared_types_1 = __webpack_require__(33);
const prompt_builder_1 = __webpack_require__(37);
let DeepSeekService = DeepSeekService_1 = class DeepSeekService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DeepSeekService_1.name);
        this.client = new openai_1.default({
            apiKey: this.configService.get('DEEPSEEK_API_KEY') ?? '',
            baseURL: 'https://api.deepseek.com',
        });
    }
    async analyze(data, marketContext) {
        try {
            const prompt = (0, prompt_builder_1.buildPrompt)(data, marketContext);
            const response = await this.client.chat.completions.create({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
            });
            const raw = response.choices[0]?.message?.content ?? '';
            const content = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            const parsed = JSON.parse(content);
            const signal = parsed.signal === 'BUY'
                ? shared_types_1.SignalType.BUY
                : parsed.signal === 'SELL'
                    ? shared_types_1.SignalType.SELL
                    : shared_types_1.SignalType.HOLD;
            return {
                signal,
                confidence: Math.min(Math.max(parsed.confidence ?? 0, 0), 1),
                reasoning: parsed.reasoning ?? '',
            };
        }
        catch (error) {
            this.logger.error('DeepSeek API error', error);
            return { signal: shared_types_1.SignalType.HOLD, confidence: 0, reasoning: '' };
        }
    }
};
exports.DeepSeekService = DeepSeekService;
exports.DeepSeekService = DeepSeekService = DeepSeekService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], DeepSeekService);


/***/ }),
/* 32 */
/***/ ((module) => {

"use strict";
module.exports = require("openai");

/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(4);
tslib_1.__exportStar(__webpack_require__(34), exports);
tslib_1.__exportStar(__webpack_require__(35), exports);
tslib_1.__exportStar(__webpack_require__(36), exports);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Timeframe = exports.SignalType = void 0;
var SignalType;
(function (SignalType) {
    SignalType["BUY"] = "BUY";
    SignalType["SELL"] = "SELL";
    SignalType["HOLD"] = "HOLD";
})(SignalType || (exports.SignalType = SignalType = {}));
var Timeframe;
(function (Timeframe) {
    Timeframe["ONE_MINUTE"] = "1m";
    Timeframe["FIVE_MINUTES"] = "5m";
    Timeframe["FIFTEEN_MINUTES"] = "15m";
    Timeframe["ONE_HOUR"] = "1h";
    Timeframe["FOUR_HOURS"] = "4h";
    Timeframe["ONE_DAY"] = "1d";
})(Timeframe || (exports.Timeframe = Timeframe = {}));


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buildPrompt = buildPrompt;
function buildPrompt(data, marketContext) {
    const lines = ['Multi-timeframe technical analysis for ETH/USDT:\n'];
    for (const [timeframe, indicators] of data.entries()) {
        const { trend, momentum, volatility, volume, patterns, closePrice, supportLevels, resistanceLevels, riskHints } = indicators;
        lines.push(`## Timeframe: ${timeframe}`);
        if (closePrice !== null && closePrice !== undefined) {
            lines.push(`Close Price: ${closePrice}`);
        }
        // Trend
        lines.push(`Trend — EMA9: ${trend.ema9 ?? 'N/A'}, EMA21: ${trend.ema21 ?? 'N/A'}, EMA50: ${trend.ema50 ?? 'N/A'}, EMA200: ${trend.ema200 ?? 'N/A'}`);
        lines.push(`MACD: ${trend.macd.value ?? 'N/A'} | Signal: ${trend.macd.signal ?? 'N/A'} | Histogram: ${trend.macd.histogram ?? 'N/A'}`);
        lines.push(`ADX: ${trend.adx ?? 'N/A'}, PSAR: ${trend.psar ?? 'N/A'}`);
        lines.push(`Ichimoku — Tenkan: ${trend.ichimoku.tenkan ?? 'N/A'}, Kijun: ${trend.ichimoku.kijun ?? 'N/A'}, SenkouA: ${trend.ichimoku.senkouA ?? 'N/A'}, SenkouB: ${trend.ichimoku.senkouB ?? 'N/A'}`);
        // Support/Resistance
        if (supportLevels?.length > 0 || resistanceLevels?.length > 0) {
            lines.push(`Support Levels: ${supportLevels?.join(', ') || 'N/A'}`);
            lines.push(`Resistance Levels: ${resistanceLevels?.join(', ') || 'N/A'}`);
        }
        // Momentum
        lines.push(`Momentum — RSI: ${momentum.rsi ?? 'N/A'}, StochRSI K/D: ${momentum.stochRsiK ?? 'N/A'}/${momentum.stochRsiD ?? 'N/A'}`);
        lines.push(`Williams %R: ${momentum.williamsR ?? 'N/A'}, CCI: ${momentum.cci ?? 'N/A'}, ROC: ${momentum.roc ?? 'N/A'}`);
        // Volatility
        lines.push(`Bollinger Bands — Upper: ${volatility.bbUpper ?? 'N/A'}, Mid: ${volatility.bbMiddle ?? 'N/A'}, Lower: ${volatility.bbLower ?? 'N/A'}, ATR: ${volatility.atr ?? 'N/A'}`);
        // Volume
        lines.push(`Volume — OBV: ${volume.obv ?? 'N/A'}, VWAP: ${volume.vwap ?? 'N/A'}, MFI: ${volume.mfi ?? 'N/A'}, CMF: ${volume.cmf ?? 'N/A'}`);
        // Patterns
        const activePatterns = [];
        if (patterns.doji)
            activePatterns.push('Doji');
        if (patterns.hammer)
            activePatterns.push('Hammer');
        if (patterns.bullishEngulfing)
            activePatterns.push('Bullish Engulfing');
        if (patterns.bearishEngulfing)
            activePatterns.push('Bearish Engulfing');
        if (patterns.morningStar)
            activePatterns.push('Morning Star');
        if (patterns.eveningStar)
            activePatterns.push('Evening Star');
        lines.push(`Patterns: ${activePatterns.length > 0 ? activePatterns.join(', ') : 'None'}`);
        // Risk Management hints
        if (riskHints) {
            lines.push(`Risk Management — Stop Loss: ${riskHints.stopLoss.toFixed(2)}, Take Profit: ${riskHints.takeProfit.toFixed(2)}, R/R: 1:${riskHints.riskRewardRatio.toFixed(1)}`);
        }
        lines.push('');
    }
    // Market Context section
    if (marketContext) {
        lines.push('## Market Context');
        if (marketContext.fearGreedIndex) {
            lines.push(`Fear & Greed Index: ${marketContext.fearGreedIndex.value} (${marketContext.fearGreedIndex.label})`);
        }
        if (marketContext.btcDominance !== null && marketContext.btcDominance !== undefined) {
            lines.push(`BTC Dominance: ${marketContext.btcDominance.toFixed(1)}%`);
        }
        if (marketContext.fundingRate !== null && marketContext.fundingRate !== undefined) {
            lines.push(`ETH Funding Rate: ${(marketContext.fundingRate * 100).toFixed(4)}%`);
        }
        lines.push('');
    }
    lines.push('Based on this multi-timeframe analysis, provide a trading signal for ETH/USDT. Consider the market context and risk management levels. Respond ONLY with valid JSON: {"signal": "BUY"|"SELL"|"HOLD", "confidence": 0.0-1.0, "reasoning": "brief explanation including stop-loss and take-profit confirmation"}');
    return lines.join('\n');
}


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyzerService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const shared_types_1 = __webpack_require__(33);
const ohlcv_service_1 = __webpack_require__(13);
const indicators_service_1 = __webpack_require__(20);
const rule_engine_service_1 = __webpack_require__(30);
const deepseek_service_1 = __webpack_require__(31);
const market_context_service_1 = __webpack_require__(39);
let AnalyzerService = class AnalyzerService {
    constructor(ohlcvService, indicatorsService, ruleEngineService, deepSeekService, marketContextService) {
        this.ohlcvService = ohlcvService;
        this.indicatorsService = indicatorsService;
        this.ruleEngineService = ruleEngineService;
        this.deepSeekService = deepSeekService;
        this.marketContextService = marketContextService;
    }
    async analyzeTimeframe(symbol, timeframe) {
        // 1. Get 500 candles
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, 500);
        // 2. Calculate indicators
        const indicators = this.indicatorsService.calculate(candles);
        // 3. Build multi-timeframe data map
        const data = new Map([[timeframe, indicators]]);
        // 4. Fetch market context and run rule engine + deepseek in parallel
        const [ruleResult, deepseekResult] = await Promise.all([
            Promise.resolve(this.ruleEngineService.analyze(indicators)),
            (async () => {
                const marketContext = await this.marketContextService.getContext();
                return this.deepSeekService.analyze(data, marketContext);
            })(),
        ]);
        // 5. Combine confidence: rule * 0.4 + deepseek * 0.6
        const confidence = ruleResult.confidence * 0.4 + deepseekResult.confidence * 0.6;
        // 6. Determine final signal via weighted score
        const signalToScore = (s) => s === shared_types_1.SignalType.BUY ? 1 : s === shared_types_1.SignalType.SELL ? -1 : 0;
        const weightedScore = signalToScore(ruleResult.signal) * 0.4 +
            signalToScore(deepseekResult.signal) * 0.6;
        let signal;
        if (weightedScore > 0.2)
            signal = shared_types_1.SignalType.BUY;
        else if (weightedScore < -0.2)
            signal = shared_types_1.SignalType.SELL;
        else
            signal = shared_types_1.SignalType.HOLD;
        // 7. Return SignalResult (without id/createdAt)
        return {
            symbol,
            timeframe: timeframe,
            signal,
            confidence,
            ruleSignal: ruleResult.signal,
            deepseekSignal: deepseekResult.signal,
            deepseekReasoning: deepseekResult.reasoning,
            indicators,
        };
    }
};
exports.AnalyzerService = AnalyzerService;
exports.AnalyzerService = AnalyzerService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof ohlcv_service_1.OhlcvService !== "undefined" && ohlcv_service_1.OhlcvService) === "function" ? _a : Object, typeof (_b = typeof indicators_service_1.IndicatorsService !== "undefined" && indicators_service_1.IndicatorsService) === "function" ? _b : Object, typeof (_c = typeof rule_engine_service_1.RuleEngineService !== "undefined" && rule_engine_service_1.RuleEngineService) === "function" ? _c : Object, typeof (_d = typeof deepseek_service_1.DeepSeekService !== "undefined" && deepseek_service_1.DeepSeekService) === "function" ? _d : Object, typeof (_e = typeof market_context_service_1.MarketContextService !== "undefined" && market_context_service_1.MarketContextService) === "function" ? _e : Object])
], AnalyzerService);


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var MarketContextService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarketContextService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const axios_1 = tslib_1.__importDefault(__webpack_require__(16));
function getFearGreedLabel(value) {
    if (value <= 24)
        return 'Extreme Fear';
    if (value <= 44)
        return 'Fear';
    if (value <= 55)
        return 'Neutral';
    if (value <= 75)
        return 'Greed';
    return 'Extreme Greed';
}
let MarketContextService = MarketContextService_1 = class MarketContextService {
    constructor() {
        this.logger = new common_1.Logger(MarketContextService_1.name);
        this.fearGreedCache = null;
        this.btcDominanceCache = null;
        this.fundingRateCache = null;
        this.FEAR_GREED_TTL = 60 * 60 * 1000; // 1 hour
        this.BTC_DOMINANCE_TTL = 5 * 60 * 1000; // 5 minutes
        this.FUNDING_RATE_TTL = 60 * 60 * 1000; // 1 hour
    }
    async getFearGreedIndex() {
        const now = Date.now();
        if (this.fearGreedCache && this.fearGreedCache.expiresAt > now) {
            return this.fearGreedCache.value;
        }
        try {
            const res = await axios_1.default.get('https://api.alternative.me/fng/?limit=1', { timeout: 5000 });
            const raw = res.data?.data?.[0];
            const value = parseInt(raw?.value ?? '0', 10);
            const data = { value, label: getFearGreedLabel(value) };
            this.fearGreedCache = { value: data, expiresAt: now + this.FEAR_GREED_TTL };
            return data;
        }
        catch (err) {
            this.logger.error('Failed to fetch Fear & Greed Index', err);
            this.fearGreedCache = { value: null, expiresAt: now + this.FEAR_GREED_TTL };
            return null;
        }
    }
    async getBtcDominance() {
        const now = Date.now();
        if (this.btcDominanceCache && this.btcDominanceCache.expiresAt > now) {
            return this.btcDominanceCache.value;
        }
        try {
            const res = await axios_1.default.get('https://api.coingecko.com/api/v3/global', { timeout: 5000 });
            const dominance = res.data?.data?.market_cap_percentage?.btc ?? null;
            this.btcDominanceCache = { value: dominance, expiresAt: now + this.BTC_DOMINANCE_TTL };
            return dominance;
        }
        catch (err) {
            this.logger.error('Failed to fetch BTC dominance', err);
            this.btcDominanceCache = { value: null, expiresAt: now + this.BTC_DOMINANCE_TTL };
            return null;
        }
    }
    async getFundingRate() {
        const now = Date.now();
        if (this.fundingRateCache && this.fundingRateCache.expiresAt > now) {
            return this.fundingRateCache.value;
        }
        try {
            const res = await axios_1.default.get('https://fapi.binance.com/fapi/v1/fundingRate', {
                params: { symbol: 'ETHUSDT', limit: 1 },
                timeout: 5000,
            });
            const rate = parseFloat(res.data?.[0]?.fundingRate ?? 'NaN');
            const value = isNaN(rate) ? null : rate;
            this.fundingRateCache = { value, expiresAt: now + this.FUNDING_RATE_TTL };
            return value;
        }
        catch (err) {
            this.logger.error('Failed to fetch funding rate', err);
            this.fundingRateCache = { value: null, expiresAt: now + this.FUNDING_RATE_TTL };
            return null;
        }
    }
    async getContext() {
        const [fearGreedIndex, btcDominance, fundingRate] = await Promise.all([
            this.getFearGreedIndex(),
            this.getBtcDominance(),
            this.getFundingRate(),
        ]);
        return { fearGreedIndex, btcDominance, fundingRate };
    }
};
exports.MarketContextService = MarketContextService;
exports.MarketContextService = MarketContextService = MarketContextService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], MarketContextService);


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarketModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const market_context_service_1 = __webpack_require__(39);
const volume_profile_service_1 = __webpack_require__(41);
const market_controller_1 = __webpack_require__(42);
const ohlcv_module_1 = __webpack_require__(10);
let MarketModule = class MarketModule {
};
exports.MarketModule = MarketModule;
exports.MarketModule = MarketModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [ohlcv_module_1.OhlcvModule],
        controllers: [market_controller_1.MarketController],
        providers: [market_context_service_1.MarketContextService, volume_profile_service_1.VolumeProfileService],
        exports: [market_context_service_1.MarketContextService, volume_profile_service_1.VolumeProfileService],
    })
], MarketModule);


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VolumeProfileService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const BUCKET_COUNT = 20;
let VolumeProfileService = class VolumeProfileService {
    calculate(candles) {
        if (candles.length === 0)
            return [];
        const highs = candles.map(c => parseFloat(c.high));
        const lows = candles.map(c => parseFloat(c.low));
        const volumes = candles.map(c => parseFloat(c.volume));
        const minPrice = Math.min(...lows);
        const maxPrice = Math.max(...highs);
        const range = maxPrice - minPrice;
        if (range === 0) {
            return [{ priceLevel: minPrice, volume: volumes.reduce((a, b) => a + b, 0) }];
        }
        const bucketSize = range / BUCKET_COUNT;
        const buckets = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
            priceLevel: minPrice + (i + 0.5) * bucketSize,
            volume: 0,
        }));
        for (let i = 0; i < candles.length; i++) {
            const midPrice = (highs[i] + lows[i]) / 2;
            const bucketIndex = Math.min(Math.floor((midPrice - minPrice) / bucketSize), BUCKET_COUNT - 1);
            buckets[bucketIndex].volume += volumes[i];
        }
        return buckets;
    }
};
exports.VolumeProfileService = VolumeProfileService;
exports.VolumeProfileService = VolumeProfileService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], VolumeProfileService);


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var MarketController_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarketController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const axios_1 = tslib_1.__importDefault(__webpack_require__(16));
const market_context_service_1 = __webpack_require__(39);
const volume_profile_service_1 = __webpack_require__(41);
const ohlcv_service_1 = __webpack_require__(13);
let MarketController = MarketController_1 = class MarketController {
    constructor(marketContextService, volumeProfileService, ohlcvService) {
        this.marketContextService = marketContextService;
        this.volumeProfileService = volumeProfileService;
        this.ohlcvService = ohlcvService;
        this.logger = new common_1.Logger(MarketController_1.name);
    }
    async getContext() {
        return this.marketContextService.getContext();
    }
    async getOrderBook(symbol = 'ETHUSDT') {
        try {
            const res = await axios_1.default.get('https://api.binance.com/api/v3/depth', {
                params: { symbol, limit: 20 },
                timeout: 5000,
            });
            const bids = res.data.bids.map(([price, qty]) => ({
                price: parseFloat(price),
                quantity: parseFloat(qty),
            }));
            const asks = res.data.asks.map(([price, qty]) => ({
                price: parseFloat(price),
                quantity: parseFloat(qty),
            }));
            const spread = asks[0].price - bids[0].price;
            const spreadPercent = (spread / bids[0].price) * 100;
            return { bids, asks, spread, spreadPercent };
        }
        catch (err) {
            this.logger.error(`Failed to fetch order book for ${symbol}`, err);
            throw new common_1.ServiceUnavailableException(`Failed to fetch order book: ${err.message}`);
        }
    }
    async getVolumeProfile(symbol = 'ETHUSDT', timeframe = '1h') {
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, 200);
        return this.volumeProfileService.calculate(candles);
    }
};
exports.MarketController = MarketController;
tslib_1.__decorate([
    (0, common_1.Get)('context'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MarketController.prototype, "getContext", null);
tslib_1.__decorate([
    (0, common_1.Get)('orderbook'),
    tslib_1.__param(0, (0, common_1.Query)('symbol')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], MarketController.prototype, "getOrderBook", null);
tslib_1.__decorate([
    (0, common_1.Get)('volume-profile'),
    tslib_1.__param(0, (0, common_1.Query)('symbol')),
    tslib_1.__param(1, (0, common_1.Query)('timeframe')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MarketController.prototype, "getVolumeProfile", null);
exports.MarketController = MarketController = MarketController_1 = tslib_1.__decorate([
    (0, common_1.Controller)('market'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof market_context_service_1.MarketContextService !== "undefined" && market_context_service_1.MarketContextService) === "function" ? _a : Object, typeof (_b = typeof volume_profile_service_1.VolumeProfileService !== "undefined" && volume_profile_service_1.VolumeProfileService) === "function" ? _b : Object, typeof (_c = typeof ohlcv_service_1.OhlcvService !== "undefined" && ohlcv_service_1.OhlcvService) === "function" ? _c : Object])
], MarketController);


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SignalsModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const signals_entity_1 = __webpack_require__(44);
const signals_service_1 = __webpack_require__(45);
const signals_controller_1 = __webpack_require__(46);
const signals_gateway_1 = __webpack_require__(48);
const signals_scheduler_1 = __webpack_require__(51);
const backtesting_service_1 = __webpack_require__(47);
const analyzer_module_1 = __webpack_require__(29);
const ohlcv_module_1 = __webpack_require__(10);
let SignalsModule = class SignalsModule {
};
exports.SignalsModule = SignalsModule;
exports.SignalsModule = SignalsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([signals_entity_1.SignalEntity]), analyzer_module_1.AnalyzerModule, ohlcv_module_1.OhlcvModule],
        providers: [signals_service_1.SignalsService, signals_gateway_1.SignalsGateway, signals_scheduler_1.SignalsScheduler, backtesting_service_1.BacktestingService],
        controllers: [signals_controller_1.SignalsController],
        exports: [signals_service_1.SignalsService, signals_gateway_1.SignalsGateway],
    })
], SignalsModule);


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SignalEntity = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_types_1 = __webpack_require__(33);
let SignalEntity = class SignalEntity {
};
exports.SignalEntity = SignalEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], SignalEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    tslib_1.__metadata("design:type", String)
], SignalEntity.prototype, "symbol", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ length: 5 }),
    tslib_1.__metadata("design:type", String)
], SignalEntity.prototype, "timeframe", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 4 }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_types_1.SignalType !== "undefined" && shared_types_1.SignalType) === "function" ? _a : Object)
], SignalEntity.prototype, "signal", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2 }),
    tslib_1.__metadata("design:type", Number)
], SignalEntity.prototype, "confidence", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 4, nullable: true }),
    tslib_1.__metadata("design:type", typeof (_b = typeof shared_types_1.SignalType !== "undefined" && shared_types_1.SignalType) === "function" ? _b : Object)
], SignalEntity.prototype, "ruleSignal", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 4, nullable: true }),
    tslib_1.__metadata("design:type", typeof (_c = typeof shared_types_1.SignalType !== "undefined" && shared_types_1.SignalType) === "function" ? _c : Object)
], SignalEntity.prototype, "deepseekSignal", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], SignalEntity.prototype, "deepseekReasoning", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof shared_types_1.AllIndicators !== "undefined" && shared_types_1.AllIndicators) === "function" ? _d : Object)
], SignalEntity.prototype, "indicators", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], SignalEntity.prototype, "createdAt", void 0);
exports.SignalEntity = SignalEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('signals'),
    (0, typeorm_1.Index)(['symbol', 'timeframe', 'createdAt'])
], SignalEntity);


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SignalsService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const typeorm_2 = __webpack_require__(12);
const signals_entity_1 = __webpack_require__(44);
let SignalsService = class SignalsService {
    constructor(signalRepository) {
        this.signalRepository = signalRepository;
    }
    async saveIfChanged(result) {
        const latest = await this.getLatest(result.symbol, result.timeframe);
        if (latest && latest.signal === result.signal) {
            return { saved: false, signal: latest };
        }
        const entity = this.signalRepository.create({
            symbol: result.symbol,
            timeframe: result.timeframe,
            signal: result.signal,
            confidence: result.confidence,
            ruleSignal: result.ruleSignal,
            deepseekSignal: result.deepseekSignal,
            deepseekReasoning: result.deepseekReasoning,
            indicators: result.indicators,
        });
        const saved = await this.signalRepository.save(entity);
        await this.pruneOldSignals(result.symbol, result.timeframe);
        return { saved: true, signal: saved };
    }
    async getLatest(symbol, timeframe) {
        return this.signalRepository.findOne({
            where: { symbol, timeframe },
            order: { createdAt: 'DESC' },
        });
    }
    async getHistory(symbol, timeframe, limit, offset = 0) {
        return this.signalRepository.find({
            where: { symbol, timeframe },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async pruneOldSignals(symbol, timeframe, maxCount = 200) {
        const count = await this.signalRepository.count({ where: { symbol, timeframe } });
        if (count <= maxCount)
            return;
        const excess = count - maxCount;
        const oldest = await this.signalRepository.find({
            where: { symbol, timeframe },
            order: { createdAt: 'ASC' },
            take: excess,
        });
        if (oldest.length > 0) {
            await this.signalRepository.remove(oldest);
        }
    }
};
exports.SignalsService = SignalsService;
exports.SignalsService = SignalsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(signals_entity_1.SignalEntity)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], SignalsService);


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SignalsController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const signals_service_1 = __webpack_require__(45);
const analyzer_service_1 = __webpack_require__(38);
const ohlcv_service_1 = __webpack_require__(13);
const backtesting_service_1 = __webpack_require__(47);
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];
let SignalsController = class SignalsController {
    constructor(signalsService, analyzerService, ohlcvService, backtestingService) {
        this.signalsService = signalsService;
        this.analyzerService = analyzerService;
        this.ohlcvService = ohlcvService;
        this.backtestingService = backtestingService;
    }
    async generate(body) {
        const result = await this.analyzerService.analyzeTimeframe(body.symbol, body.timeframe);
        const { signal } = await this.signalsService.saveIfChanged(result);
        return signal;
    }
    async getLatest(symbol, timeframe) {
        return this.signalsService.getLatest(symbol, timeframe);
    }
    async getHistory(symbol, timeframe, limit = 50) {
        return this.signalsService.getHistory(symbol, timeframe, Number(limit));
    }
    async getCandles(symbol = 'ETHUSDT', timeframe = '1h', limit = 200) {
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, Number(limit));
        // Return sorted ascending by openTime for chart rendering
        return [...candles].sort((a, b) => Number(a.openTime) - Number(b.openTime));
    }
    async getConfluence(symbol = 'ETHUSDT') {
        const results = await Promise.all(TIMEFRAMES.map(tf => this.signalsService.getLatest(symbol, tf)));
        return results.map((signal, i) => signal ?? { symbol, timeframe: TIMEFRAMES[i], signal: null });
    }
    async getBacktest(symbol = 'ETHUSDT', timeframe = '1h') {
        return this.backtestingService.backtest(symbol, timeframe);
    }
};
exports.SignalsController = SignalsController;
tslib_1.__decorate([
    (0, common_1.Post)('generate'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SignalsController.prototype, "generate", null);
tslib_1.__decorate([
    (0, common_1.Get)('latest'),
    tslib_1.__param(0, (0, common_1.Query)('symbol')),
    tslib_1.__param(1, (0, common_1.Query)('timeframe')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], SignalsController.prototype, "getLatest", null);
tslib_1.__decorate([
    (0, common_1.Get)('history'),
    tslib_1.__param(0, (0, common_1.Query)('symbol')),
    tslib_1.__param(1, (0, common_1.Query)('timeframe')),
    tslib_1.__param(2, (0, common_1.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SignalsController.prototype, "getHistory", null);
tslib_1.__decorate([
    (0, common_1.Get)('candles'),
    tslib_1.__param(0, (0, common_1.Query)('symbol')),
    tslib_1.__param(1, (0, common_1.Query)('timeframe')),
    tslib_1.__param(2, (0, common_1.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SignalsController.prototype, "getCandles", null);
tslib_1.__decorate([
    (0, common_1.Get)('confluence'),
    tslib_1.__param(0, (0, common_1.Query)('symbol')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SignalsController.prototype, "getConfluence", null);
tslib_1.__decorate([
    (0, common_1.Get)('backtest'),
    tslib_1.__param(0, (0, common_1.Query)('symbol')),
    tslib_1.__param(1, (0, common_1.Query)('timeframe')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SignalsController.prototype, "getBacktest", null);
exports.SignalsController = SignalsController = tslib_1.__decorate([
    (0, common_1.Controller)('signals'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof signals_service_1.SignalsService !== "undefined" && signals_service_1.SignalsService) === "function" ? _a : Object, typeof (_b = typeof analyzer_service_1.AnalyzerService !== "undefined" && analyzer_service_1.AnalyzerService) === "function" ? _b : Object, typeof (_c = typeof ohlcv_service_1.OhlcvService !== "undefined" && ohlcv_service_1.OhlcvService) === "function" ? _c : Object, typeof (_d = typeof backtesting_service_1.BacktestingService !== "undefined" && backtesting_service_1.BacktestingService) === "function" ? _d : Object])
], SignalsController);


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BacktestingService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const typeorm_2 = __webpack_require__(12);
const shared_types_1 = __webpack_require__(33);
const signals_entity_1 = __webpack_require__(44);
const ohlcv_service_1 = __webpack_require__(13);
const MIN_SIGNALS = 10;
let BacktestingService = class BacktestingService {
    constructor(signalRepository, ohlcvService) {
        this.signalRepository = signalRepository;
        this.ohlcvService = ohlcvService;
    }
    async backtest(symbol, timeframe) {
        const signals = await this.signalRepository.find({
            where: { symbol, timeframe },
            order: { createdAt: 'ASC' },
        });
        const tradingSignals = signals.filter(s => s.signal === shared_types_1.SignalType.BUY || s.signal === shared_types_1.SignalType.SELL);
        if (tradingSignals.length < MIN_SIGNALS) {
            return {
                symbol,
                timeframe,
                totalSignals: tradingSignals.length,
                winCount: 0,
                lossCount: 0,
                ruleWinRate: null,
                deepseekWinRate: null,
                insufficientData: true,
            };
        }
        const candles = await this.ohlcvService.getCandles(symbol, timeframe, 1000);
        const candleMap = new Map(candles.map(c => [Number(c.openTime), parseFloat(c.close)]));
        const sortedTimes = [...candleMap.keys()].sort((a, b) => a - b);
        let ruleWins = 0;
        let ruleLosses = 0;
        let aiWins = 0;
        let aiLosses = 0;
        for (const signal of tradingSignals) {
            const signalTime = new Date(signal.createdAt).getTime();
            // Find the next candle after signal time
            const nextTime = sortedTimes.find(t => t > signalTime);
            if (!nextTime)
                continue;
            const nextClose = candleMap.get(nextTime);
            const signalClose = signal.indicators?.closePrice;
            if (!nextClose || !signalClose)
                continue;
            const priceWentUp = nextClose > signalClose;
            // Rule signal win/loss
            if (signal.ruleSignal === shared_types_1.SignalType.BUY || signal.ruleSignal === shared_types_1.SignalType.SELL) {
                const ruleWin = signal.ruleSignal === shared_types_1.SignalType.BUY ? priceWentUp : !priceWentUp;
                if (ruleWin)
                    ruleWins++;
                else
                    ruleLosses++;
            }
            // AI signal win/loss
            if (signal.deepseekSignal === shared_types_1.SignalType.BUY || signal.deepseekSignal === shared_types_1.SignalType.SELL) {
                const aiWin = signal.deepseekSignal === shared_types_1.SignalType.BUY ? priceWentUp : !priceWentUp;
                if (aiWin)
                    aiWins++;
                else
                    aiLosses++;
            }
        }
        const ruleTotal = ruleWins + ruleLosses;
        const aiTotal = aiWins + aiLosses;
        return {
            symbol,
            timeframe,
            totalSignals: tradingSignals.length,
            winCount: ruleWins,
            lossCount: ruleLosses,
            ruleWinRate: ruleTotal >= MIN_SIGNALS ? ruleWins / ruleTotal : null,
            deepseekWinRate: aiTotal >= MIN_SIGNALS ? aiWins / aiTotal : null,
            insufficientData: false,
        };
    }
};
exports.BacktestingService = BacktestingService;
exports.BacktestingService = BacktestingService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(signals_entity_1.SignalEntity)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof ohlcv_service_1.OhlcvService !== "undefined" && ohlcv_service_1.OhlcvService) === "function" ? _b : Object])
], BacktestingService);


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var SignalsGateway_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SignalsGateway = void 0;
const tslib_1 = __webpack_require__(4);
const websockets_1 = __webpack_require__(49);
const socket_io_1 = __webpack_require__(50);
const common_1 = __webpack_require__(1);
let SignalsGateway = SignalsGateway_1 = class SignalsGateway {
    constructor() {
        this.logger = new common_1.Logger(SignalsGateway_1.name);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    emitSignalChanged(signal) {
        this.server.emit('signal-changed', signal);
    }
    handleSubscribe(data) {
        this.logger.log(`Client subscribed to ${data.symbol} ${data.timeframe}`);
    }
};
exports.SignalsGateway = SignalsGateway;
tslib_1.__decorate([
    (0, websockets_1.WebSocketServer)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], SignalsGateway.prototype, "server", void 0);
tslib_1.__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    tslib_1.__param(0, (0, websockets_1.MessageBody)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], SignalsGateway.prototype, "handleSubscribe", null);
exports.SignalsGateway = SignalsGateway = SignalsGateway_1 = tslib_1.__decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } })
], SignalsGateway);


/***/ }),
/* 49 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/websockets");

/***/ }),
/* 50 */
/***/ ((module) => {

"use strict";
module.exports = require("socket.io");

/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var SignalsScheduler_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SignalsScheduler = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const schedule_1 = __webpack_require__(7);
const analyzer_service_1 = __webpack_require__(38);
const signals_service_1 = __webpack_require__(45);
const signals_gateway_1 = __webpack_require__(48);
const SYMBOL = 'ETHUSDT';
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];
let SignalsScheduler = SignalsScheduler_1 = class SignalsScheduler {
    constructor(analyzerService, signalsService, signalsGateway) {
        this.analyzerService = analyzerService;
        this.signalsService = signalsService;
        this.signalsGateway = signalsGateway;
        this.logger = new common_1.Logger(SignalsScheduler_1.name);
    }
    onModuleInit() {
        this.logger.log('SignalsScheduler initialized');
    }
    async runAnalysis() {
        for (const timeframe of TIMEFRAMES) {
            try {
                const result = await this.analyzerService.analyzeTimeframe(SYMBOL, timeframe);
                const { saved, signal } = await this.signalsService.saveIfChanged(result);
                if (saved) {
                    this.signalsGateway.emitSignalChanged(signal);
                }
            }
            catch (error) {
                this.logger.error(`Analysis failed for ${SYMBOL} ${timeframe}: ${error.message}`);
            }
        }
    }
};
exports.SignalsScheduler = SignalsScheduler;
tslib_1.__decorate([
    (0, schedule_1.Cron)('*/30 * * * * *'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SignalsScheduler.prototype, "runAnalysis", null);
exports.SignalsScheduler = SignalsScheduler = SignalsScheduler_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof analyzer_service_1.AnalyzerService !== "undefined" && analyzer_service_1.AnalyzerService) === "function" ? _a : Object, typeof (_b = typeof signals_service_1.SignalsService !== "undefined" && signals_service_1.SignalsService) === "function" ? _b : Object, typeof (_c = typeof signals_gateway_1.SignalsGateway !== "undefined" && signals_gateway_1.SignalsGateway) === "function" ? _c : Object])
], SignalsScheduler);


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const alert_service_1 = __webpack_require__(53);
const alert_controller_1 = __webpack_require__(55);
let AlertModule = class AlertModule {
};
exports.AlertModule = AlertModule;
exports.AlertModule = AlertModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [alert_controller_1.AlertController],
        providers: [alert_service_1.AlertService],
        exports: [alert_service_1.AlertService],
    })
], AlertModule);


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var AlertService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const crypto_1 = __webpack_require__(54);
const MAX_ALERTS = 10;
let AlertService = AlertService_1 = class AlertService {
    constructor() {
        this.logger = new common_1.Logger(AlertService_1.name);
        this.alerts = new Map();
    }
    setGatewayEmitter(emitter) {
        this.gatewayEmitter = emitter;
    }
    createAlert(dto) {
        if (this.alerts.size >= MAX_ALERTS) {
            throw new common_1.BadRequestException('Đã đạt giới hạn 10 alerts');
        }
        const alert = {
            id: (0, crypto_1.randomUUID)(),
            symbol: dto.symbol,
            targetPrice: dto.targetPrice,
            condition: dto.condition,
            createdAt: new Date(),
            triggered: false,
        };
        this.alerts.set(alert.id, alert);
        this.logger.log(`Alert created: ${alert.id} — ${alert.symbol} ${alert.condition} ${alert.targetPrice}`);
        return alert;
    }
    deleteAlert(id) {
        this.alerts.delete(id);
    }
    getAlerts() {
        return Array.from(this.alerts.values()).filter(a => !a.triggered);
    }
    checkAlerts(currentPrice) {
        for (const [id, alert] of this.alerts.entries()) {
            if (alert.triggered)
                continue;
            const triggered = (alert.condition === 'ABOVE' && currentPrice > alert.targetPrice) ||
                (alert.condition === 'BELOW' && currentPrice < alert.targetPrice);
            if (triggered) {
                alert.triggered = true;
                this.logger.log(`Alert triggered: ${id} — price ${currentPrice} ${alert.condition} ${alert.targetPrice}`);
                this.gatewayEmitter?.('price-alert-triggered', {
                    ...alert,
                    currentPrice,
                });
                this.alerts.delete(id);
            }
        }
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = AlertService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AlertService);


/***/ }),
/* 54 */
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlertController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const alert_service_1 = __webpack_require__(53);
const alert_types_1 = __webpack_require__(56);
let AlertController = class AlertController {
    constructor(alertService) {
        this.alertService = alertService;
    }
    create(dto) {
        return this.alertService.createAlert(dto);
    }
    remove(id) {
        this.alertService.deleteAlert(id);
        return { success: true };
    }
    list() {
        return this.alertService.getAlerts();
    }
};
exports.AlertController = AlertController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof alert_types_1.CreateAlertDto !== "undefined" && alert_types_1.CreateAlertDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AlertController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], AlertController.prototype, "remove", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AlertController.prototype, "list", null);
exports.AlertController = AlertController = tslib_1.__decorate([
    (0, common_1.Controller)('alerts'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof alert_service_1.AlertService !== "undefined" && alert_service_1.AlertService) === "function" ? _a : Object])
], AlertController);


/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: '*' });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;