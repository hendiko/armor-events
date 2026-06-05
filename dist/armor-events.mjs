// armor-events v1.3.0
/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 15:57:07
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-07-25 13:11:58
 *
 * Utilities used by the event parser and registry implementation.
 */
/**
 * 判断目标是否为 Symbol 类型。
 */
function isSymbol(obj) {
    return "symbol" === typeof obj;
}
/**
 * 判断目标是否为函数。
 */
function isFunction(obj) {
    return "function" === typeof obj;
}
/**
 * 判断目标是否为数组。
 */
function isArray(obj) {
    return obj instanceof Array;
}
/**
 * 判断目标是否为字符串。
 */
function isString(obj) {
    return "string" === typeof obj;
}
/**
 * 使用 indexOf 保持原实现的相等判断语义。
 */
function includes(arr, item) {
    return arr.indexOf(item) > -1;
}
/**
 * 去除字符串首尾空白字符。
 */
function trim(str) {
    return str.replace(/^\s+|\s+$/g, "");
}
/**
 * 按连续空白字符拆分事件名字符串。
 */
function splitByWhitespace(str) {
    return trim(str).split(/\s+/);
}
/**
 * 判断字符串中是否不包含空白字符。
 */
function hasNoWhitespace(str) {
    return !/\s/.test(str);
}
/**
 * 向数组中追加唯一项；保持原实现对重复事件名/响应的去重行为。
 */
function addUniqueItem(arr, item) {
    if (!includes(arr, item))
        arr.push(item);
}
/**
 * 判断目标是否为 number 类型。
 */
function isNumber(obj) {
    return "number" === typeof obj;
}
/**
 * 判断目标是否为非数组 object。
 *
 * 注意：这里保持原实现行为，function 不被视为 object。
 */
function isObject(obj) {
    return !!obj && typeof obj === "object" && !isArray(obj);
}
/**
 * 整理事件名称或响应参数，返回标准事件列表。
 *
 * 事件名称参数可以是 string、array、number、symbol 中任意一种，
 * 但合法的单一事件名称必须是 symbol 或者不含空格的非空字符串。
 */
function makeEventList(name, allowFn, result = []) {
    if (isString(name)) {
        const trimmedName = trim(name);
        if (trimmedName) {
            // 单个无空白字符串直接加入；含空白字符串继续拆分。
            if (hasNoWhitespace(trimmedName)) {
                addUniqueItem(result, trimmedName);
            }
            else {
                makeEventList(splitByWhitespace(trimmedName), allowFn, result);
            }
        }
    }
    else if (isArray(name)) {
        // 数组允许嵌套，递归展开后仍保持去重。
        for (let i = 0; i < name.length; i++) {
            makeEventList(name[i], allowFn, result);
        }
    }
    else if (isNumber(name)) {
        // number 类型事件名沿用旧行为，转换成字符串事件名。
        makeEventList(name + "", allowFn, result);
    }
    else if (isSymbol(name)) {
        addUniqueItem(result, name);
    }
    else if (allowFn && isFunction(name)) {
        addUniqueItem(result, name);
    }
    return result;
}
/**
 * 获取 Plain Object 所有 property 名称（包括 Symbol Key）。
 */
function keys(obj) {
    let names = Object.getOwnPropertySymbols
        ? Object.getOwnPropertySymbols(obj)
        : [];
    for (let k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            names.push(k);
        }
    }
    return names;
}
/**
 * 空操作函数，用作无事件绑定时返回的销毁函数。
 */
function noop() { }
let cacheId = {};
/**
 * 生成唯一 id。
 */
function uniqueId(salt) {
    if (!Object.prototype.hasOwnProperty.call(cacheId, salt))
        cacheId[salt] = 0;
    return salt + cacheId[salt]++;
}

/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 18:18:30
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-10-01 00:57:26
 *
 * Owner initialization for ArmorEvents instances and mixed objects.
 */
