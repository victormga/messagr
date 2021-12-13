type GenericObject = { [key: string]: any };

type SyncInterruptCallback = (input: any) => void;
type AsyncInterruptCallback = (input: any) => Promise<void>;
type InterruptCallback = SyncInterruptCallback|AsyncInterruptCallback;
type InterruptEventEntry = { event: RegExp, callback: InterruptCallback };

type SyncInterceptCallback = (input: any) => GenericObject|undefined;
type AsyncInterceptCallback = (input: any) => Promise<GenericObject|undefined>;
type InterceptCallback = SyncInterceptCallback|AsyncInterceptCallback;
type InterceptEventEntry = { event: RegExp, callback: InterceptCallback };

type SyncReplyCallback = (input: any) => GenericObject;
type ASyncReplyCallback = (input: any) => Promise<GenericObject>;
type ReplyCallback = SyncReplyCallback|ASyncReplyCallback;
type ReplyEventEntry = { event: RegExp, callback: ReplyCallback };

type SyncListenCallback = (input: any, reply: GenericObject) => void;
type AsyncListenCallback = (input: any, reply: GenericObject) => Promise<void>;
type ListenCallback = SyncListenCallback|AsyncListenCallback;
type ListenEventEntry = { event: RegExp, callback: ListenCallback };

class Messagr {
	$topics: Map<string, Messagr> = new Map<string, Messagr>();

	$interrupters: InterruptEventEntry[] = [];
	$interrupters_cache: Map<string, InterruptCallback[]> = new Map<string, InterruptCallback[]>();

	$intercepters: InterceptEventEntry[] = [];
	$intercepters_cache: Map<string, InterceptCallback[]> = new Map<string, InterceptCallback[]>();

	$repliers: ReplyEventEntry[] = [];
	$repliers_cache: Map<string, ReplyCallback[]> = new Map<string, ReplyCallback[]>();

	$listeners: ListenEventEntry[] = [];
	$listeners_cache: Map<string, ListenCallback[]> = new Map<string, ListenCallback[]>();

	$log: boolean = false;

	topic(name: string): Messagr {
		let current = this.$topics.get(name);
		if (!current) {
			current = new Messagr();
			this.$topics.set(name, current);
		}
		return current;
	}

	log(enable: boolean): void {
		this.$log = enable;
	}

	interrupt(event: string|RegExp, callback: InterruptCallback): void {
		const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
		this.$interrupters.push({
			event: ievent,
			callback: callback
		});
		this.$interrupters_cache.clear();
	}

	uninterrupt(event: string|RegExp, callback: InterruptCallback): void {
		const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
		const index = this.$interrupters.findIndex((i) => i.event.source === ievent.source && i.callback === callback);
		if (index < 0) return;
		this.$interrupters.splice(index, 1);
		this.$interrupters_cache.clear();
	}

	intercept(event: string|RegExp, callback: InterceptCallback): void {
		const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
		this.$intercepters.push({
			event: ievent,
			callback: callback
		});
		this.$intercepters_cache.clear();
	}

	unintercept(event: string|RegExp, callback: InterceptCallback): void {
		const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
		const index = this.$intercepters.findIndex((i) => i.event.source === ievent.source && i.callback === callback);
		if (index < 0) return;
		this.$intercepters.splice(index, 1);
		this.$intercepters_cache.clear();
	}

	reply(event: string|RegExp, callback: ReplyCallback): void {
		const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
		this.$repliers.push({
			event: ievent,
			callback: callback
		});
		this.$repliers_cache.clear();
	}

	unreply(event: string|RegExp, callback: ReplyCallback): void {
		const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
		const index = this.$repliers.findIndex((i) => i.event.source === ievent.source && i.callback === callback);
		if (index < 0) return;
		this.$repliers.splice(index, 1);
		this.$repliers_cache.clear();
	}

	listen(event: string|RegExp, callback: ListenCallback): void {
		const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
		this.$listeners.push({
			event: ievent,
			callback: callback
		});
		this.$listeners_cache.clear();
	}

	unlisten(event: string|RegExp, callback: ListenCallback): void {
		const ievent = (event instanceof RegExp) ? event : new RegExp(`^${event}$`);
		const index = this.$listeners.findIndex((i) => i.event.source === ievent.source && i.callback === callback);
		if (index < 0) return;
		this.$listeners.splice(index, 1);
		this.$interrupters_cache.clear();
	}

	async send<T>(event: string, input?: any): Promise<T> {
		let interrupts = this.$interrupters_cache.get(event);
		if (interrupts === undefined) {
			interrupts = this.$interrupters.filter(i => i.event.test(event)).map(i => i.callback);
			this.$interrupters_cache.set(event, interrupts);
		}
		try {
			await Promise.all(interrupts.map((interrupt) => interrupt(input)));
		} catch(e) {
			throw e;
		}

		let res: GenericObject|undefined = undefined;

		let intercepts = this.$intercepters_cache.get(event);
		if (intercepts === undefined) {
			intercepts = this.$intercepters.filter(i => i.event.test(event)).map(i => i.callback);
			this.$intercepters_cache.set(event, intercepts);
		}
		for (const intercept of intercepts) {
			try {
				res = await intercept(input);
				if (res !== undefined) break;
			} catch(e) {
				if (this.$log) console.error(e);
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
				} catch(e) {
					if (this.$log) console.error(e);
				}
			}
		}

		let listeners = this.$listeners_cache.get(event);
		if (listeners === undefined){
			listeners = this.$listeners.filter(i => i.event.test(event)).map(i => i.callback);
			this.$listeners_cache.set(event, listeners);
		}
		Promise.all(listeners.map((listener) => listener(input, res as GenericObject))).catch((e) => {
			if (this.$log) console.error(e);
		});

		return res as T;
	}
}

export default new Messagr();