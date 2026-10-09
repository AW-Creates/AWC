const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require('C:/Users/A-Problem/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');

(async () => {
  const root = process.cwd();
  const out = path.join(root, 'docs/qa/voice-invitation');
  fs.mkdirSync(out, {recursive: true});
  const {createOwnerServer} = await import(pathToFileURL(path.join(root, 'owner-ops/server.mjs')));
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'awc-voice-invitation-'));
  const app = createOwnerServer({dataDir});
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + app.server.address().port;
  const browser = await chromium.launch({headless: true, executablePath: 'C:/Users/A-Problem/.agent-browser/browsers/chrome-153.0.8010.36/chrome.exe'});
  const report = {checks: [], errors: [], externalRequests: []};
  try {
    const {prospects} = await (await fetch(base + '/api/prospects')).json();
    for (const p of prospects) {
      const response = await fetch(base + '/api/prospects/' + p.id + '/generate', {
        method: 'POST', headers: {Origin: base, 'Content-Type': 'application/json', 'X-Owner-Action': 'local-workbench'},
        body: JSON.stringify({expectedRevision: p.inputRevision})
      });
      assert.equal(response.status, 200);
    }
    const realtor = prospects.find(p => p.niche === 'real-estate');
    for (const [label, width, height, motion] of [
      ['desktop', 1440, 1000, 'no-preference'],
      ['mobile', 390, 844, 'no-preference'],
      ['small-mobile', 360, 800, 'reduce'],
      ['reduced-motion', 1440, 1000, 'reduce']
    ]) {
      const ctx = await browser.newContext({viewport: {width, height}, reducedMotion: motion});
      const page = await ctx.newPage();
      page.on('pageerror', e => report.errors.push(e.message));
      page.on('request', r => {if (!r.url().startsWith(base)) report.externalRequests.push(r.url());});
      await page.addInitScript(() => {
        window.__audioCalls = [];
        HTMLMediaElement.prototype.play = () => {window.__audioCalls.push('play'); return Promise.resolve();};
        if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = () => {window.__audioCalls.push('microphone'); throw Error('Unexpected microphone request');};
      });
      await page.goto(base + '/demo/' + realtor.id);
      assert.equal(await page.locator('#crew-invitation').isVisible(), false);
      await page.locator('#crew-invitation').waitFor({state: 'visible'});
      const copy = await page.locator('#crew-invitation').innerText();
      assert.match(copy, /microphone and speakers/);
      assert.match(copy, /phone conversation/);
      assert.match(copy, /reply out loud/);
      assert.match(copy, /follow|keep asking/);
      assert.match(copy, /not connected yet/);
      assert.match(copy, /Prefer typing/);
      const bounds = await page.locator('#crew-invitation').boundingBox();
      assert(bounds.y >= 0 && bounds.y + bounds.height <= height);
      assert.equal(await page.evaluate(() => innerWidth === document.documentElement.scrollWidth), true);
      await page.screenshot({animations: 'disabled', path: path.join(out, label + '-invitation.png')});
      await page.locator('.invitation-action').click();
      assert.equal(await page.locator('[data-crew-channel=talk]').evaluate(e => e === document.activeElement), true);
      assert.equal(await page.locator('#messages').evaluate(e => e.scrollTop), 0);
      assert.match(await page.locator('#voice-status').innerText(), /not connected yet.*microphone.*hear replies/);
      assert.equal(await page.locator('[data-crew-channel=talk]').getAttribute('aria-disabled'), 'true');
      assert.equal(await page.locator('[data-crew-channel=call]').getAttribute('aria-disabled'), 'true');
      const events = await page.evaluate(() => window.crewEngagement.events);
      assert.equal(events.filter(e => e.name === 'crew_talk_clicked' && e.surface === 'invitation').length, 1);
      assert(!events.some(e => e.name === 'crew_conversation_started'));
      await page.screenshot({animations: 'disabled', path: path.join(out, label + '-talk-panel.png')});
      // These disabled preview cards explain availability when deliberately clicked.
      await page.locator('[data-crew-channel=call]').click({force: true});
      assert.match(await page.locator('#voice-status').innerText(), /No phone call/);
      await page.locator('[data-crew-channel=chat]').click();
      await page.locator('#question').fill('What services do you offer?');
      await page.locator('#demo-chat button').click();
      await page.locator('#messages').getByText('Based on the reviewed concept facts:', {exact: false}).waitFor();
      await page.locator('#crew-close').click();
      assert.equal(await page.locator('#crew-invitation').isVisible(), false);
      if (label === 'desktop' || label === 'mobile') {
        await page.waitForTimeout(6200);
        assert.equal(await page.locator('#crew-invitation').isVisible(), false);
        await page.reload();
        await page.locator('#crew-invitation').waitFor({state: 'visible'});
        await page.locator('[data-crew-example]').first().click();
        await page.locator('#messages').getByText('A useful starting point is your preferred area', {exact: false}).waitFor();
      }
      assert.deepEqual(await page.evaluate(() => window.__audioCalls), []);
      if (motion === 'reduce') assert.equal(await page.locator('.modern-hero-copy').evaluate(e => getComputedStyle(e).animationName), 'none');
      report.checks.push({label, explicitAudioCopy: true, voiceEntryFocusAndEvent: true, truthfulDisabledChannels: true, typingFallback: true, pageSessionDismissal: true, refreshGreeting: label === 'desktop' || label === 'mobile', noOverflow: true, noAutoplayOrMicrophone: true, reducedMotion: motion === 'reduce'});
      await ctx.close();
    }
    for (const p of prospects.filter(p => p.niche !== 'real-estate')) {
      const page = await browser.newPage({viewport: {width: 390, height: 844}});
      await page.goto(base + '/demo/' + p.id);
      assert.match(await page.locator('#crew-invitation').textContent(), /microphone and speakers/);
      assert.match(await page.locator('#crew-invitation').textContent(), new RegExp(p.crew.name));
      report.checks.push({niche: p.niche, ownIdentity: true, sharedVoiceCopy: true});
      await page.close();
    }
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.externalRequests, []);
    fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally {
    await browser.close();
    await app.close();
    assert.equal(path.dirname(path.resolve(dataDir)), path.resolve(os.tmpdir()));
    assert(path.basename(dataDir).startsWith('awc-voice-invitation-'));
    fs.rmSync(dataDir, {recursive: true});
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