/**
 * 确保 owner 拥有内部事件状态。
 *
 * listening
 *
 * listener 主动停止监听
 *
 * 通过 listener.listenings 解除对应 target 的监听
 *
 * target 主动停止监听
 *
 * 在 events, handlers 中删除相关 handler，通过 listeners
 * 找到 listener, 移除相关绑定
 */
function checkOwner(owner) {
    if (!owner._armorEvents) {
        owner._armorEvents = {
            id: uniqueId("a"),
            events: {},
            handlers: {},
            listenings: {},
        };
    }
}

/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 17:35:35
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-10-01 15:53:57
 *
 * Shared destroy logic for explicit unbind, off, once and stopListening.
 */
/**
 * 从指定事件队列中移除 handler id。
 */
function removeEvent(events, event, handlerId) {
    let queue = events[event];
    if (queue) {
        let index = queue.indexOf(handlerId);
        if (index > -1) {
            queue.splice(index, 1);
        }
        if (!queue.length) {
            delete events[event];
        }
    }
}
/**
 * 从 listener 的 listenings 反向索引中移除 handler id。
 */
function removeListening(listenings, targetId, event, handlerId) {
    let listening = listenings[targetId];
    if (listening) {
        let { events } = listening;
        if (events) {
            let queue = events[event];
            if (queue) {
                let index = queue.indexOf(handlerId);
                if (index > -1) {
                    queue.splice(index, 1);
                }
                if (!queue.length) {
                    delete events[event];
                }
            }
            if (!keys(events).length) {
                delete listenings[targetId];
            }
        }
    }
}
/**
 * 销毁单个 handler，同时清理 owner 与 listener 两侧索引。
 */
function destroyApi(owner, handlerId) {
    let { id, handlers, events } = owner._armorEvents;
    let handler = handlers[handlerId];
    if (handler) {
        // 标记 handler 已失效，触发队列中已捕获的 job 会据此跳过。
        handler.disabled = true;
        delete handlers[handlerId];
        let { event, listener } = handler;
        removeEvent(events, event, handlerId);
        if (listener) {
            let { listenings } = listener._armorEvents;
            removeListening(listenings, id, event, handlerId);
        }
    }
}
/**
 * 批量销毁 handler。
 */
function destroy(owner, handlerIds) {
    if (owner && owner._armorEvents && handlerIds && handlerIds.length) {
        for (let i = 0; i < handlerIds.length; i++) {
            destroyApi(owner, handlerIds[i]);
        }
    }
}

/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 16:50:33
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 15:22:06
 *
 * Event binding implementation for on/once and listenTo.
 */
/**
 * 绑定单个事件和单个响应，并返回新建 handler id。
 */
function onApi(owner, event, handle, ctx, once, listener) {
    let { events, handlers } = owner._armorEvents;
    let id = uniqueId("h");
    let handler = (handlers[id] = {
        id,
        event,
        handle,
        ctx,
        once: !!once,
        handleType: isFunction(handle) ? 0 : 1, // 0 - 回调，1 - 转发
    });
    // 保持旧实现行为：只有 object listener 会被记录。
    if (isObject(listener))
        handler.listener = listener;
    let queue = events[event] || (events[event] = []);
    queue.push(id);
    return id;
}
/**
 * 将多事件、多响应参数拆解成多次 onApi 调用。
 */
function onEvents(owner, events, handles, ctx, once) {
    let names = makeEventList(events);
    handles = makeEventList(handles, true);
    let ids = [];
    if (names.length && handles.length) {
        for (let m = 0; m < names.length; m++) {
            for (let n = 0; n < handles.length; n++) {
                // 保持旧实现行为：不允许转发到 all，也不允许事件转发给自身。
                if (handles[n] !== "all" && handles[n] !== names[m]) {
                    ids.push(onApi(owner, names[m], handles[n], ctx || owner, once));
                }
            }
        }
    }
    return ids;
}
/**
 * on/once 的内部入口，支持事件 map 和普通参数两种形式。
 */
