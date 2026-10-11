'use strict';

// Self-contained so exactly the tested controller can run in the capture browser.
function createTurnController(options) {
  const { questionCount, playQuestion, stopCall, onEvent = () => {},
    setTimer = setTimeout, clearTimer = clearTimeout, now = Date.now,
    quietMs = 1200, hardStopMs = 150000, connectionMs = 25000,
    responseMs = 45000 } = options;
  if (!Number.isInteger(questionCount) || questionCount < 1) throw Error('Questions required');
  const began = now(), timers = new Set();
  let state = 'connecting', index = -1, started = false, speaking = false;
  let greetingSeen = false, replySeen = false, completed = 0, terminal = false;
  let quietTimer, responseTimer, connectionTimer, activeSource;
  let resolveDone;
  const done = new Promise(resolve => { resolveDone = resolve; });
  const emit = (event, details = {}) => onEvent({ event, state, index, time: now() - began, ...details });
  function schedule(fn, ms) {
    const timer = setTimer(() => { timers.delete(timer); fn(); }, ms);
    timers.add(timer); return timer;
  }
  function cancel(timer) { if (timer !== undefined) { clearTimer(timer); timers.delete(timer); } }
  function finish(reason, complete = false) {
    if (terminal) return;
    terminal = true; state = complete ? 'complete' : 'failed';
    for (const timer of timers) clearTimer(timer);
    timers.clear();
    if (activeSource) { try { activeSource.stop(); } catch {} activeSource = undefined; }
    emit(reason, { complete, completedQuestions: completed });
    try { stopCall(); } catch { emit('stop_call_error'); }
    resolveDone({ complete, reason, completedQuestions: completed, questionCount, pendingTimers: timers.size });
  }
  function nextQuestion() {
    if (terminal) return;
    if (index >= 0) { completed++; emit('reply_complete'); }
    if (completed === questionCount) return finish('final_reply_complete', true);
    index++; replySeen = false; state = 'question_playing'; emit('question_started');
    try {
      activeSource = playQuestion(index, () => {
        if (terminal) return;
        activeSource = undefined;
        state = speaking ? 'agent_speaking' : 'awaiting_agent'; emit('question_finished');
        if (!speaking) responseTimer = schedule(() => finish('response_timeout'), responseMs);
        if (replySeen && !speaking) debounce();
      });
    } catch { finish('question_playback_error'); }
  }
  function debounce() {
    cancel(quietTimer);
    if (terminal || state === 'question_playing' || !started || speaking) return;
    if (index === -1 && !greetingSeen) return;
    if (index >= 0 && !replySeen) return;
    state = 'debounced_stop'; emit('quiet_wait');
    quietTimer = schedule(() => {
      if (!speaking && !terminal) { cancel(responseTimer); nextQuestion(); }
    }, quietMs);
  }
  function event(name) {
    if (terminal) return;
    emit(name);
    if (name === 'call_started') {
      if (started) return;
      started = true; cancel(connectionTimer); state = 'greeting';
      responseTimer = schedule(() => finish('greeting_timeout'), responseMs);
    } else if (name === 'agent_start_talking') {
      if (state === 'question_playing') return finish('question_agent_overlap');
      speaking = true; cancel(quietTimer); cancel(responseTimer);
      if (started) { if (index < 0) greetingSeen = true; else replySeen = true; }
      if (state !== 'question_playing' && started) state = 'agent_speaking';
    } else if (name === 'agent_stop_talking') {
      speaking = false; debounce();
    } else if (name === 'call_ended') finish('premature_call_end');
    else if (name === 'error') finish('sdk_error');
  }
  schedule(() => finish('hard_cutoff'), Math.min(hardStopMs, 150000));
  connectionTimer = schedule(() => finish('connection_timeout'), connectionMs);
  return { event, done, abort: () => finish('aborted'), snapshot: () => ({ state, index, started,
    speaking, completedQuestions: completed, terminal, pendingTimers: timers.size }) };
}
module.exports = { createTurnController };
