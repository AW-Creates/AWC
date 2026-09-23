#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const [file, out] = process.argv.slice(2);
if (!file || !out || !path.isAbsolute(file) || !path.isAbsolute(out)) {
  console.error('Usage: node verify-playback.cjs <absolute-video> <absolute-evidence-directory>');
  process.exit(2);
}
(async () => {
  const bytes = fs.statSync(file).size;
  if (!bytes) throw new Error('Video is empty');
  const metadata = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries',
    'format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate,nb_read_frames', '-of', 'json', file], { encoding: 'utf8' }));
  if (!(Number(metadata.format.duration) > 0)) throw new Error('No positive video duration');
  execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', file, '-f', 'null', '-'], { stdio: 'pipe' });
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1380, height: 900 } });
    await page.goto(pathToFileURL(file).href);
    const video = page.locator('video');
    await video.waitFor();
    await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
    await video.evaluate(async v => { v.muted = true; v.currentTime = v.duration * 0.1; await v.play(); });
    const start = await video.evaluate(v => v.currentTime);
    await page.waitForTimeout(1000);
    const playback = await video.evaluate(v => ({ duration: v.duration, currentTime: v.currentTime,
      paused: v.paused, readyState: v.readyState, width: v.videoWidth, height: v.videoHeight, error: v.error?.message || null }));
    if (playback.error || playback.currentTime <= start || playback.paused) throw new Error('Playback did not advance: ' + JSON.stringify(playback));
    await video.evaluate(v => v.pause());
    const screenshots = [];
    for (const [label, fraction] of [['start', 0.12], ['middle', 0.5], ['end', 0.88]]) {
      await video.evaluate((v, f) => new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video seek timeout')), 10000);
        v.addEventListener('seeked', () => { clearTimeout(timeout); resolve(); }, { once: true });
        v.currentTime = v.duration * f;
      }), fraction);
      await page.waitForTimeout(100);
      const screenshot = path.join(out, `playback-${label}.png`);
      await page.screenshot({ path: screenshot });
      screenshots.push(screenshot);
    }
    const report = { video: file, bytes, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
      metadata, fullDecodePassed: true, playbackPassed: true, playback, screenshots,
      visualReview: 'Pending human/agent image inspection; automated playback is not a visual quality verdict.' };
    fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