function on(owner, events, handles, ctx, once) {
    let handlerIds = [];
    if (isObject(events)) {
        once = ctx;
        ctx = handles;
        let names = keys(events);
        for (let i = 0; i < names.length; i++) {
            handlerIds = handlerIds.concat(onEvents(owner, names[i], events[names[i]], ctx, once));
        }
    }
    else {
        handlerIds = onEvents(owner, events, handles, ctx, once);
    }
    return handlerIds;
}

/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 09:34:30
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 15:23:01
 *
 * listenTo/listenToOnce implementation.
 */
/**
 * 监听者 listener 在 owner 上绑定单个事件响应，并建立反向监听索引。
 */
function listenToApi(listener, owner, event, handle, ctx, once) {
    let handlerId = onApi(owner, event, handle, ctx, once, listener);
    let { id } = owner._armorEvents;
    let { listenings } = listener._armorEvents;
    let listening = listenings[id];
    if (!listening)
        listening = listenings[id] = { target: owner, events: {} };
    let { events } = listening;
    let queue = events[event];
    if (!queue)
        queue = events[event] = [];
    queue.push(handlerId);
    return handlerId;
}
/**
 * 将多事件、多响应监听参数拆解成多次 listenToApi 调用。
 */
function listen(listener, owner, events, handles, ctx, once) {
    let names = makeEventList(events);
    handles = makeEventList(handles, true);
    let ids = [];
    if (names.length && handles.length) {
        for (let m = 0; m < names.length; m++) {
            for (let n = 0; n < handles.length; n++) {
                // 保持旧实现行为：listenTo 允许转发给自身事件名，但不允许转发 all。
                if (handles[n] !== "all") {
                    ids.push(listenToApi(listener, owner, names[m], handles[n], ctx || listener, once));
                }
            }
        }
    }
    return ids;
}
/**
 * listenTo/listenToOnce 的内部入口，支持事件 map 和普通参数两种形式。
 */
function listenTo(listener, owner, events, handles, ctx, once) {
    let ids = [];
    if (isObject(events)) {
        once = ctx;
        ctx = handles;
        let names = keys(events);
        for (let i = 0; i < names.length; i++) {
            ids = ids.concat(listen(listener, owner, names[i], events[names[i]], ctx, once));
        }
    }
    else {
        ids = listen(listener, owner, events, handles, ctx, once);
    }
    return ids;
}

/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 22:25:32
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-25 14:47:10
 *
 * Event unbinding and stopListening implementation.
 */
/**
 * 根据事件名筛选候选 handler。
 */
function filterByEvents(owner, events) {
    let { events: _events, handlers } = owner._armorEvents;
    events = events == null ? keys(_events) : makeEventList(events);
    let _handlers = [];
    for (let i = 0; i < events.length; i++) {
        let queue = _events[events[i]];
        if (queue) {
            for (let h = 0; h < queue.length; h++) {
                let handler = handlers[queue[h]];
                if (handler)
                    _handlers.push(handler);
            }
        }
    }
    return _handlers;
}
/**
 * 根据响应函数/转发事件名和上下文筛选 handler id。
 */
function filterByHandle(handlers, handles, ctx) {
    let ids = [];
    if (handles != null)
        handles = makeEventList(handles, true);
    for (let i = 0; i < handlers.length; i++) {
        let handler = handlers[i];
        if (handles == null || includes(handles, handler.handle)) {
            if (ctx == null || ctx === handler.ctx) {
                ids.push(handler.id);
            }
        }
    }
    return ids;
}
/**
 * 解绑 owner 上符合条件的事件响应。
 */
function off(owner, events, handles, ctx) {
    if (owner._armorEvents) {
        let handlers = filterByEvents(owner, events);
        let ids = filterByHandle(handlers, handles, ctx);
        destroy(owner, ids);
    }
}
/**
 * 停止 listener 对 target 的监听。
 */
