'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { captureSession } = require('./capture-session.cjs');
const assert = require('node:assert/strict');
function wav(frequency) {
  const rate = 24000, count = rate / 5, data = Buffer.alloc(44 + count * 2);
  data.write('RIFF', 0); data.writeUInt32LE(data.length - 8, 4); data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) data.writeInt16LE(Math.round(3000 * Math.sin(2 * Math.PI * frequency * i / rate)), 44 + i * 2);
  return data;
}
async function main() {
  const tests = spawnSync(process.execPath, ['--test', path.join(__dirname, 'turn-controller.test.cjs'), path.join(__dirname, 'remote-activity.test.cjs')], { encoding: 'utf8' });
  process.stdout.write(tests.stdout); process.stderr.write(tests.stderr);
  if (tests.status !== 0) throw Error('Controller tests failed');
  const root = path.resolve(__dirname, '../../../..'), outputDir = path.join(root, 'voice-samples/production-v2/preflight');
  fs.mkdirSync(outputDir, { recursive: true });
  const questionClips = [660, 880, 1100].map((frequency, i) => {
    const wavPath = path.join(outputDir, `offline-question-${i + 1}.wav`); fs.writeFileSync(wavPath, wav(frequency));
    return { text: `Offline synthetic question ${i + 1}`, wavPath };
  });
  for (const maxSeconds of [0, -1, 151, Infinity, NaN, '150']) {
    await assert.rejects(captureSession({ maxSeconds }), /maxSeconds must be finite/);
  }
  let factoryCalls = 0;
  await assert.rejects(captureSession({ maxSeconds: .5, questionClips, outputDir,
    sessionFactory: () => { factoryCalls++; throw Error('Duration check reached factory'); } }), /Question audio exceeds session duration budget/);
  assert.equal(factoryCalls, 0);
  let monitorClosed = false;
  const nodeOnlySecret = 'offline-private-key-never-in-browser';
  const evidence = await captureSession({ preflightOnly: true, name: 'Offline capture check', role: 'Synthetic SDK/WebRTC pipeline test', purpose: 'No provider calls.', questionClips, outputDir,
    offlineMonitorFactory: ({ callId, onTranscript }) => {
      assert.equal(callId, 'offline-no-provider'); assert.ok(nodeOnlySecret);
      onTranscript([{ id: 'offline-1', role: 'agent', content: 'Offline transcript callback', time_sec: 0 }], { received_at_ms: 1234 });
      return { readyPromise: Promise.resolve(), close() { monitorClosed = true; } };
    },
    sessionFactory: () => { throw Error('Offline mode invoked provider factory'); } });
  assert.equal(evidence.speechAuthority, 'remote_audio'); assert.equal(evidence.updates.filter(item => item.source !== 'transcript_monitor').length, 0);
  assert.equal(monitorClosed, true); assert.equal(evidence.updates[0].transcript[0].id, 'offline-1');
  assert.equal(evidence.updates[0].received_at_ms, 1234); assert.equal(JSON.stringify(evidence).includes(nodeOnlySecret), false);
  assert.equal(evidence.events.filter(event => event.event === 'sdk_speech_ignored').length, 0);
  assert.equal(evidence.events.filter(event => event.event === 'remote_activity' && event.speechEvent === 'agent_start_talking').length, 8);
  assert.equal(evidence.remoteActivityDisposed, true);
  for (const [offlineScenario, reason] of [['silent', 'greeting_timeout'], ['missing_stop', 'hard_cutoff'], ['overlap', 'question_agent_overlap']]) {
    const scenarioOutput = path.join(outputDir, offlineScenario);
    await assert.rejects(captureSession({ preflightOnly: true, offlineScenario, name: 'Offline failure guard', questionClips, outputDir: scenarioOutput }), new RegExp(reason));
    const failure = JSON.parse(fs.readFileSync(path.join(scenarioOutput, 'capture-evidence.json'), 'utf8'));
    assert.equal(failure.complete, false); assert.equal(failure.reason, reason); assert.equal(failure.providerCalls, 0);
    assert.equal(failure.pendingTimers, 0); assert.equal(failure.remoteActivityDisposed, true);
    if (offlineScenario === 'silent') assert.equal(failure.events.filter(event => event.event === 'question_started').length, 0);
  }
  for (const failureKind of ['onError', 'onEnd', 'readyPromise']) {
    const scenarioOutput = path.join(outputDir, `monitor-${failureKind}`);
    let closed = false;
    await assert.rejects(captureSession({ preflightOnly: true, requireTranscriptMonitor: true, name: 'Offline monitor failure', questionClips, outputDir: scenarioOutput,
      offlineMonitorFactory: callbacks => {
        if (failureKind !== 'readyPromise') callbacks[failureKind]({ code: 'offline_failure' });
        return { readyPromise: failureKind === 'readyPromise' ? Promise.reject(Error('offline_failure')) : Promise.resolve(), close() { closed = true; } };
      } }), /sdk_error/);
    assert.equal(closed, true);
    const failure = JSON.parse(fs.readFileSync(path.join(scenarioOutput, 'capture-evidence.json'), 'utf8'));
    assert.equal(failure.complete, false); assert.equal(failure.providerCalls, 0); assert.equal(failure.pendingTimers, 0);
  }
  let optionalFactories = 0, optionalClosed = false;
  const optional = await captureSession({ preflightOnly: true, name: 'Offline optional monitor failure', questionClips, outputDir: path.join(outputDir, 'monitor-optional'),
    offlineMonitorFactory: ({ onError }) => {
      optionalFactories++; onError({ code: 'call_not_ongoing', message: nodeOnlySecret });
      return { readyPromise: Promise.reject(Object.assign(Error(nodeOnlySecret), { code: 'call_not_ongoing' })), close() { optionalClosed = true; } };
    } });
  assert.equal(optional.complete, true); assert.equal(optional.completedQuestions, 3); assert.equal(optional.remoteTracks, 1);
  assert.equal(optional.monitor_available, false); assert.equal(optional.monitor_status, 'unavailable'); assert.equal(optional.monitor_error, 'call_not_ongoing');
  assert.equal(optionalFactories, 1); assert.equal(optionalClosed, true); assert.equal(JSON.stringify(optional).includes(nodeOnlySecret), false);
  assert.equal(optional.providerCalls, 0); assert.equal(optional.pendingTimers, 0);
  console.log(JSON.stringify({ pass: true, providerCalls: evidence.providerCalls, completedQuestions: evidence.completedQuestions,
    decodedClips: evidence.ready.clips.length, remoteTracks: evidence.remoteTracks, recordedAudio: evidence.recordedAudio,
    blockedRequests: evidence.blockedRequests, pendingTimers: evidence.pendingTimers, speechAuthority: evidence.speechAuthority,
    sdkSpeechEvents: 0, sdkUpdates: evidence.updates.filter(item => item.source !== 'transcript_monitor').length, browserFailureGuards: 6, monitorCallbackVerified: true,
    optionalMonitorFailureCompleted: optional.complete, optionalMonitorFactoryCalls: optionalFactories, optionalMonitorCode: optional.monitor_error }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
