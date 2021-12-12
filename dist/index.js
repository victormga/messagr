"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Messagr {
    constructor() {
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
    topic(name) {
        let current = this.$topics.get(name);
        if (!current) {
            current = new Messagr();
            this.$topics.set(name, current);
        }
        return current;
    }
    log(enable) {
        this.$log = enable;
    }
    interrupt(event, callback) {
        const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
        this.$interrupters.push({
            event: ievent,
            callback: callback
        });
        this.$interrupters_cache.clear();
    }
    uninterrupt(event, callback) {
        const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
        const index = this.$interrupters.findIndex((i) => i.event.source === ievent.source && i.callback === callback);
        if (index < 0)
            return;
        this.$interrupters.splice(index, 1);
        this.$interrupters_cache.clear();
    }
    intercept(event, callback) {
        const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
        this.$intercepters.push({
            event: ievent,
            callback: callback
        });
        this.$intercepters_cache.clear();
    }
    unintercept(event, callback) {
        const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
        const index = this.$intercepters.findIndex((i) => i.event.source === ievent.source && i.callback === callback);
        if (index < 0)
            return;
        this.$intercepters.splice(index, 1);
        this.$intercepters_cache.clear();
    }
    reply(event, callback) {
        const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
        this.$repliers.push({
            event: ievent,
            callback: callback
        });
        this.$repliers_cache.clear();
    }
    unreply(event, callback) {
        const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
        const index = this.$repliers.findIndex((i) => i.event.source === ievent.source && i.callback === callback);
        if (index < 0)
            return;
        this.$repliers.splice(index, 1);
        this.$repliers_cache.clear();
    }
    listen(event, callback) {
        const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
        this.$listeners.push({
            event: ievent,
            callback: callback
        });
        this.$listeners_cache.clear();
    }
    unlisten(event, callback) {
        const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
        const index = this.$listeners.findIndex((i) => i.event.source === ievent.source && i.callback === callback);
        if (index < 0)
            return;
        this.$listeners.splice(index, 1);
        this.$interrupters_cache.clear();
    }
    async say(event, input) {
        let interrupts = this.$interrupters_cache.get(event);
        if (interrupts === undefined) {
            interrupts = this.$interrupters.filter(i => i.event.test(event)).map(i => i.callback);
            this.$interrupters_cache.set(event, interrupts);
        }
        try {
            await Promise.all(interrupts.map((interrupt) => interrupt(input)));
        }
        catch (e) {
            throw e;
        }
        let res = undefined;
        let intercepts = this.$intercepters_cache.get(event);
        if (intercepts === undefined) {
            intercepts = this.$intercepters.filter(i => i.event.test(event)).map(i => i.callback);
            this.$intercepters_cache.set(event, intercepts);
        }
        for (const intercept of intercepts) {
            try {
                res = await intercept(input);
                if (res !== undefined)
                    break;
            }
            catch (e) {
                if (this.$log)
                    console.error(e);
            }
        }
        if (res === undefined) {
            res = {};
            let replies = this.$repliers_cache.get(event);
            if (replies === undefined) {
                replies = this.$repliers.filter(i => i.event.test(event)).map(i => i.callback);
                this.$repliers_cache.set(event, replies);
            }
            for (const reply of replies) {
                try {
                    res = { ...res, ...(await reply(input)) };
                }
                catch (e) {
                    if (this.$log)
                        console.error(e);
                }
            }
        }
        let listeners = this.$listeners_cache.get(event);
        if (listeners === undefined) {
            listeners = this.$listeners.filter(i => i.event.test(event)).map(i => i.callback);
            this.$listeners_cache.set(event, listeners);
        }
        Promise.all(listeners.map((listener) => listener(input, res))).catch((e) => {
            if (this.$log)
                console.error(e);
        });
        return res;
    }
}
exports.default = new Messagr();
