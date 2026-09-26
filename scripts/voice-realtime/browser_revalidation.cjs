/*
 * Synthetic end-to-end acceptance proof for the local realtime laboratory.
 * It deliberately never opens a physical microphone.  Argument one is the
 * evidence directory; video, browser mixed input/output audio, screenshots,
 * and revalidation.json are written there.
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '../..');
const fixtures = path.join(root, 'docs', 'voice-bakeoff', 'evidence');
const out = path.resolve(process.argv[2] || path.join(root, '../_venture-ops/media/awc-voice-realtime-2026-09-26/automated'));
const chrome = process.env.CHROMIUM_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const deadlines = { connect: 30_000, speech: 45_000, playback: 90_000, review: 15_000 };
fs.mkdirSync(out, { recursive: true });

function fail(message, extra) { const e = new Error(message); e.extra = extra; throw e; }
function bytes(name) { return fs.readFileSync(path.join(fixtures, name)).toString('base64'); }
function normalizedWords(text) { return String(text).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' '); }

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chrome, args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, recordVideo: { dir: out, size: { width: 1280, height: 900 } } });
  const page = await context.newPage();
  const errors = [], checks = [], metrics = {}, steps = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const shot = async label => page.screenshot({ path: path.join(out, `${String(steps.length + 1).padStart(2, '0')}-${label}.png`) });
  const events = () => page.evaluate(() => window.demoEvidence.events);
  const serverEventsAfter = async after => (await events()).slice(after.eventCount).filter(e => e.kind === 'server');
  const mark = async label => ({ label, eventCount: (await events()).length, at: await page.evaluate(() => performance.now()) });
  const waitServer = async (after, predicate, timeout = deadlines.speech) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const match = (await serverEventsAfter(after)).find(predicate);
      if (match) return match;
      await page.waitForTimeout(50);
    }
    fail(`Timed out waiting for server event after ${timeout}ms`, { label: after.label, predicate: predicate.toString() });
  };
  const assert = (condition, label, detail = undefined) => {
    checks.push({ label, pass: Boolean(condition), detail });
    if (!condition) fail(label, detail);
  };
  const epochDone = async (after, epoch) => waitServer(after, e => e.event === 'audio_done' && e.epoch === epoch, deadlines.playback);
  const rendered = async (after, epoch) => {
    await page.waitForFunction(({ count, epoch }) => window.demoEvidence.audible.slice(count).some(e => e.epoch === epoch), { count: after.audibleCount, epoch }, { timeout: deadlines.playback });
    return page.evaluate(({ count, epoch }) => window.demoEvidence.audible.slice(count).find(e => e.epoch === epoch), { count: after.audibleCount, epoch });
  };
  const marker = async label => ({ ...(await mark(label)), audibleCount: await page.evaluate(() => window.demoEvidence.audible.length), interruptionCount: await page.evaluate(() => window.demoEvidence.interruptions.length) });
  const greeting = async label => {
    const before = await marker(label);
    await page.click('#greet');
    const decision = await waitServer(before, e => e.event === 'decision' && e.input === '');
    const start = await waitServer(before, e => e.event === 'audio_start' && e.epoch === decision.epoch);
    return { before, decision, start, epoch: decision.epoch };
  };
  const textTurn = async (label, text, { confirm = false, expected = [] } = {}) => {
    const before = await marker(label);
    await page.fill('#text', text); await page.click('#send');
    if (confirm) {
      await page.waitForFunction(() => !document.querySelector('#review').hidden, null, { timeout: deadlines.review });
      const review = await page.locator('#review-transcript').textContent();
      assert(review === text, `${label}: review is bound to the exact typed transcript`, { review, text });
      await shot(`${label}-review`); await page.click('#confirm');
    }
    const decision = await waitServer(before, e => e.event === 'decision' && e.input === text, deadlines.playback);
    const visual = await rendered(before, decision.epoch);
    await epochDone(before, decision.epoch);
    for (const word of expected) assert(String(decision.text).toLowerCase().includes(word.toLowerCase()), `${label}: expected response word`, { word, response: decision.text });
    metrics[label] = { request_at: before.at, decision_at: decision.at, rendered_at: visual.at, request_to_decision_ms: decision.at - before.at, request_to_rendered_ms: visual.at - before.at, epoch: decision.epoch };
    steps.push({ label, input: text, epoch: decision.epoch }); await shot(label); return decision;
  };

  try {
    await page.goto('http://127.0.0.1:8766', { waitUntil: 'networkidle', timeout: deadlines.connect });
    await page.click('#reset');
    await page.evaluate(async () => {
      window.fixtureCtx = new AudioContext(); await fixtureCtx.resume();
      window.fixtureDest = fixtureCtx.createMediaStreamDestination();
      const silence = fixtureCtx.createConstantSource(); silence.offset.value = 0; silence.connect(fixtureDest); silence.start();
      navigator.mediaDevices.getUserMedia = async () => fixtureDest.stream;
      window.injectFixture = async (base64, gainValue = 1) => {
        const audio = await fixtureCtx.decodeAudioData(Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer);
        const source = fixtureCtx.createBufferSource(), gain = fixtureCtx.createGain();
        source.buffer = audio; gain.gain.value = gainValue; source.connect(gain); gain.connect(fixtureDest);
        const started = performance.now(); source.start(); event('fixture_start', { duration_s: audio.duration, fixture_end: started + audio.duration * 1000 });
        return { started, end: started + audio.duration * 1000, duration_s: audio.duration };
      };
      window.injectBurst = () => {
        const audio = fixtureCtx.createBuffer(1, Math.floor(fixtureCtx.sampleRate * .08), fixtureCtx.sampleRate);
        audio.getChannelData(0).fill(.12); const source = fixtureCtx.createBufferSource(); source.buffer = audio; source.connect(fixtureDest);
        const started = performance.now(); source.start(); event('fixture_burst', { duration_ms: 80 }); return started;
      };
    });
    await page.click('#start');
    await page.waitForFunction(() => typeof pc !== 'undefined' && pc.connectionState === 'connected', null, { timeout: deadlines.connect });

    // A complete greeting must finish with no interruption before testing noise.
    const complete = await greeting('greeting-complete');
    await epochDone(complete.before, complete.epoch);
    assert(complete.decision.text.endsWith('?'), 'greeting: complete sentence was scheduled', complete.decision.text);
    await shot('greeting-complete');

    // The 80 ms high-energy burst is deliberately under the browser's 180 ms onset gate.
    const burst = await greeting('short-burst');
    await page.evaluate(() => injectBurst());
    await page.waitForTimeout(600);
    const interruptionsAfterBurst = await page.evaluate(count => window.demoEvidence.interruptions.slice(count), burst.before.interruptionCount);
    assert(interruptionsAfterBurst.length === 0, 'short 80ms burst did not cancel speech', interruptionsAfterBurst);
    await epochDone(burst.before, burst.epoch); await shot('short-burst-complete');

    // Inject the fictional human fixture while current speech is audible, then bind all waits to its new epoch.
    const barge = await greeting('barge-in');
    await rendered(barge.before, barge.epoch);
    const injected = await page.evaluate(payload => injectFixture(payload), bytes('human.wav'));
    const interruption = await page.waitForFunction(({ count }) => window.demoEvidence.interruptions.slice(count)[0] || null, { count: barge.before.interruptionCount }, { timeout: deadlines.speech });
    const interruptRecord = await page.evaluate(count => window.demoEvidence.interruptions.slice(count)[0], barge.before.interruptionCount);
    const interrupted = await waitServer(barge.before, e => e.event === 'interrupted' && e.epoch > barge.epoch, deadlines.speech);
    const replacementEpoch = interrupted.epoch;
    const firstPartial = await waitServer(barge.before, e => e.event === 'partial' && e.epoch === replacementEpoch, deadlines.speech);
    const endpoint = await waitServer(barge.before, e => e.event === 'endpoint' && e.epoch === replacementEpoch, deadlines.speech);
    const replacementDecision = await waitServer(barge.before, e => e.event === 'decision' && e.epoch > replacementEpoch, deadlines.playback);
    const replacementRendered = await rendered(barge.before, replacementDecision.epoch);
    assert(interruptRecord.epoch === barge.epoch, 'barge-in interrupt used the active playback epoch', { interruptRecord, expected: barge.epoch });
    metrics.barge_in = { fixture_start_to_first_partial_ms: firstPartial.at - injected.started, fixture_end_to_endpoint_ms: endpoint.at - injected.end, detection_to_mute_ms: interruptRecord.muted - interruptRecord.detected, endpoint_to_decision_ms: replacementDecision.at - endpoint.at, decision_to_rendered_ms: replacementRendered.at - replacementDecision.at, interrupted_epoch: barge.epoch, replacement_epoch: replacementDecision.epoch };
    steps.push({ label: 'fictional-human-barge-in', ...metrics.barge_in }); await shot('barge-in-replacement'); await epochDone(barge.before, replacementDecision.epoch);

    // Natural paced audio must emit a corrected/final transcript before sensitive action review.
    for (const scenario of [
      { label: 'faq-fixture', file: 'faq.wav', phrase: 'standard bright home cleaning', sensitive: false },
      { label: 'estimate-fixture', file: 'estimate.wav', phrase: 'deep clean for a three bedroom home', sensitive: true }
    ]) {
      const before = await marker(scenario.label);
      const timing = await page.evaluate(payload => injectFixture(payload), bytes(scenario.file));
      const endpointEvent = await waitServer(before, e => e.event === 'endpoint', deadlines.speech);
      const final = await waitServer(before, e => ['final', 'final_transcript', 'transcript_final', 'corrected_transcript'].includes(e.event) && typeof (e.text || e.transcript) === 'string', deadlines.playback);
      const transcript = final.text || final.transcript;
      assert(normalizedWords(transcript).includes(normalizedWords(scenario.phrase)), `${scenario.label}: corrected transcript retains required words`, { transcript, phrase: scenario.phrase });
      if (scenario.sensitive) {
        await page.waitForFunction(() => !document.querySelector('#review').hidden, null, { timeout: deadlines.review });
        const review = await page.locator('#review-transcript').textContent();
        assert(review === transcript, `${scenario.label}: action review binds corrected transcript`, { review, transcript });
        assert(await page.locator('#review-action').textContent() === 'Requested action: quote', `${scenario.label}: quote stays gated`);
        await page.click('#confirm');
      }
      const decision = await waitServer(before, e => e.event === 'decision' && e.epoch > endpointEvent.epoch && e.input === transcript, deadlines.playback);
      const visual = await rendered(before, decision.epoch); await epochDone(before, decision.epoch);
      metrics[scenario.label] = { fixture_start_to_endpoint_ms: endpointEvent.at - timing.started, endpoint_to_decision_ms: decision.at - endpointEvent.at, decision_to_rendered_ms: visual.at - decision.at, final_transcript: transcript };
      await shot(scenario.label);
    }

    await textTurn('typed-quote-225', 'Deep cleaning for three bedrooms', { confirm: true, expected: ['225 dollars'] });
    await textTurn('typed-availability', 'What slots are available?', { expected: ['2026-10-01'] });
    await textTurn('typed-booking-confirmed', 'Book the first slot', { confirm: true, expected: ['confirmation'] });
    await textTurn('typed-booking-conflict', 'Book the first slot', { confirm: true, expected: ['unavailable'] });
    await textTurn('typed-handoff', 'Sales specialist please', { expected: ['sales specialist'] });
    const beforeUnapproved = await marker('unapproved-action');
    await page.fill('#text', 'Book the second slot'); await page.click('#send');
    await page.waitForFunction(() => !document.querySelector('#review').hidden, null, { timeout: deadlines.review });
    const summaryBefore = await page.evaluate(() => fetch('/api/summary').then(r => r.json()));
    assert(summaryBefore.business.booking?.slot === '2026-10-01 10:00', 'unconfirmed booking did not mutate booking state', summaryBefore.business.booking);
    await textTurn('typed-handoff-retained', 'Human please', { expected: ['human'] });
    const summaryAfter = await page.evaluate(() => fetch('/api/summary').then(r => r.json()));
    assert(summaryAfter.business.booking?.slot === '2026-10-01 10:00', 'handoff does not perform the unconfirmed action', summaryAfter.business.booking);
    assert(summaryAfter.business.handoffs.length === 1 && summaryAfter.business.agent === 'sales specialist', 'sales handoff context remains after the later human request', { handoffs: summaryAfter.business.handoffs, agent: summaryAfter.business.agent });
    steps.push({ label: 'unapproved-action-cleared', at: beforeUnapproved.at });

    await page.click('#summary'); await shot('summary');
    const evidence = await page.evaluate(async () => ({ browser: window.demoEvidence, server: await fetch('/api/summary').then(r => r.json()), log: document.querySelector('#log').textContent }));
    evidence.mode = 'synthetic WebRTC fixtures; browser rendered-energy proxy only, no physical audibility claim';
    evidence.playback_completion = 'audio_done means the server scheduled playback completion; it is not a physical audibility measurement.';
    evidence.deadlines_ms = deadlines; evidence.metrics = metrics; evidence.checks = checks; evidence.steps = steps; evidence.errors = errors;
    fs.writeFileSync(path.join(out, 'revalidation.json'), JSON.stringify(evidence, null, 2));
    await page.click('#stop');
    await page.waitForTimeout(300);
    const audio = await page.evaluate(() => new Promise(resolve => { if (!window.recorded?.length) return resolve(null); const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(new Blob(recorded, { type: 'audio/webm' })); }));
    if (audio) fs.writeFileSync(path.join(out, 'conversation-mixed-audio.webm'), Buffer.from(audio, 'base64'));
    const video = page.video(); await context.close(); await video.saveAs(path.join(out, 'conversation-screen.webm')); await browser.close();
    console.log(JSON.stringify({ ok: true, out, checks: checks.length, metrics }));
  } catch (error) {
    const captured = await page.evaluate(async () => ({
      browser: window.demoEvidence || null,
      server: await fetch('/api/summary').then(r => r.ok ? r.json() : ({ status: r.status })).catch(e => ({ error: String(e) })),
      log: document.querySelector('#log')?.textContent || ''
    })).catch(e => ({ capture_error: String(e) }));
    await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
    const evidence = { ok: false, failure: error.message, extra: error.extra, errors, checks, metrics, steps, deadlines_ms: deadlines, ...captured };
    fs.writeFileSync(path.join(out, 'revalidation.json'), JSON.stringify(evidence, null, 2));
    await page.click('#stop').catch(() => {});
    const video = page.video();
    await context.close().catch(() => {}); await browser.close().catch(() => {});
    if (video) await video.saveAs(path.join(out, 'conversation-screen.webm')).catch(() => {});
    console.error(JSON.stringify(evidence)); process.exitCode = 1;
  }
})();
