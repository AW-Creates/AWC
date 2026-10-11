'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createTurnController } = require('./turn-controller.cjs');
const playwrightPath = process.env.PLAYWRIGHT_MODULE || 'C:/Users/A-Problem/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const sdkRoot = process.env.AWC_NODE_MODULES || 'C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC/website-receptionist/node_modules';
const assets = { 'event.js': 'eventemitter3/dist/eventemitter3.umd.js', 'livekit.js': 'livekit-client/dist/livekit-client.umd.js', 'retell.js': 'retell-client-js-sdk/dist/index.umd.js' };
const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

async function captureSession(session) {
  const maxSeconds = session.maxSeconds === undefined ? 150 : session.maxSeconds;
  if (typeof maxSeconds !== 'number' || !Number.isFinite(maxSeconds) || maxSeconds <= 0 || maxSeconds > 150) throw Error('maxSeconds must be finite, positive and at most 150');
  // Decode all inputs before obtaining any provider session. Never create/retry calls here.
  if (!Array.isArray(session.questionClips) || !session.questionClips.length) throw Error('questionClips required');
  const clips = session.questionClips.map(clip => {
    if (typeof clip.text !== 'string' || !clip.text.trim() || !clip.wavPath) throw Error('Question text and WAV required');
    const data = fs.readFileSync(clip.wavPath);
    if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WAVE') throw Error('Question input must be WAV');
    return { text: clip.text, audio: data.toString('base64'), sha256: crypto.createHash('sha256').update(data).digest('hex') };
  });
  const out = path.resolve(session.outputDir);
  // Keep raw recordings and transcript evidence in an ignored private media directory.
  const repositoryRoot = path.resolve(__dirname, '../../../..');
  const relativeOut = path.relative(repositoryRoot, out);
  if (relativeOut.startsWith('..') || path.isAbsolute(relativeOut) || relativeOut.split(path.sep)[0] !== 'voice-samples') throw Error('Canonical ignored voice-samples output directory required');
  fs.mkdirSync(out, { recursive: true });
  const { chromium } = require(playwrightPath);
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || 'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe', args: ['--autoplay-policy=no-user-gesture-required'] });
  let context;
  try {
    context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: out, size: { width: 1280, height: 720 } } });
    const screenStartedAt = Date.now(), page = await context.newPage(), errors = [];
    page.on('pageerror', () => errors.push('Browser script error'));
    let blockedRequests = 0;
    if (session.preflightOnly) await context.route('**/*', route => {
      if (route.request().url().startsWith('http://127.0.0.1:4199/')) return route.continue();
      blockedRequests++; return route.abort();
    });
    await page.route('http://127.0.0.1:4199/capture-assets/**', route => {
      const file = assets[new URL(route.request().url()).pathname.split('/').pop()];
      return route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(sdkRoot, file), 'utf8') });
    });
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:44px 60px;background:#111114;color:#f3f0ed;font:18px system-ui}small,#state{color:#ef5266}h1{font:52px Georgia;margin:22px 0 8px}h2{font-size:18px;font-weight:400;color:#c7c3c6}.panel{border:1px solid #45454b;border-radius:14px;padding:22px;background:#1e1e23}#transcript{height:180px;overflow:auto;line-height:1.55;white-space:pre-wrap}canvas{width:100%;height:64px}.disclosure{font-size:14px;color:#c7c3c6;line-height:1.6}</style></head><body><small>A. Wilcher Creatives · Recorded demonstration</small><h1>${escape(session.name)}</h1><h2>${escape(session.role)} · AWC’s example specialist</h2><p>${escape(session.purpose)} Your Crew is custom-designed around your business, responsibilities, names and approved tools.</p><div class="panel"><p id="state">Preparing authentic conversation…</p><canvas id="waveform" width="1080" height="64" aria-label="Actual recorded audio activity"></canvas><div id="transcript" role="log"></div></div><p class="disclosure">Automated specialist · Genuine provider conversation with synthetic spoken questions. Tools and client accounts are unconnected; the studio confirms requests. Playback does not start a provider call.</p><script src="/capture-assets/event.js"></script><script>window.eventemitter3=window.EventEmitter3</script><script src="/capture-assets/livekit.js"></script><script>window.livekitClient=window.LivekitClient</script><script src="/capture-assets/retell.js"></script></body></html>`;
    await page.route('http://127.0.0.1:4199/recording', r => r.fulfill({ contentType: 'text/html', body: html }));
    await page.goto('http://127.0.0.1:4199/recording');
    await page.evaluate(async input => {
      const audio = new AudioContext({ sampleRate: 48000 });
      const mix = audio.createMediaStreamDestination(), mic = audio.createMediaStreamDestination(), gain = audio.createGain();
      gain.gain.value = .55; gain.connect(mix);
      const c = window.__capture = { audio, mix, mic, gain, clips: [], chunks: [], events: [], updates: [], remoteTracks: 0, sources: [], peers: [], syntheticTimers: [] };
      const seen = new Set();
      function captureTrack(stream) {
        for (const track of stream.getAudioTracks()) {
          if (seen.has(track.id)) continue;
          seen.add(track.id); const source = audio.createMediaStreamSource(new MediaStream([track]));
          source.connect(gain); c.sources.push(source); c.remoteTracks++;
        }
      }
      const OriginalPC = window.RTCPeerConnection;
      window.RTCPeerConnection = new Proxy(OriginalPC, { construct(Target, args) {
        const pc = new Target(...args); c.peers.push(pc);
        pc.addEventListener('track', e => { if (e.track.kind === 'audio') captureTrack(new MediaStream([e.track])); }); return pc;
      } });
      if (!isSecureContext || !navigator.mediaDevices) throw Error('Secure media context required');
      const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'srcObject');
      Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', { ...descriptor, set(stream) { if (stream instanceof MediaStream) captureTrack(stream); descriptor.set.call(this, stream); } });
      navigator.mediaDevices.getUserMedia = async () => new MediaStream(mic.stream.getAudioTracks().map(track => track.clone()));
      for (const clip of input) {
        const bytes = Uint8Array.from(atob(clip.audio), ch => ch.charCodeAt(0));
        const buffer = await audio.decodeAudioData(bytes.buffer);
        if (!buffer.duration || buffer.duration > 150) throw Error('Invalid question duration');
        c.clips.push({ text: clip.text, buffer, sha256: clip.sha256 });
      }
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw Error('Audio recorder unsupported');
      c.recorder = new MediaRecorder(mix.stream, { mimeType, audioBitsPerSecond: 128000 });
      c.recorder.ondataavailable = e => { if (e.data.size) c.chunks.push(e.data); };
    }, clips);
    const ready = await page.evaluate(() => ({ secure: isSecureContext, recorder: !!window.__capture.recorder,
      sdk: !!window.retellClientJsSdk?.RetellWebClient,
      clips: window.__capture.clips.map(clip => ({ text: clip.text, sha256: clip.sha256, durationSeconds: clip.buffer.duration })) }));
    if (!ready.secure || !ready.recorder || !ready.sdk) throw Error('Readiness failed');
    if (ready.clips.reduce((seconds, clip) => seconds + clip.durationSeconds, 0) >= maxSeconds) throw Error('Question audio exceeds session duration budget');
    // Offline mode cannot invoke sessionFactory, consume credentials, or instantiate the real SDK.
    if (!session.preflightOnly && typeof session.sessionFactory === 'function') session = { ...session, ...await session.sessionFactory({ browserReady: true, captureReady: true, ready }) };
    if (!session.preflightOnly && (!session.access_token || !session.call_id)) throw Error('Authorized in-memory session required');
    const startedAt = Date.now();
    await page.evaluate(({ source, config }) => {
      const c = window.__capture, createController = (0, eval)(`(${source})`); c.startTime = performance.now();
      const state = document.getElementById('state'), transcript = document.getElementById('transcript');
      c.controller = createController({ questionCount: c.clips.length,
        quietMs: config.preflightOnly ? 35 : (config.quietMs || 1200),
        hardStopMs: config.preflightOnly ? 3500 : Math.min(config.maxSeconds * 1000 || 150000, 150000),
        connectionMs: config.preflightOnly ? 1500 : 25000, responseMs: config.preflightOnly ? 1200 : 45000,
        now: () => performance.now(), onEvent: e => { c.events.push(e); state.textContent = e.state.replaceAll('_', ' '); },
        stopCall: () => c.client?.stopCall(),
        playQuestion: (index, onEnded) => {
          const clip = c.clips[index], source = c.audio.createBufferSource(); source.buffer = clip.buffer;
          // Exactly one decoded source feeds both provider microphone and recorded mix.
          source.connect(c.mic); source.connect(c.gain);
          source.onended = () => { source.disconnect(); onEnded(); };
          transcript.textContent = `Demonstrator question:\n${clip.text}\n\nListen to the specialist’s actual reply.`;
          c.events.push({ event: 'question_audio', index, sha256: clip.sha256, durationSeconds: clip.buffer.duration });
          source.start();
          if (config.preflightOnly) {
            const delay = clip.buffer.duration * 1000;
            c.syntheticTimers.push(setTimeout(() => c.client.emit('agent_start_talking'), delay + 20));
            c.syntheticTimers.push(setTimeout(() => c.client.emit('agent_stop_talking'), delay + 100));
          }
          return source;
        }
      });
      c.client = config.preflightOnly ? new (class extends window.EventEmitter3 {
        async startCall() {
          await new Promise(resolve => { c.syntheticTimers.push(setTimeout(resolve, 200)); });
          if (c.controller.snapshot().terminal) return;
          const remote = c.audio.createMediaStreamDestination(), oscillator = c.audio.createOscillator();
          oscillator.frequency.value = 440; oscillator.connect(remote); oscillator.start(); c.oscillator = oscillator;
          const pc = new RTCPeerConnection(), transceiver = pc.addTransceiver('audio');
          pc.dispatchEvent(new RTCTrackEvent('track', { track: remote.stream.getAudioTracks()[0], receiver: transceiver.receiver, transceiver, streams: [remote.stream] }));
          this.emit('call_started'); this.emit('agent_start_talking');
          c.syntheticTimers.push(setTimeout(() => this.emit('agent_stop_talking'), 100));
        }
        stopCall() { c.oscillator?.stop(); this.emit('call_ended'); }
      })() : new window.retellClientJsSdk.RetellWebClient();
      for (const event of ['call_started', 'agent_start_talking', 'agent_stop_talking', 'call_ended', 'error']) c.client.on(event, () => c.controller.event(event));
      c.client.on('update', data => { c.updates.push(data); if (Array.isArray(data.transcript)) transcript.textContent = data.transcript.map(t => `${t.role === 'agent' ? config.name : 'Demonstrator'}: ${t.content}`).join('\n\n'); });
      const analyser = c.audio.createAnalyser(); analyser.fftSize = 512; c.audio.createMediaStreamSource(c.mix.stream).connect(analyser);
      const canvas = document.getElementById('waveform'), draw = canvas.getContext('2d'), samples = new Uint8Array(analyser.fftSize);
      function frame() { analyser.getByteTimeDomainData(samples); draw.clearRect(0, 0, canvas.width, canvas.height); draw.strokeStyle = '#ed5265'; draw.beginPath(); samples.forEach((v, i) => { const x = i * canvas.width / samples.length, y = v * canvas.height / 256; i ? draw.lineTo(x, y) : draw.moveTo(x, y); }); draw.stroke(); if (!c.controller.snapshot().terminal) c.waveFrame = requestAnimationFrame(frame); }
      c.audio.resume().then(() => {
        if (c.controller.snapshot().terminal) return;
        c.recorder.start(250); frame();
        // SDK connection promises may remain pending after stopCall; event/watchdog control is authoritative.
        Promise.resolve(c.client.startCall({ accessToken: config.access_token, callId: config.call_id, transport: config.transport, iceServers: config.ice_servers, emitRawAudioSamples: false })).catch(() => c.controller.event('error'));
      }).catch(() => c.controller.event('error'));
      c.controller.done.then(result => { c.result = result; });
    }, { source: createTurnController.toString(), config: { preflightOnly: !!session.preflightOnly, maxSeconds, quietMs: session.quietMs, name: session.name, access_token: session.preflightOnly ? undefined : session.access_token, call_id: session.preflightOnly ? undefined : session.call_id, transport: session.transport, ice_servers: session.ice_servers } });
    try { await page.waitForFunction(() => !!window.__capture.result, null, { timeout: session.preflightOnly ? 5500 : 153000 }); }
    catch { await page.evaluate(() => window.__capture.controller.abort()); }
    const result = await page.evaluate(async () => {
      const c = window.__capture; cancelAnimationFrame(c.waveFrame);
      for (const timer of c.syntheticTimers) clearTimeout(timer);
      if (c.recorder.state !== 'inactive') await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('Recorder stop timeout')), 2000);
        c.recorder.onstop = () => { clearTimeout(timer); resolve(); }; c.recorder.stop();
      });
      for (const pc of c.peers) pc.close();
      for (const source of c.sources) source.disconnect();
      for (const stream of [c.mic.stream, c.mix.stream]) stream.getTracks().forEach(track => track.stop());
      const blob = new Blob(c.chunks, { type: c.recorder.mimeType }), bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = ''; for (let i = 0; i < bytes.length; i += 16384) binary += String.fromCharCode(...bytes.slice(i, i + 16384));
      let recordedAudio = { decoded: false, durationSeconds: 0, rms: 0, peak: 0 };
      try {
        const decoded = await c.audio.decodeAudioData(bytes.buffer.slice(0)), signal = decoded.getChannelData(0);
        let energy = 0, peak = 0; for (const value of signal) { energy += value * value; peak = Math.max(peak, Math.abs(value)); }
        recordedAudio = { decoded: true, durationSeconds: decoded.duration, rms: Math.sqrt(energy / signal.length), peak };
      } catch { c.events.push({ event: 'recorded_audio_decode_failed' }); }
      await c.audio.close();
      return { ...c.result, durationSeconds: (performance.now() - c.startTime) / 1000, remoteTracks: c.remoteTracks, events: c.events, updates: c.updates,
        recordedAudio, audio: btoa(binary) };
    });
    fs.writeFileSync(path.join(out, 'mixed-audio.webm'), Buffer.from(result.audio, 'base64')); delete result.audio;
    const evidence = { ...result, ready, startedAt, videoLeadInSeconds: (startedAt - screenStartedAt) / 1000, errors,
      providerCalls: session.preflightOnly ? 0 : 1, blockedRequests,
      screen: 'Actual browser recording; identical question source into microphone and received remote track mix' };
    fs.writeFileSync(path.join(out, 'capture-evidence.json'), JSON.stringify(evidence, null, 2));
    const video = page.video(); await page.screenshot({ path: path.join(out, 'capture-final.png') });
    await context.close(); context = undefined; await video.saveAs(path.join(out, 'screen.webm'));
    if (!result.complete || !result.remoteTracks || errors.length || result.recordedAudio.rms < .00001 || blockedRequests) throw Error(`Capture failed acceptance: ${result.reason}`);
    return { pass: true, ...evidence };
  } finally { if (context) await context.close().catch(() => {}); await browser.close().catch(() => {}); }
}
module.exports = { captureSession };
if (require.main === module) {
  let input = ''; process.stdin.setEncoding('utf8'); process.stdin.on('data', chunk => input += chunk);
  process.stdin.on('end', () => captureSession(JSON.parse(input)).then(result => console.log(JSON.stringify(result))).catch(() => { console.error('Capture failed; no automatic retry.'); process.exitCode = 1; }));
}