function stopListening(listener, target, events, handles, ctx) {
    if (listener._armorEvents) {
        let { listenings } = listener._armorEvents;
        let temp = [];
        if (isObject(target)) {
            if (target._armorEvents) {
                let listening = listenings[target._armorEvents.id];
                if (listening)
                    temp.push(listening);
            }
            else {
                return;
            }
        }
        else {
            let ids = keys(listenings);
            for (let i = 0; i < ids.length; i++) {
                temp.push(listenings[ids[i]]);
            }
        }
        if (events != null)
            events = makeEventList(events);
        for (let i = 0; i < temp.length; i++) {
            let { target, events: _events } = temp[i];
            let names = events || keys(_events);
            let { handlers } = target._armorEvents;
            let _handlers = [];
            for (let h = 0; h < names.length; h++) {
                let queue = _events[names[h]];
                if (queue) {
                    for (let j = 0; j < queue.length; j++) {
                        let handler = handlers[queue[j]];
                        if (handler)
                            _handlers.push(handler);
                    }
                }
            }
            destroy(target, filterByHandle(_handlers, handles, ctx));
        }
    }
}

/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 14:33:49
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-10-01 00:56:01
 *
 * Synchronous and deferred trigger queue implementation.
 */
// 任务队列
let jobsQueue = [];
// 任务锁，确保任务队列中任务按序逐个消费。
let isDoingJob = false;
/**
 * 本函数为同步执行，内部触发事件或者回调都同步操作。
 */
function doJob(job) {
    let { handler, args, owner, event, all } = job;
    // 如果 all 为真，表示需要触发 all 事件。
    if (all) {
        triggerApi(owner, "all", [event, ...args]);
    }
    else if (handler) {
        let { id, handle, handleType, ctx, once, listener, disabled } = handler;
        // 如果 disabled 为假，则表示该 handle 仍然可用。
        if (!disabled) {
            // 如果 once 为真，应首先销毁，然后执行回调函数。
            if (once) {
                destroyApi(owner, id);
            }
            if (handleType === 0) {
                // 如果 handle 是回调函数，则直接以绑定上下文调用。
                handle.apply(ctx, args);
            }
            else {
                // 无论原事件是同步或异步触发，此处转发动作都使用同步触发。
                triggerApi(listener || owner, handle, args);
            }
        }
    }
}
/**
 * 启动任务消费。
 */
function startJob() {
    if (!isDoingJob) {
        isDoingJob = true;
        while (jobsQueue.length) {
            let job = jobsQueue.shift();
            if (job.async) {
                setTimeout(doJob, 0, job);
            }
            else {
                try {
                    doJob(job);
                }
                catch (e) {
                    isDoingJob = false;
                    throw e;
                }
            }
        }
        isDoingJob = false;
    }
}
/**
 * 触发单个事件名对应的响应队列。
 */
function triggerApi(owner, event, args, async) {
    let { events, handlers } = owner._armorEvents;
    let queue = events[event];
    let jobs = [];
    if (queue) {
        for (let i = 0; i < queue.length; i++) {
            let id = queue[i];
            let handler = handlers[id];
            if (handler) {
                jobs.push({ handler, args, owner, async });
            }
        }
    }
    // 每个事件所有回调执行完毕后，应在事件发生对象上触发一次 all 事件。
    if (event !== "all") {
        jobsQueue.unshift({ all: true, event, owner, async, args });
    }
    // 最后的事件回调首先被推入队列，最早的事件回调会最后入列，但首先出列。
    for (let x = jobs.length - 1; x > -1; x--) {
        jobsQueue.unshift(jobs[x]);
    }
    startJob();
}
/**
 * 触发一个或多个事件。
 */
function trigger(owner, events, args, async) {
    events = makeEventList(events);
    for (let i = 0; i < events.length; i++) {
        triggerApi(owner, events[i], args, async);
    }
}

