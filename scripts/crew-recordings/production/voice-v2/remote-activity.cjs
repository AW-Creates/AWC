'use strict';
// Pure activity detector shared by deterministic tests and the browser. Audio must
// come from received remote tracks only; never use the presenter/mixed recorder.
function createRemoteActivityDetector({ onEvent, onsetRms = .01, releaseRms = .007,
  onsetMs = 100, silenceMs = 650 }) {
  let speaking = false, onsetAt, silenceAt, disposed = false;
  function sample(rms, time) {
    if (disposed || !Number.isFinite(rms) || !Number.isFinite(time)) return;
    if (!speaking) {
      if (rms < onsetRms) { onsetAt = undefined; return; }
      if (onsetAt === undefined) onsetAt = time;
      if (time - onsetAt >= onsetMs) {
        speaking = true; silenceAt = undefined; onsetAt = undefined;
        onEvent('agent_start_talking', { source: 'remote_audio', rms, time });
      }
    } else {
      if (rms >= releaseRms) { silenceAt = undefined; return; }
      if (silenceAt === undefined) silenceAt = time;
      if (time - silenceAt >= silenceMs) {
        speaking = false; onsetAt = undefined; silenceAt = undefined;
        onEvent('agent_stop_talking', { source: 'remote_audio', rms, time });
      }
    }
  }
  return { sample, dispose() { disposed = true; onsetAt = silenceAt = undefined; },
    snapshot: () => ({ speaking, disposed }) };
}
module.exports = { createRemoteActivityDetector };
