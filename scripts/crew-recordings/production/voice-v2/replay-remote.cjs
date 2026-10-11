'use strict';
// Offline diagnostic for an already captured remote-only failed greeting. Never
// invoke SDK/startCall and never alter the historical attempt or its evidence.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { createRemoteActivityDetector } = require('./remote-activity.cjs');
async function main() {
  const root = path.resolve(__dirname, '../../../..');
  const input = path.resolve(process.argv[2] || path.join(root, 'voice-samples/production-v2/recordings/concierge/mixed-audio.webm'));
  const evidence = JSON.parse(fs.readFileSync(path.join(path.dirname(input), 'capture-evidence.json'), 'utf8'));
  assert.equal(evidence.completedQuestions, 0);
  assert.equal(evidence.events.some(item => ['question_started', 'question_audio'].includes(item.event)), false);
  assert.ok(evidence.remoteTracks > 0);
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/A-Problem/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || 'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe' });
  try {
    const page = await browser.newPage(); await page.route('**/*', route => route.abort());
    const result = await page.evaluate(async ({ data, detectorSource }) => {
      const bytes = Uint8Array.from(atob(data), ch => ch.charCodeAt(0)), audio = new AudioContext({ sampleRate: 48000 });
      const decoded = await audio.decodeAudioData(bytes.buffer); await audio.close();
      const offline = new OfflineAudioContext(1, decoded.length, decoded.sampleRate), source = offline.createBufferSource(), filter = offline.createBiquadFilter();
      filter.type = 'highpass'; filter.frequency.value = 180; source.buffer = decoded; source.connect(filter); filter.connect(offline.destination); source.start();
      const rendered = await offline.startRendering(), samples = rendered.getChannelData(0), events = [];
      const detector = (0, eval)(`(${detectorSource})`)({ onEvent: (event, details) => events.push({ event, ...details }) });
      const step = Math.round(rendered.sampleRate * .02), windowSamples = 2048;
      for (let i = 0; i < samples.length; i += step) {
        let energy = 0; for (let j = Math.max(0, i - windowSamples); j < i; j++) energy += samples[j] * samples[j];
        detector.sample(Math.sqrt(energy / windowSamples), i * 1000 / rendered.sampleRate);
      }
      detector.dispose(); return { decodedSeconds: decoded.duration, events, disposed: detector.snapshot().disposed };
    }, { data: fs.readFileSync(input).toString('base64'), detectorSource: createRemoteActivityDetector.toString() });
    assert.ok(result.events.some(event => event.event === 'agent_start_talking'));
    assert.ok(result.events.some(event => event.event === 'agent_stop_talking'));
    const output = { pass: true, providerCalls: 0, remoteOnlyVerified: true, ...result };
    const outputDir = path.join(root, 'voice-samples/production-v2/preflight'); fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'remote-replay-evidence.json'), JSON.stringify(output, null, 2));
    console.log(JSON.stringify({ pass: true, providerCalls: 0, decodedSeconds: result.decodedSeconds,
      speechStarts: result.events.filter(event => event.event === 'agent_start_talking').length,
      speechStops: result.events.filter(event => event.event === 'agent_stop_talking').length,
      firstOnsetMs: result.events[0].time, disposed: result.disposed }));
  } finally { await browser.close(); }
}
main().catch(() => { console.error('Offline remote replay failed'); process.exitCode = 1; });
