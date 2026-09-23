#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function usage(message) {
  if (message) console.error(`Error: ${message}`);
  console.error('Usage: node record-context.cjs --url <url> --out <absolute-directory>');
  process.exit(2);
}

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const url = value('--url');
const out = value('--out');
if (!url) usage('--url is required');
if (!out) usage('--out is required');
if (!path.isAbsolute(out)) usage('--out must be an absolute directory');

const outputDir = path.resolve(out);
fs.mkdirSync(outputDir, { recursive: true });
const repository = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: fs.realpathSync(outputDir), encoding: 'utf8' });
if (repository.error) usage(`Cannot check output Git boundary: ${repository.error.message}`);
if (repository.status === 0) usage('Video output must be outside a Git working tree');

let playwright;
try {
  playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
} catch (error) {
  console.error(`Could not load Playwright: ${error.message}`);
  process.exit(1);
}

const packagePath = require.resolve(`${process.env.PLAYWRIGHT_MODULE || 'playwright'}/package.json`);
const playwrightPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const videoPath = path.join(outputDir, `context-${timestamp}.webm`);
const screenshotPath = path.join(outputDir, `context-${timestamp}.png`);
const reportPath = path.join(outputDir, `context-${timestamp}.json`);

let browser;
let context;
let page;
let video;
let failure;
const startedAt = Date.now();

(async () => {
  try {
    browser = await playwright.chromium.launch({
      headless: true,
      ...(process.env.CHROMIUM_EXECUTABLE_PATH
        ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }
        : {}),
    });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: outputDir, size: { width: 1280, height: 720 } },
    });
    page = await context.newPage();
    video = page.video();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    await page.evaluate(async () => {
      window.scrollTo({ top: Math.max(document.body.scrollHeight - innerHeight, 0), behavior: 'smooth' });
      await new Promise((resolve) => setTimeout(resolve, 2500));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await page.waitForTimeout(2500);
    await context.close();
    context = undefined;
    if (!video) throw new Error('Playwright did not expose a page video');
    await video.saveAs(videoPath);
    await video.delete(); // Remove only the temporary video created by this context.
    const stat = fs.statSync(videoPath);
    if (!stat.size) throw new Error('Recorded video is empty');
    const report = {
      url,
      videoPath,
      screenshotPath,
      bytes: stat.size,
      durationSeconds: null,
      playwrightVersion: playwrightPackage.version,
      browserVersion: browser.version(),
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || 'Playwright-managed Chromium',
      headless: true,
      viewport: { width: 1280, height: 720 },
      elapsedSeconds: (Date.now() - startedAt) / 1000,
      fileVerified: true,
      playbackVerified: false,
      verificationNote: 'Nonzero file only; inspect metadata, decode, and playback before marking verified.',
    };
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report));
  } catch (error) {
    failure = error;
    console.error(error.stack || error.message);
    try { if (context) await context.close(); } catch {}
  } finally {
    try { if (browser) await browser.close(); } catch {}
  }
  if (failure) process.exitCode = 1;
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