/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 17:32:35
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-08-07 16:40:11
 *
 * armorEvents 结构：
 * {
 *  id: string,
 *  events: {
 *    [event]: [handler.id]
 *  },
 *  handlers: {
 *    [handler.id]: handler
 *  },
 *  listenings: {
 *    [target.id]: {
 *      target,
 *      events: {
 *        [event]: [handler.id]
 *      }
 *    }
 *  }  // target.id 为 target._armorEvents.id
 * }
 *
 * handler 结构：
 * {
 *  id: string,
 *  event: string,
 *  handle: function|string|symbol,
 *  ctx: object,
 *  once: boolean,
 *  listener: object,
 *  disabled: boolean
 * }
 */
const eventsApi = {
    /**
     * 监听其他对象发生的事件。
     */
    listenTo(target, events, handles, ctx) {
        checkOwner(this);
        checkOwner(target);
        let ids = listenTo(this, target, events, handles, ctx);
        return ids.length ? () => destroy(target, ids) : noop;
    },
    /**
     * 监听其他对象发生的事件，响应一次后自动停止监听。
     */
    listenToOnce(target, events, handles, ctx) {
        checkOwner(this);
        checkOwner(target);
        let ids = listenTo(this, target, events, handles, ctx, true);
        return ids.length ? () => destroy(target, ids) : noop;
    },
    /**
     * 解绑事件。
     */
    off(events, handles, ctx) {
        off(this, events, handles, ctx);
        return this;
    },
    /**
     * 绑定事件。
     */
    on(events, handles, ctx) {
        checkOwner(this);
        let ids = on(this, events, handles, ctx);
        return ids.length ? () => destroy(this, ids) : noop;
    },
    /**
     * 绑定事件，事件响应一次后自动解绑。
     */
    once(events, handles, ctx) {
        checkOwner(this);
        let ids = on(this, events, handles, ctx, true);
        return ids.length ? () => destroy(this, ids) : noop;
    },
    /**
     * 停止监听。
     */
    stopListening(target, events, handles, ctx) {
        stopListening(this, target, events, handles, ctx);
        return this;
    },
    /**
     * 触发事件，同步执行所有回调函数。
     */
    trigger(events, ...args) {
        if (this._armorEvents) {
            trigger(this, events, args);
        }
        return this;
    },
    /**
     * 触发事件，异步执行所有回调函数。
     */
    triggerAsync(events, ...args) {
        if (this._armorEvents) {
            trigger(this, events, args, true);
        }
        return this;
    },
};
/**
 * 将事件 API 混入指定对象。
 */
function extendApi(obj) {
    for (let k in eventsApi) {
        obj[k] = eventsApi[k];
    }
    return obj;
}
/**
 * 如果 ArmorEvents 作为构造函数调用，它不接受任何参数。
 * 如果 ArmorEvents 作为函数调用，它接受一个 target 参数，表示将赋予 target 对象事件能力。
 */
const ArmorEvents = function ArmorEvents(target) {
    if (this instanceof ArmorEvents) {
        return;
    }
    else {
        let newObj;
        let type = typeof target;
        newObj = target && ("object" === type || "function" === type) ? target : {};
        return extendApi(newObj);
    }
};
extendApi(ArmorEvents.prototype);
extendApi(ArmorEvents);

/*
 * @Author: Xavier Yin
 * @Date: 2020-07-25 11:20:40
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-08-10 15:55:22
 *
 * Channel provides a single data event surface built on ArmorEvents.
 *
 * Warning: Channel and all Channel APIs are experimental. Their names,
 * signatures, lifecycle semantics, pipe behavior and error handling may change
 * in future releases. Callers should evaluate this risk before depending on
 * Channel in stable public interfaces.
 */
