'use strict';
// Private loopback-only draft playback; no provider, public hosting or acceptance.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const ROLES = ['concierge','sales','scheduling','support','billing','implementation','retention'];
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function reviewInventory(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'docs/crew/voice-v2/RECORDING-MANIFEST.json'),'utf8'));
  return ROLES.map(role => {
    const take = ['concierge','sales'].includes(role) ? 'retake' : 'original';
    const dir = path.join(root,'voice-samples/production-v2/reviews',role+(take === 'retake' ? '-retake' : '')+'-draft');
    const binding = manifest.roles?.find(item=>item.role===role);
    if (!binding || typeof binding.name !== 'string') throw Error('Approved review names unavailable');
    let available = false;
    try { const draft = JSON.parse(fs.readFileSync(path.join(dir,'REVIEW-DRAFT.json'),'utf8')); available = draft.role === role && draft.take === take && draft.review_status === 'unreviewed' && fs.existsSync(path.join(dir,'preview.mp4')) && fs.existsSync(path.join(dir,'preview.vtt')); } catch {}
    let status = available ? 'available' : 'pending';
    const evidencePath = path.join(root,'voice-samples/production-v2/recordings',role+(take === 'retake' ? '-retake' : ''),'capture-evidence.json');
    try { if (JSON.parse(fs.readFileSync(evidencePath,'utf8')).complete === false) { available = false; status = 'incomplete'; } } catch {}
    return { role, name: binding.name, take, available, status, dir };
  });
}
function render(items) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private Crew dialogue review — unreviewed drafts</title><style>body{margin:0;background:#111114;color:#f3f0ed;font:17px/1.6 system-ui;padding:28px}main{max-width:1100px;margin:auto}h1{font:38px Georgia;line-height:1.2}p{max-width:900px}.notice{border:1px solid #ed5265;border-radius:12px;padding:18px;color:#ffd5da}article{margin:28px 0;border:1px solid #45454b;border-radius:12px;padding:20px}h2{margin:0 0 10px;font-size:24px}video{display:block;width:100%;background:#000;border-radius:8px}small{color:#c7c3c6}a{color:#ffb8c0}@media(max-width:500px){body{padding:16px}article{padding:12px}h1{font-size:30px}}</style></head><body><main><h1>Private Crew dialogue review</h1><p class="notice"><strong>UNREVIEWED DRAFTS</strong> · Listen to each complete conversation and check the captions before approving website use. Caption wording comes from actual dialogue; timing is coarse and needs listening verification. No acceptance or publication is implied.</p><p>Playback uses local recordings and starts no provider call. ${items.filter(item=>item.available).length} of 7 drafts are currently available. Use the native player’s caption control to show or hide draft captions.</p>${items.map(item=>`<article><h2>${escape(item.name)}</h2><small>${escape(item.role)} · ${item.available ? 'Unreviewed conversation draft' : item.status === 'incomplete' ? 'Recording incomplete; replacement requires a separately approved attempt' : 'Draft unavailable; preparation pending'}</small>${item.available ? `<video controls preload="metadata" playsinline aria-label="${escape(item.name)} unreviewed conversation"><source src="/review/${item.role}/preview.mp4" type="video/mp4"><track kind="captions" src="/review/${item.role}/preview.vtt" srclang="en" label="Draft captions — verify by listening" default></video><p><a href="/review/${item.role}/preview.mp4">Open local draft video</a> · <a href="/review/${item.role}/preview.vtt">Inspect draft captions</a></p>` : ''}</article>`).join('')}</main></body></html>`;
}
function parseRange(header,size) {
  if (!header) return { start:0,end:size-1,partial:false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1]&&!match[2])) return null;
  let start,end;
  if (!match[1]) { const count=Number(match[2]);if(!Number.isSafeInteger(count)||count<=0)return null;start=Math.max(0,size-count);end=size-1; }
  else { start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1; }
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return null;
  return {start,end,partial:true};
}
function createReviewServer({root,port=4207}) {
  if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid local port');
  reviewInventory(root);
  const server = http.createServer((request,response) => {
    response.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');response.setHeader('X-Content-Type-Options','nosniff');response.setHeader('Cache-Control','no-store');
    response.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; media-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'");
    if(!['GET','HEAD'].includes(request.method)){response.writeHead(405);return response.end();}
    if(!/^127\.0\.0\.1(?::\d+)?$/.test(request.headers.host||'')){response.writeHead(403);return response.end();}
    if(request.url==='/robots.txt'){response.writeHead(200,{'Content-Type':'text/plain'});return response.end(request.method==='HEAD'?undefined:'User-agent: *\nDisallow: /\n');}
    let items;try{items=reviewInventory(root);}catch{response.writeHead(503);return response.end('Private drafts unavailable');}
    if(request.url==='/'){const html=render(items);response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':Buffer.byteLength(html)});return response.end(request.method==='HEAD'?undefined:html);}
    const match=/^\/review\/([a-z]+)\/(preview\.mp4|preview\.vtt)$/.exec(request.url||'');
    const item=match&&items.find(item=>item.role===match[1]&&item.available);
    if(!item){response.writeHead(404);return response.end();}
    const file=path.join(item.dir,match[2]),size=fs.statSync(file).size,range=parseRange(request.headers.range,size);
    if(!range){response.writeHead(416,{'Content-Range':`bytes */${size}`});return response.end();}
    const headers={'Content-Type':match[2].endsWith('.mp4')?'video/mp4':'text/vtt; charset=utf-8','Content-Length':range.end-range.start+1,'Accept-Ranges':'bytes'};
    if(range.partial)headers['Content-Range']=`bytes ${range.start}-${range.end}/${size}`;
    response.writeHead(range.partial?206:200,headers);if(request.method==='HEAD')return response.end();
    const stream=fs.createReadStream(file,{start:range.start,end:range.end});stream.on('error',()=>response.destroy());stream.pipe(response);
  });
  return server;
}
module.exports={createReviewServer,reviewInventory,render,parseRange};
if(require.main===module){try{const server=createReviewServer({root:path.resolve(__dirname,'../../../..'),port:4207});server.listen(4207,'127.0.0.1',()=>console.log('Private UNREVIEWED review gallery: http://127.0.0.1:4207/'));server.on('error',()=>{console.error('Private gallery unavailable');process.exitCode=1;});}catch{console.error('Private gallery unavailable');process.exitCode=1;}}
