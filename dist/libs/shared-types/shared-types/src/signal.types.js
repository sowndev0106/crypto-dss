"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=signal.types.js.map