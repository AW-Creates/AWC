'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { createRemoteActivityDetector } = require('./remote-activity.cjs');
test('comfort noise and short spikes cannot begin speech; onset needs sustained energy', () => {
  const events = [], d = createRemoteActivityDetector({ onEvent: e => events.push(e) });
  for (let t = 0; t < 2000; t += 20) d.sample(.002, t);
  d.sample(.042, 2000); d.sample(.042, 2080); assert.deepEqual(events, []);
  d.sample(.002, 2090); d.sample(.042, 2100); d.sample(.042, 2200);
  assert.deepEqual(events, ['agent_start_talking']);
});
test('650ms sustained silence stops, brief pauses and resumed chunks do not', () => {
  const events = [], d = createRemoteActivityDetector({ onEvent: e => events.push(e) });
  d.sample(.042, 0); d.sample(.042, 100); d.sample(.002, 200); d.sample(.002, 800);
  assert.deepEqual(events, ['agent_start_talking']); d.sample(.042, 820); d.sample(.002, 1000);
  d.sample(.002, 1649); assert.equal(events.length, 1); d.sample(.002, 1650);
  assert.deepEqual(events, ['agent_start_talking', 'agent_stop_talking']);
});
test('hysteresis keeps modest speech active; disposed detector never emits', () => {
  const events = [], d = createRemoteActivityDetector({ onEvent: e => events.push(e) });
  d.sample(.042, 0); d.sample(.042, 100); d.sample(.008, 200); d.sample(.008, 10000);
  assert.equal(events.length, 1); d.dispose(); d.sample(0, 11000); d.sample(0, 12000);
  assert.equal(events.length, 1); assert.equal(d.snapshot().disposed, true);
});
