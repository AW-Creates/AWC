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
  const tests = spawnSync(process.execPath, ['--test', path.join(__dirname, 'turn-controller.test.cjs')], { encoding: 'utf8' });
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
  const evidence = await captureSession({ preflightOnly: true, name: 'Offline capture check', role: 'Synthetic SDK/WebRTC pipeline test', purpose: 'No provider calls.', questionClips, outputDir,
    sessionFactory: () => { throw Error('Offline mode invoked provider factory'); } });
  console.log(JSON.stringify({ pass: true, providerCalls: evidence.providerCalls, completedQuestions: evidence.completedQuestions,
    decodedClips: evidence.ready.clips.length, remoteTracks: evidence.remoteTracks, recordedAudio: evidence.recordedAudio,
    blockedRequests: evidence.blockedRequests, pendingTimers: evidence.pendingTimers }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
