const roles=['concierge','sales','scheduling','support','billing','implementation','retention','overview'];
const files=new Set(roles.flatMap(role=>[role+'.mp4',role+'.vtt']));
const maxBytes=12*1024*1024;
const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(data,status)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json','Cache-Control':'no-store'}});
const authorized=(supplied,expected)=>{if(typeof expected!=='string'||expected.length<32||expected.length>256||typeof supplied!=='string'||supplied.length>256)return false;let diff=expected.length^supplied.length;for(let i=0;i<256;i++)diff|=(expected.charCodeAt(i)||0)^(supplied.charCodeAt(i)||0);return diff===0;};
async function bytes(request,limit){const reader=request.body?.getReader();if(!reader)return null;const chunks=[];let size=0;while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>limit){await reader.cancel();return null;}chunks.push(part.value);}const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;}
async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',value))].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
export async function crewMediaResponse(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/crew-recordings'){
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  if(!env.CREW_MEDIA)return json({readyRoles:[],overviewReady:false},200);
  const ready=await Promise.all(roles.map(async role=>{const [video,captions]=await Promise.all([env.CREW_MEDIA.head(role+'.mp4'),env.CREW_MEDIA.head(role+'.vtt')]);return video?.size>0&&captions?.size>0?role:null;}));
  return json({readyRoles:ready.filter(role=>role&&role!=='overview'),overviewReady:ready.includes('overview')},200);
 }
 if(path==='/api/crew-media-upload'){
  if(!['POST','PUT'].includes(request.method))return json({error:'Method not allowed'},405);
  if(!env.CREW_MEDIA||!Number.isFinite(Date.parse(env.CREW_MEDIA_UPLOAD_EXPIRES_AT))||Date.parse(env.CREW_MEDIA_UPLOAD_EXPIRES_AT)<=Date.now()||!authorized(request.headers.get('Authorization')?.replace(/^Bearer /,''),env.CREW_MEDIA_UPLOAD_TOKEN))return json({error:'Upload unavailable'},403);
  const filename=request.headers.get('X-Crew-Media-Filename');if(!files.has(filename))return json({error:'Unsupported filename'},400);
  const type=filename.endsWith('.mp4')?'video/mp4':'text/vtt';if(request.headers.get('Content-Type')?.split(';')[0]!==type)return json({error:'Invalid media type'},415);
  const declared=request.headers.get('Content-Length');if(declared&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))return json({error:'Media exceeds limit'},413);
  const data=await bytes(request,filename.endsWith('.vtt')?65536:maxBytes);if(!data?.length)return json({error:'Empty or oversized media'},413);
  if(type==='video/mp4'&&(data.length<12||new TextDecoder().decode(data.slice(4,8))!=='ftyp')||type==='text/vtt'&&!new TextDecoder().decode(data.slice(0,12)).replace(/^\uFEFF/,'').startsWith('WEBVTT'))return json({error:'Invalid media signature'},415);
  const hash=await digest(data),existing=await env.CREW_MEDIA.head(filename);
  if(existing){if(existing.customMetadata?.sha256===hash)return json({filename,sha256:hash,status:'already_present'},200);return json({error:'Existing media cannot be overwritten'},409);}
  await env.CREW_MEDIA.put(filename,data,{httpMetadata:{contentType:type,cacheControl:'public, max-age=31536000, immutable'},customMetadata:{sha256:hash}});
  return json({filename,sha256:hash,status:'uploaded'},201);
 }
 if(!path.startsWith('/crew-media/'))return null;
 if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed'},405);
 const filename=path.slice('/crew-media/'.length);if(!files.has(filename))return json({error:'Not found'},404);
 if(!env.CREW_MEDIA)return json({error:'Media not ready'},404);
 const info=await env.CREW_MEDIA.head(filename);if(!info)return json({error:'Media not ready'},404);
 const resultHeaders={...headers,'Content-Type':filename.endsWith('.mp4')?'video/mp4':'text/vtt; charset=utf-8','Cache-Control':'public, max-age=31536000, immutable','Accept-Ranges':'bytes','ETag':info.httpEtag||'"'+info.customMetadata?.sha256+'"'};
 if(!request.headers.has('Range')&&request.headers.get('If-None-Match')===resultHeaders.ETag)return new Response(null,{status:304,headers:resultHeaders});
 let start=0,end=info.size-1,status=200;
 const range=request.headers.get('Range');if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);let valid=!!match&&!!(match[1]||match[2])&&info.size>0;if(valid&&match[1]===''){const suffix=Number(match[2]);valid=Number.isSafeInteger(suffix)&&suffix>0;start=Math.max(0,info.size-suffix);}else if(valid){start=Number(match[1]);end=match[2]?Number(match[2]):info.size-1;valid=Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start<info.size&&end>=start;end=Math.min(end,info.size-1);}if(!valid)return new Response(null,{status:416,headers:{...resultHeaders,'Content-Range':'bytes */'+info.size}});status=206;resultHeaders['Content-Range']=`bytes ${start}-${end}/${info.size}`;}
 resultHeaders['Content-Length']=String(end-start+1);
 if(request.method==='HEAD')return new Response(null,{status,headers:resultHeaders});
 const object=await env.CREW_MEDIA.get(filename,range?{range:{offset:start,length:end-start+1}}:undefined);if(!object)return json({error:'Media not ready'},404);
 return new Response(object.body,{status,headers:resultHeaders});
}