const channelId = ((incr) => () => "channel" + incr++)(0);
const bindingId = ((incr) => () => "binding" + incr++)(0);
const DATA_EVENT = "data";
const PIPE_EVENT = "pipe";
/**
 * 两个 channel 可以连通在一起。
 *
 * 警告：Channel 目前是实验性 API，类名、方法名、参数签名、生命周期语义、
 * pipe 传递行为和错误处理策略都可能在后续版本调整。调用者在生产或公共
 * API 中使用前，应自行评估兼容性风险。
 *
 * @experimental
 */
class Channel {
    /**
     * 创建一个单一数据通道。
     *
     * 警告：Channel 构造方式和公开属性可能随后续版本调整。
     *
     * @experimental
     */
    constructor() {
        this.id = channelId();
        this.events = new ArmorEvents();
        this.upstream = null;
        this.downstreams = {};
        this.bindings = {};
    }
    /**
     * 判断是否可以与 subchannel 建立管道。
     *
     * 警告：canPipe 的返回/异常语义可能调整；调用者不要把当前行为视为稳定契约。
     *
     * @experimental
     */
    canPipe(subchannel) {
        return !checkPipable(this, subchannel);
    }
    /**
     * 清空 channel，包括解除 upstream 和 downstream 连接。
     * 清除所有 DATA_EVENT 事件响应。
     *
     * 警告：clean 的清理范围和生命周期语义可能调整。
     *
     * @experimental
     */
    clean() {
        this.detach().unpipe().off();
        return this;
    }
    /**
     * 与 upstream 脱离。
     *
     * 警告：detach 对 ArmorEvents upstream 和 Channel upstream 的解绑策略可能调整。
     *
     * @experimental
     */
    detach() {
        if (this.upstream) {
            if (this.upstream instanceof ArmorEvents) {
                this.upstream.off(null, this.feed, this);
                this.upstream = null;
            }
            else {
                this.upstream.unpipe(this);
            }
        }
        return this;
    }
    /**
     * 触发 DATA_EVENT 事件。
     *
     * 警告：feed 的同步触发顺序、pipe 联动和参数传递规则可能调整。
     *
     * @experimental
     */
    feed(...args) {
        this.events.trigger(DATA_EVENT, ...args);
        this.events.trigger(PIPE_EVENT, ...args);
        return this;
    }
    /**
     * 异步触发 DATA_EVENT 事件。
     *
     * 警告：feedAsync 当前不返回 Promise；后续异步语义可能调整。
     *
     * @experimental
     */
    feedAsync(...args) {
        this.events.triggerAsync(DATA_EVENT, ...args);
        this.events.triggerAsync(PIPE_EVENT, ...args);
        return this;
    }
    /**
     * 绑定 DATA_EVENT 回调函数。
     *
     * 警告：onData 的命名、上下文语义和返回的解绑函数形式可能调整。
     *
     * @experimental
     */
    onData(cb, ctx) {
        const id = bindingId();
        const unbind = this.events.on(DATA_EVENT, cb, ctx);
        const unbind2 = () => {
            delete this.bindings[id];
            unbind();
        };
        const binding = { id, unbind: unbind2, cb, ctx };
        this.bindings[id] = binding;
        return unbind2;
    }
    /**
     * 绑定一次性 DATA_EVENT 回调函数。
     *
     * 警告：onceData 的解绑时机、上下文语义和返回值形式可能调整。
     *
     * @experimental
     */
    onceData(cb, ctx) {
        const id = bindingId();
        const handler = (...args) => {
            cb.apply(ctx, args);
            unbind2();
        };
        const unbind = this.events.once(DATA_EVENT, handler, ctx);
        const unbind2 = () => {
            delete this.bindings[id];
            unbind();
        };
        const binding = { id, unbind: unbind2, cb, ctx };
        this.bindings[id] = binding;
        return unbind2;
    }
    /**
     * 清除 onData 回调。
     *
     * 警告：off 当前只清理 data 回调，不清理 pipe/upstream/downstream；
     * 后续清理范围可能调整。
     *
     * @experimental
     */
    off(cb, ctx) {
        let bindings = values(this.bindings);
        for (let i = 0; i < bindings.length; i++) {
            let { unbind, cb: _cb, ctx: _ctx } = bindings[i];
            // cb 或 ctx 为空时表示该条件不限。
            if ((cb != null && cb !== _cb) || (ctx != null && ctx !== _ctx))
                continue;
            unbind();
        }
        return this;
    }
    /**
     * 连通下一级 channel。
     *
     * 警告：pipe 的 transform 语义、同步/异步传递规则、环路检查和错误处理
     * 可能调整。调用者应避免把当前实现细节暴露为自己的稳定 API。
     *
     * @experimental
     */
    pipe(subchannel, transform) {
        checkPipable(this, subchannel);
        {
            let unbind = this.events.on(PIPE_EVENT, (...args) => {
                if (typeof transform === "function") {
                    Promise.resolve(transform(...args)).then((val) => subchannel.feed(val));
                }
                else {
                    subchannel.feed(...args);
                }
            });
            let unbind2 = () => {
                delete this.downstreams[subchannel.id];
                subchannel.upstream = null;
                unbind();
            };
            this.downstreams[subchannel.id] = {
                id: subchannel.id,
                unbind: unbind2,
                channel: subchannel,
            };
            subchannel.upstream = this;
        }
        return this;
    }
    /**
     * 断开与下一级 channel 的连通。
     *
     * 警告：unpipe 的参数匹配方式和 downstream 清理策略可能调整。
     *
     * @experimental
     */
    unpipe(...subchannels) {
        if (subchannels.length === 0)
            subchannels = values(this.downstreams).map((binding) => binding.channel);
        subchannels.map((channel) => {
            let id = channel ? channel.id : null;
            if (id) {
                let { unbind } = this.downstreams[id] || {};
                if (unbind)
                    unbind();
            }
        });
        return this;
    }
}
/**
 * 检查两个 channel 是否可以建立管道。
 *
 * 注意：这里保留原实现行为，非法情况会 throw 字符串，canPipe 也会透传异常。
 */
