/*
 * @Author: Xavier Yin
 * @Date: 2019-09-23 14:33:49
 * @Last Modified by: Xavier Yin
 * @Last Modified time: 2019-09-24 18:21:02
 */

import { makeEventList } from "./utils";
import { destroyApi } from "./destroy";

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
  } else {
    let { handlers } = owner._armorEvents;
    let { id, handle, handleType, ctx, once, listener } = handler;
    // 如果此时 handler 仍然存在的话，表示该 handler 仍有效，因此需要执行 handle。
    // 如果 handler 不存在表示该 handle 在执行前可能已经被删除。
    if (handlers[id]) {
      // 如果 handle 是回调函数
      if (handleType === 0) {
        handle.apply(ctx, args);
      } else {
        // 无论原事件是同步或异步触发，此处转发动作都使用同步触发。
        triggerApi(listener || owner, handle, args);
      }
      if (once) {
        destroyApi(owner, id);
      }
    }
  }
}

/**
 * 启动任务消费
 */
function startJob() {
  if (!isDoingJob) {
    isDoingJob = true;
    while (jobsQueue.length) {
      let job = jobsQueue.shift();
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

  // 每个事件所有回调执行完毕后，应在事件发生对象上触发一次 all 事件
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
 * 触发事件
 * @param {object} owner 具有事件能力的对象
 * @param {*} events
 * @param {*} args
 * @param {*} async
 */
function trigger(owner, events, args, async) {
  events = makeEventList(events);
  for (let i = 0; i < events.length; i++) {
    triggerApi(owner, events[i], args, async);
  }
}

export { trigger };
