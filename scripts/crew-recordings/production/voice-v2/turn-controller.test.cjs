'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTurnController } = require('./turn-controller.cjs');
function harness(overrides = {}) {
  let clock = 0, id = 0, stops = 0;
  const timers = new Map(), events = [], questions = [];
  const controller = createTurnController({ questionCount: 3, quietMs: 1000, hardStopMs: 150000,
    connectionMs: 25000, responseMs: 45000, now: () => clock,
    setTimer: (fn, ms) => { timers.set(++id, { fn, at: clock + ms }); return id; },
    clearTimer: timer => timers.delete(timer), onEvent: e => events.push(e),
    stopCall: () => { stops++; controller.event('call_ended'); },
    playQuestion: (index, done) => { questions.push(index); timers.set(++id, { fn: done, at: clock + 1000 }); return { stop() {} }; }, ...overrides });
  function tick(ms) {
    const end = clock + ms;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      clock = next[1].at; timers.delete(next[0]); next[1].fn();
    }
    clock = end;
  }
  function greeting() { controller.event('call_started'); controller.event('agent_start_talking'); tick(1000); controller.event('agent_stop_talking'); tick(1000); }
  function reply() { tick(1000); controller.event('agent_start_talking'); tick(1000); controller.event('agent_stop_talking'); tick(1000); }
  return { controller, tick, greeting, reply, questions, events, timers, stops: () => stops };
}
test('late connection and stopped greeting gate first question', async () => {
  const h = harness(); h.tick(20000); assert.deepEqual(h.questions, []);
  h.controller.event('agent_stop_talking'); assert.deepEqual(h.questions, []);
  h.controller.event('call_started'); h.tick(10000); assert.deepEqual(h.questions, []);
  h.controller.event('agent_start_talking'); h.tick(4000); h.controller.event('agent_stop_talking');
  h.tick(999); assert.deepEqual(h.questions, []); h.tick(1); assert.deepEqual(h.questions, [0]); h.controller.abort();
  assert.equal((await h.controller.done).pendingTimers, 0);
});
test('long multichunk response and resumed speech cancel quiet advancement', async () => {
  const h = harness(); h.greeting(); h.tick(1000); h.controller.event('agent_start_talking'); h.tick(60000);
  assert.deepEqual(h.questions, [0]); h.controller.event('agent_stop_talking'); h.tick(800);
  h.controller.event('agent_start_talking'); h.tick(10000); assert.deepEqual(h.questions, [0]);
  h.controller.event('agent_stop_talking'); h.tick(999); assert.deepEqual(h.questions, [0]);
  h.tick(1); assert.deepEqual(h.questions, [0, 1]); h.controller.abort(); await h.controller.done;
});
test('final reply completes before stopCall, with no leftover controller timers', async () => {
  const h = harness(); h.greeting(); h.reply(); h.reply(); assert.equal(h.stops(), 0);
  h.tick(1000); h.controller.event('agent_start_talking'); h.tick(2000);
  h.controller.event('agent_stop_talking'); h.tick(999); assert.equal(h.stops(), 0); h.tick(1);
  assert.deepEqual(await h.controller.done, { complete: true, reason: 'final_reply_complete', completedQuestions: 3, questionCount: 3, pendingTimers: 0 });
  assert.equal(h.stops(), 1); assert.equal(h.timers.size, 0);
});
test('missing stop event cannot advance and hard cutoff fails completeness', async () => {
  const h = harness(); h.greeting(); h.tick(1000); h.controller.event('agent_start_talking'); h.tick(147000);
  assert.deepEqual(h.questions, [0]); assert.equal((await h.controller.done).reason, 'hard_cutoff');
  assert.equal(h.controller.snapshot().completedQuestions, 0); assert.equal(h.timers.size, 0);
});
test('SDK error stops once and cancels pending quiet timer', async () => {
  const h = harness(); h.controller.event('call_started'); h.controller.event('agent_start_talking'); h.controller.event('agent_stop_talking');
  h.controller.event('error'); h.tick(150000);
  assert.equal((await h.controller.done).reason, 'sdk_error'); assert.deepEqual(h.questions, []); assert.equal(h.stops(), 1); assert.equal(h.timers.size, 0);
});
test('missing greeting and connection each fail without playing question', async () => {
  const first = harness(); first.tick(25000); assert.equal((await first.controller.done).reason, 'connection_timeout');
  const second = harness(); second.controller.event('call_started'); second.tick(45000);
  assert.equal((await second.controller.done).reason, 'greeting_timeout'); assert.deepEqual(second.questions, []);
});
test('agent speech during question playback fails incomplete and stops the question', async () => {
  let questionStops = 0;
  const h = harness({ playQuestion: () => ({ stop() { questionStops++; } }) });
  h.greeting(); assert.equal(h.controller.snapshot().state, 'question_playing');
  h.controller.event('agent_start_talking');
  assert.equal((await h.controller.done).reason, 'question_agent_overlap');
  assert.equal(h.controller.snapshot().completedQuestions, 0); assert.equal(questionStops, 1);
  assert.equal(h.stops(), 1); assert.equal(h.timers.size, 0);
});
test('missing response fails without mistaking silence for reply', async () => {
  const h = harness(); h.greeting(); h.tick(46000);
  assert.equal((await h.controller.done).reason, 'response_timeout'); assert.deepEqual(h.questions, [0]); assert.equal(h.timers.size, 0);
});
test('premature provider end fails completeness and hard duration is capped at 150 seconds', async () => {
  const h = harness(); h.greeting(); h.controller.event('call_ended'); assert.equal((await h.controller.done).complete, false);
  const capped = harness({ hardStopMs: 999999, connectionMs: 999999 }); capped.tick(150000);
  assert.equal((await capped.controller.done).reason, 'hard_cutoff'); assert.deepEqual(capped.questions, []);
});