const checkPipable = (channel, subchannel) => {
    if (subchannel.upstream) {
        throw "subchannel has already had an upstream channel.";
    }
    else if (channel.upstream && isSelfOrDescendant(subchannel, channel)) {
        throw "it can not be circular pipe.";
    }
    return false;
};
/**
 * 获取对象枚举值列表。
 */
const values = (obj) => {
    let arr = [];
    for (let k in obj) {
        arr.push(obj[k]);
    }
    return arr;
};
/**
 * 判断 subchannel 是否为 channel 自身或其下游后代。
 */
const isSelfOrDescendant = (channel, subchannel) => {
    if (channel === subchannel)
        return true;
    if (channel.downstreams[subchannel.id])
        return true;
    for (let k in channel.downstreams) {
        if (isSelfOrDescendant(channel.downstreams[k].channel, subchannel)) {
            return true;
        }
    }
    return false;
};
/**
 * 通过该方法得到的 Channel 对象，没有提供明确的解绑方法。
 * 但你可以通过 armorEvents.off(null, null, channel) 来进行解绑。
 *
 * 警告：channel(events) 是实验性 API，返回的 Channel 连接方式和解绑方式
 * 可能在后续版本调整。
 *
 * @experimental
 */
ArmorEvents.prototype.channel = function (eventNames) {
    let channel = new Channel();
    channel.upstream = this;
    this.on(eventNames, channel.feed, channel);
    return channel;
};

/*
 * @Author: Xavier Yin
 * @Date: 2019-09-20 17:32:35
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2020-07-28 14:02:44
 *
 * Public module entry for ArmorEvents.
 */
ArmorEvents.Channel = Channel;

export { Channel, ArmorEvents as default };
