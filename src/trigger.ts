/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 14:33:49
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-10-01 00:56:01
 *
 * Synchronous and deferred trigger queue implementation.
 */

import { makeEventList } from "./utils";
import { destroyApi } from "./destroy";
import type { ArmorEventsOwner, EventHandlerRecord } from "./types";

interface TriggerJob {
  handler?: EventHandlerRecord;
  args: any[];
  owner: ArmorEventsOwner;
  event?: any;
  all?: boolean;
  async?: boolean;
}

// 任务队列
let jobsQueue: TriggerJob[] = [];

// 任务锁，确保任务队列中任务按序逐个消费。
let isDoingJob = false;

/**
 * 本函数为同步执行，内部触发事件或者回调都同步操作。
 */
function doJob(job: TriggerJob): void {
  let { handler, args, owner, event, all } = job;
  // 如果 all 为真，表示需要触发 all 事件。
  if (all) {
    triggerApi(owner, "all", [event, ...args]);
  } else if (handler) {
    let { id, handle, handleType, ctx, once, listener, disabled } = handler;
    // 如果 disabled 为假，则表示该 handle 仍然可用。
    if (!disabled) {
      // 如果 once 为真，应首先销毁，然后执行回调函数。
      if (once) {
        destroyApi(owner, id);
      }
      if (handleType === 0) {
        // 如果 handle 是回调函数，则直接以绑定上下文调用。
        (handle as (...args: any[]) => any).apply(ctx, args);
      } else {
        // 无论原事件是同步或异步触发，此处转发动作都使用同步触发。
        triggerApi(listener || owner, handle, args);
      }
    }
  }
}

/**
 * 启动任务消费。
 */
function startJob(): void {
  if (!isDoingJob) {
    isDoingJob = true;
    while (jobsQueue.length) {
      let job = jobsQueue.shift()!;
      if (job.async) {
        setTimeout(doJob, 0, job);
      } else {
        try {
          doJob(job);
        } catch (e) {
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
function triggerApi(owner: ArmorEventsOwner, event: any, args: any[], async?: boolean): void {
  let { events, handlers } = owner._armorEvents!;
  let queue = events[event];
  let jobs: TriggerJob[] = [];
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
function trigger(owner: ArmorEventsOwner, events: unknown, args: any[], async?: boolean): void {
  events = makeEventList(events);
  for (let i = 0; i < (events as unknown[]).length; i++) {
    triggerApi(owner, (events as unknown[])[i], args, async);
  }
}

export { trigger, triggerApi };
