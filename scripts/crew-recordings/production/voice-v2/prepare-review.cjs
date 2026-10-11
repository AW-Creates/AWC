'use strict';
// Private, UNREVIEWED preparation only. Never invoke acceptance/publication.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const ROLES = ['concierge','sales','scheduling','support','billing','implementation','retention'];
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = message => { throw Error(message); };
function stamp(seconds) {
  const ms = Math.round(seconds * 1000);
  return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60].map(v => String(v).padStart(2,'0')).join(':') + '.' + String(ms % 1000).padStart(3,'0');
}
function chunks(words) {
  const result = []; let current = [];
  for (const word of words) {
    if (current.length && (current.length >= 12 || [...current,word].join(' ').length > 72)) { result.push(current); current = []; }
    current.push(word);
  }
  if (current.length) result.push(current); return result;
}
function coarseCues(text, spans, speaker) {
  const words = text.replace(/\s+/g,' ').trim().split(' ');
  const duration = spans.reduce((sum,[a,b]) => sum + b - a, 0);
  if (!text.trim() || duration <= 0 || words.length < spans.length) fail('Ambiguous text/speech span mapping');
  const cues = []; let cursor = 0;
  spans.forEach(([start,end], index) => {
    const remainingSpans = spans.length - index - 1;
    const count = index === spans.length - 1 ? words.length - cursor : Math.max(1, Math.min(words.length - cursor - remainingSpans, Math.round(words.length * (end - start) / duration)));
    const pieces = chunks(words.slice(cursor,cursor+count)); cursor += count;
    let at = start;
    pieces.forEach(piece => {
      const next = at + (end - start) * piece.length / count;
      cues.push({ start: at, end: next, text: `${speaker}: ${piece.join(' ')}`, draft: true }); at = next;
    });
  });
  return cues;
}
function buildDraft({ role, evidence, ledger, binding, questions, allowanceId = 'awc_seven_custom_voice_demos_20261011' }) {
  if (!ROLES.includes(role) || binding?.role !== role || !binding.name) fail('Approved role/name binding required');
  if (evidence.complete !== true || evidence.completedQuestions !== 3 || evidence.questionCount !== 3 || evidence.providerCalls !== 1 || !Number.isFinite(evidence.remoteTracks) || evidence.remoteTracks < 1 || evidence.errors?.length || evidence.blockedRequests || evidence.recordedAudio?.decoded !== true || !Number.isFinite(evidence.recordedAudio.rms) || evidence.recordedAudio.rms < .00001 || !Number.isFinite(evidence.recordedAudio.durationSeconds) || evidence.recordedAudio.durationSeconds <= 0 || !Number.isFinite(evidence.durationSeconds) || evidence.durationSeconds <= 0 || evidence.durationSeconds > 152 || !Number.isFinite(evidence.videoLeadInSeconds) || evidence.videoLeadInSeconds < 0) fail('Complete genuine three-question source required');
  const attempts = ledger.attempts?.filter(item => item.role === role);
  if (attempts?.length !== 1) fail('Exactly one selected role attempt required');
  const attempt = attempts[0];
  if (ledger.allowance?.id !== allowanceId || ledger.allowance.seconds !== 150 || ledger.allowance.perAttemptUsd !== 1 || attempt.state !== 'reconciled' || !/^call_[A-Za-z0-9]+$/.test(attempt.call_id) || !Number.isFinite(attempt.duration_ms) || attempt.duration_ms <= 0 || attempt.duration_ms > 150000 || !Number.isFinite(attempt.cost_usd) || attempt.cost_usd < 0 || attempt.cost_usd > 1 || attempt.agent_id !== binding.agent_id || attempt.agent_version !== binding.agent_version || attempt.voice_id !== binding.voice_id) fail('Matched reconciled pinned role attempt required');
  const selected = questions.filter(item => item.role === role).sort((a,b) => a.index-b.index);
  if (selected.length !== 3 || selected.some((item,index) => item.index !== index || item.status !== 'completed' || evidence.ready?.clips?.[index]?.text !== item.text || evidence.ready.clips[index].sha256 !== item.audio_sha256)) fail('Accepted presenter texts/hashes must match capture');
  const events = evidence.events || [], questionSpans = [], agentSpans = new Map([[-1,[]],[0,[]],[1,[]],[2,[]]]);
  for (let index = 0; index < 3; index++) {
    const starts = events.filter(event => event.event === 'question_started' && event.index === index), ends = events.filter(event => event.event === 'question_finished' && event.index === index);
    if (starts.length !== 1 || ends.length !== 1 || !Number.isFinite(starts[0].time) || !Number.isFinite(ends[0].time) || ends[0].time <= starts[0].time) fail('Unambiguous question start/end required');
    questionSpans.push([starts[0].time/1000, ends[0].time/1000]);
  }
  let active;
  for (const event of events.filter(item => ['agent_start_talking','agent_stop_talking'].includes(item.event))) {
    if (!agentSpans.has(event.index) || !Number.isFinite(event.time)) fail('Ambiguous agent event index');
    if (event.event === 'agent_start_talking') {
      if (active) fail('Overlapping agent starts'); active = event;
    } else {
      if (!active || active.index !== event.index) fail('Unmatched agent stop');
      const onsetCorrection = evidence.speechAuthority === 'remote_audio' ? .1 : 0;
      const stopCorrection = evidence.speechAuthority === 'remote_audio' ? .65 : 0;
      const span = [Math.max(0,active.time/1000-onsetCorrection),event.time/1000-stopCorrection];
      if (span[1] <= span[0]) fail('Invalid audible span'); agentSpans.get(event.index).push(span); active = undefined;
    }
  }
  if (active || [...agentSpans.values()].some(spans => !spans.length)) fail('Four observed greeting/reply spans required');
  const final = evidence.updates?.filter(item => item.source === 'transcript_monitor' && Array.isArray(item.transcript)).at(-1)?.transcript;
  if (!final?.length) fail('Actual final monitor transcript required; no fabricated/ASR-complete substitute');
  const ids = new Set(), blocks = []; let previousTranscriptTime = -1;
  for (const item of final) {
    if (!['agent','user'].includes(item.role) || typeof item.id !== 'string' || ids.has(item.id) || typeof item.content !== 'string' || !item.content.trim() || !Number.isFinite(item.time_sec)) fail('Ambiguous final stable-ID transcript');
    ids.add(item.id);
    if (item.time_sec < previousTranscriptTime) fail('Ambiguous transcript order'); previousTranscriptTime = item.time_sec;
    if (blocks.at(-1)?.role !== item.role) blocks.push({ role: item.role, items: [] });
    blocks.at(-1).items.push(item);
  }
  if (blocks.length !== 7 || blocks.some((block,index) => block.role !== (index%2 ? 'user' : 'agent'))) fail('Transcript must map unambiguously to greeting and three replies');
  const captions = [], mapping = [];
  for (let turn = 0; turn < 4; turn++) {
    const index = turn - 1, block = blocks[turn*2], spans = agentSpans.get(index);
    if (block.items.some(item => item.time_sec < spans[0][0]-3 || item.time_sec > spans.at(-1)[1]+.5)) fail('Agent transcript time does not match observed reply');
    const text = block.items.map(item => item.content).join(' ');
    captions.push(...coarseCues(text,spans,binding.name));
    mapping.push({ speaker: 'agent', index, transcript_ids: block.items.map(item => item.id), spans, text });
    if (turn < 3) {
      const userBlock = blocks[turn*2+1], question = questionSpans[turn];
      if (userBlock.items.some(item => item.time_sec < question[0]-3 || item.time_sec > question[1]+.5)) fail('User transcript cannot map to accepted question');
      captions.push(...coarseCues(selected[turn].text,[question],'Presenter'));
      mapping.push({ speaker: 'presenter', index: turn, transcript_ids: userBlock.items.map(item => item.id), spans: [question], text: selected[turn].text });
    }
  }
  captions.sort((a,b) => a.start-b.start);
  const duration = Math.min(evidence.recordedAudio.durationSeconds,evidence.durationSeconds);
  captions.forEach((cue,index) => {
    if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < 0 || cue.end > duration || Math.round(cue.end*1000) <= Math.round(cue.start*1000) || (index && Math.round(cue.start*1000) < Math.round(captions[index-1].end*1000))) fail('Draft cue overlap or invalid timing');
    if (/[<>\u0000-\u001f]/.test(cue.text)) fail('Unsafe caption text');
  });
  return { review_status: 'unreviewed', caption_status: 'draft_coarse_timing_requires_actual_audio_review', role, name: binding.name, call_id: attempt.call_id, duration_seconds: duration, captions, mapping };
}
function prepareReview({ root, role, take = 'original', ffmpeg = 'C:/Program Files/ShareX/ffmpeg.exe' }) {
  if (!['original','retake'].includes(take) || (take === 'retake' && !['concierge','sales'].includes(role))) fail('Retake is explicit and limited to concierge/sales');
  const privateDir = path.resolve(root,'voice-samples/production-v2'), input = path.join(privateDir,'recordings',role+(take === 'retake' ? '-retake' : ''));
  if (!ROLES.includes(role)) fail('Unknown role');
  const evidence = read(path.join(input,'capture-evidence.json'));
  const draft = buildDraft({ role, evidence, ledger: read(path.join(privateDir,take === 'retake' ? 'RETAKE-ATTEMPTS.json' : 'PAID-ATTEMPTS.json')), binding: read(path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json')).roles.find(item => item.role === role), questions: read(path.join(privateDir,'presenter/QUESTIONS.json')).items, allowanceId: take === 'retake' ? 'awc_autumn_owen_fresh_demos_20261011' : 'awc_seven_custom_voice_demos_20261011' });
  const source_sha256 = Object.fromEntries(['screen.webm','mixed-audio.webm','capture-evidence.json'].map(name => [name,sha(fs.readFileSync(path.join(input,name)))]));
  const input_sha256 = { selected_ledger: sha(fs.readFileSync(path.join(privateDir,take === 'retake' ? 'RETAKE-ATTEMPTS.json' : 'PAID-ATTEMPTS.json'))), recording_manifest: sha(fs.readFileSync(path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json'))), presenter_questions: sha(fs.readFileSync(path.join(privateDir,'presenter/QUESTIONS.json'))) };
  const out = path.join(privateDir,'reviews',role+(take === 'retake' ? '-retake' : '')+'-draft');
  if (fs.existsSync(out)) fail('Private draft already exists; no overwrite');
  fs.mkdirSync(path.dirname(out),{recursive:true}); const temp = fs.mkdtempSync(path.join(path.dirname(out),'.draft-'));
  try {
    const video = path.join(temp,'preview.mp4');
    const filters = `[0:v]trim=start=${evidence.videoLeadInSeconds}:end=${evidence.videoLeadInSeconds+draft.duration_seconds},setpts=PTS-STARTPTS,scale=1280:720,setsar=1[v];[1:a]atrim=start=0:end=${draft.duration_seconds},asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
    execFileSync(ffmpeg,['-hide_banner','-loglevel','error','-n','-i',path.join(input,'screen.webm'),'-i',path.join(input,'mixed-audio.webm'),'-filter_complex',filters,'-map','[v]','-map','[a]','-r','25','-c:v','libx264','-preset','veryfast','-crf','24','-c:a','aac','-b:a','128k','-movflags','+faststart',video],{stdio:'pipe'});
    const decode = spawnSync(ffmpeg,['-hide_banner','-xerror','-i',video,'-f','null','-'],{encoding:'utf8'});
    if (decode.status !== 0) fail('Private preview full decode failed');
    const match = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(decode.stderr);
    if (!match) fail('Preview duration unavailable'); const measured = +match[1]*3600 + +match[2]*60 + +match[3];
    if (Math.abs(measured-draft.duration_seconds) > .15) fail('Private mux alignment/duration mismatch');
    fs.writeFileSync(path.join(temp,'preview.vtt'),'WEBVTT\n\nNOTE UNREVIEWED DRAFT — coarse timing; listening review required\n\n'+draft.captions.map(cue => `${stamp(cue.start)} --> ${stamp(cue.end)}\n${cue.text}\n`).join('\n'));
    fs.writeFileSync(path.join(temp,'REVIEW-DRAFT.json'),JSON.stringify({ ...draft, take, source_sha256, input_sha256, preview_sha256: sha(fs.readFileSync(video)), vtt_sha256: sha(fs.readFileSync(path.join(temp,'preview.vtt'))), measured_duration_seconds: measured, created_at: new Date().toISOString(), video_alignment: { videoLeadInSeconds: evidence.videoLeadInSeconds, audioStartSeconds: 0 }, warning: 'UNREVIEWED; no listening, caption, meaningful-dialogue or privacy acceptance is implied' },null,2)+'\n');
    fs.renameSync(temp,out); return { role, review_status: 'unreviewed', outputDir: out, duration_seconds: measured, caption_cues: draft.captions.length };
  } finally { if (fs.existsSync(temp)) { for (const file of fs.readdirSync(temp)) fs.unlinkSync(path.join(temp,file)); fs.rmdirSync(temp); } }
}
module.exports = { buildDraft, coarseCues, prepareReview, stamp };
if (require.main === module) { try { const [role,...extra] = process.argv.slice(2); if (!role || (extra.length && !(extra.length === 2 && extra[0] === '--take' && extra[1] === 'retake'))) fail('Usage: node prepare-review.cjs ROLE [--take retake]'); console.log(JSON.stringify(prepareReview({root:path.resolve(__dirname,'../../../..'),role,take:extra.length ? 'retake' : 'original'}))); } catch(error) { console.error('Private unreviewed preparation stopped: '+error.message); process.exitCode=1; } }
