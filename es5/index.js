"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Messagr = (function () {
    function Messagr() {
        this.$topics = new Map();
        this.$interrupters = [];
        this.$interrupters_cache = new Map();
        this.$intercepters = [];
        this.$intercepters_cache = new Map();
        this.$repliers = [];
        this.$repliers_cache = new Map();
        this.$listeners = [];
        this.$listeners_cache = new Map();
        this.$log = false;
    }
    Messagr.prototype.topic = function (name) {
        var current = this.$topics.get(name);
        if (!current) {
            current = new Messagr();
            this.$topics.set(name, current);
        }
        return current;
    };
    Messagr.prototype.log = function (enable) {
        this.$log = enable;
    };
    Messagr.prototype.interrupt = function (event, callback) {
        var ievent = (event instanceof RegExp) ? event : new RegExp("^" + event + "$");
        this.$interrupters.push({
            event: ievent,
            callback: callback
        });
        this.$interrupters_cache.clear();
    };
    Messagr.prototype.uninterrupt = function (event, callback) {
        var ievent = (event instanceof RegExp) ? event : new RegExp("^" + event + "$");
        var index = this.$interrupters.findIndex(function (i) { return i.event.source === ievent.source && i.callback === callback; });
        if (index < 0)
            return;
        this.$interrupters.splice(index, 1);
        this.$interrupters_cache.clear();
    };
    Messagr.prototype.intercept = function (event, callback) {
        var ievent = (event instanceof RegExp) ? event : new RegExp("^" + event + "$");
        this.$intercepters.push({
            event: ievent,
            callback: callback
        });
        this.$intercepters_cache.clear();
    };
    Messagr.prototype.unintercept = function (event, callback) {
        var ievent = (event instanceof RegExp) ? event : new RegExp("^" + event + "$");
        var index = this.$intercepters.findIndex(function (i) { return i.event.source === ievent.source && i.callback === callback; });
        if (index < 0)
            return;
        this.$intercepters.splice(index, 1);
        this.$intercepters_cache.clear();
    };
    Messagr.prototype.reply = function (event, callback) {
        var ievent = (event instanceof RegExp) ? event : new RegExp("^" + event + "$");
        this.$repliers.push({
            event: ievent,
            callback: callback
        });
        this.$repliers_cache.clear();
    };
    Messagr.prototype.unreply = function (event, callback) {
        var ievent = (event instanceof RegExp) ? event : new RegExp("^" + event + "$");
        var index = this.$repliers.findIndex(function (i) { return i.event.source === ievent.source && i.callback === callback; });
        if (index < 0)
            return;
        this.$repliers.splice(index, 1);
        this.$repliers_cache.clear();
    };
    Messagr.prototype.listen = function (event, callback) {
        var ievent = (event instanceof RegExp) ? event : new RegExp("^" + event + "$");
        this.$listeners.push({
            event: ievent,
            callback: callback
        });
        this.$listeners_cache.clear();
    };
    Messagr.prototype.unlisten = function (event, callback) {
        var ievent = (event instanceof RegExp) ? event : new RegExp("^" + event + "$");
        var index = this.$listeners.findIndex(function (i) { return i.event.source === ievent.source && i.callback === callback; });
        if (index < 0)
            return;
        this.$listeners.splice(index, 1);
        this.$interrupters_cache.clear();
    };
    Messagr.prototype.say = function (event, input) {
        return __awaiter(this, void 0, void 0, function () {
            var interrupts, e_1, res, intercepts, _i, intercepts_1, intercept, e_2, replies, _a, replies_1, reply, _b, e_3, listeners;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        interrupts = this.$interrupters_cache.get(event);
                        if (interrupts === undefined) {
                            interrupts = this.$interrupters.filter(function (i) { return i.event.test(event); }).map(function (i) { return i.callback; });
                            this.$interrupters_cache.set(event, interrupts);
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4, Promise.all(interrupts.map(function (interrupt) { return interrupt(input); }))];
                    case 2:
                        _c.sent();
                        return [3, 4];
                    case 3:
                        e_1 = _c.sent();
                        throw e_1;
                    case 4:
                        res = undefined;
                        intercepts = this.$intercepters_cache.get(event);
                        if (intercepts === undefined) {
                            intercepts = this.$intercepters.filter(function (i) { return i.event.test(event); }).map(function (i) { return i.callback; });
                            this.$intercepters_cache.set(event, intercepts);
                        }
                        _i = 0, intercepts_1 = intercepts;
                        _c.label = 5;
                    case 5:
                        if (!(_i < intercepts_1.length)) return [3, 10];
                        intercept = intercepts_1[_i];
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4, intercept(input)];
                    case 7:
                        res = _c.sent();
                        if (res !== undefined)
                            return [3, 10];
                        return [3, 9];
                    case 8:
                        e_2 = _c.sent();
                        if (this.$log)
                            console.error(e_2);
                        return [3, 9];
                    case 9:
                        _i++;
                        return [3, 5];
                    case 10:
                        if (!(res === undefined)) return [3, 16];
                        res = {};
                        replies = this.$repliers_cache.get(event);
                        if (replies === undefined) {
                            replies = this.$repliers.filter(function (i) { return i.event.test(event); }).map(function (i) { return i.callback; });
                            this.$repliers_cache.set(event, replies);
                        }
                        _a = 0, replies_1 = replies;
                        _c.label = 11;
                    case 11:
                        if (!(_a < replies_1.length)) return [3, 16];
                        reply = replies_1[_a];
                        _c.label = 12;
                    case 12:
                        _c.trys.push([12, 14, , 15]);
                        _b = [__assign({}, res)];
                        return [4, reply(input)];
                    case 13:
                        res = __assign.apply(void 0, _b.concat([(_c.sent())]));
                        return [3, 15];
                    case 14:
                        e_3 = _c.sent();
                        if (this.$log)
                            console.error(e_3);
                        return [3, 15];
                    case 15:
                        _a++;
                        return [3, 11];
                    case 16:
                        listeners = this.$listeners_cache.get(event);
                        if (listeners === undefined) {
                            listeners = this.$listeners.filter(function (i) { return i.event.test(event); }).map(function (i) { return i.callback; });
                            this.$listeners_cache.set(event, listeners);
                        }
                        Promise.all(listeners.map(function (listener) { return listener(input, res); })).catch(function (e) {
                            if (_this.$log)
                                console.error(e);
                        });
                        return [2, res];
                }
            });
        });
    };
    return Messagr;
}());
exports.default = new Messagr();
