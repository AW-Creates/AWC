const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync,spawnSync}=require('node:child_process');
const {exportRole,captions,cuts,out,dir,ff,stamp}=require('./export-clips.cjs');
const roles=['concierge','sales','scheduling','support','billing','implementation'];
const greetingCuts=Object.fromEntries(roles.map(role=>[role,cuts[role][0]]));
function parseStamp(stamp){const [h,m,s]=stamp.split(':').map(Number);return h*3600+m*60+s;}
function fixVtt(file){const lines=fs.readFileSync(file,'utf8').trim().split(/\r?\n/),cues=[];for(let i=0;i<lines.length;i++){const match=/^(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})$/.exec(lines[i]);if(match){let text=[];while(lines[i+1]?.trim()){text.push(lines[++i]);}cues.push({start:parseStamp(match[1]),end:parseStamp(match[2]),text:text.join(' ').replace(/Implementation on\s+Boarding/gi,'Implementation / Onboarding').replace(/\bAAC\b|\bAUC\b|\bOCC\b/g,'AWC')});}}
 const role=path.basename(file,'.vtt');let total=role==='overview'?6:0;const boundaries=(role==='overview'?roles.map(role=>greetingCuts[role]):cuts[role]||[]).map(([a,b])=>{total+=b-a;return total;});
 const part=start=>boundaries.findIndex(boundary=>start<boundary-.0001);
 for(const cue of cues){cue.editPart=part(cue.start);if(cue.editPart>=0)cue.end=Math.min(cue.end,boundaries[cue.editPart]);cue.text=cue.text.replace(/non\s+-\s*sensitive/gi,'non-sensitive').replace(/\bcrew\b/g,'Crew');}
 for(let i=1;i<cues.length;i++){const previous=cues[i-1],cue=cues[i];if(cue.end-cue.start<.65&&cue.text.split(/\s+/).length<=2&&previous.editPart===cue.editPart){previous.text+=' '+cue.text;previous.end=cue.end;cues.splice(i,1);i--;}}
 for(let i=0;i<cues.length;i++){if(cues[i+1])cues[i].end=Math.min(cues[i].end,cues[i+1].start-.001);if(cues[i].end<=cues[i].start)cues[i].end=cues[i].start+.001;}
 fs.writeFileSync(file,'WEBVTT\n\n'+cues.map(c=>stamp(c.start)+' --> '+stamp(c.end)+'\n'+c.text+'\n').join('\n'));return cues;
}
function overview(){const args=['-hide_banner','-loglevel','error','-y'],filters=[],concat=[],chunks=['WEBVTT',''];const font=path.join(dir,'caption-font.ttf');fs.copyFileSync('C:/Windows/Fonts/arial.ttf',font);const safeFont=font.replace(/\\/g,'/').replace(':','\\:');
 const title=(id,line1,line2,line3)=>{filters.push(`color=c=0x141416:s=1280x720:r=25:d=6,drawtext=fontfile='${safeFont}':text='${line1}':fontsize=64:fontcolor=0xf6f1e9:x=(w-tw)/2:y=260,drawtext=fontfile='${safeFont}':text='${line2}':fontsize=24:fontcolor=0xf29c91:x=(w-tw)/2:y=360,drawtext=fontfile='${safeFont}':text='${line3}':fontsize=18:fontcolor=0xf6f1e9:x=(w-tw)/2:y=425[${id}v]`,`anullsrc=r=48000:cl=stereo,atrim=duration=6[${id}a]`);concat.push(`[${id}v][${id}a]`);};
 title('intro','Meet Crew','A. Wilcher Creatives','Six separate recorded introductions');let offset=6;
 roles.forEach((role,index)=>{args.push('-i',path.join(dir,role,'screen.webm'),'-i',path.join(dir,role,'mixed-audio.webm'));const [a,b]=greetingCuts[role],evidence=JSON.parse(fs.readFileSync(path.join(dir,role,'capture-evidence.json'),'utf8'));filters.push(`[${index*2}:v]trim=start=${a+evidence.videoLeadInSeconds}:end=${b+evidence.videoLeadInSeconds},setpts=PTS-STARTPTS,scale=1280:720,setsar=1[v${index}]`,`[${index*2+1}:a]atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS,aresample=48000[a${index}]`);concat.push(`[v${index}][a${index}]`);
  const text=captions(role,[[a,b]]).split(/\r?\n/);for(let i=0;i<text.length;i++){const match=/^(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})$/.exec(text[i]);if(match)chunks.push(stamp(parseStamp(match[1])+offset)+' --> '+stamp(parseStamp(match[2])+offset),text[++i],'');}offset+=b-a;
 });title('outro','Your Crew. Your business.','One specialist or a team | Custom names and responsibilities','Edited from six separate sessions | Automated specialists');filters.push(concat.join('')+`concat=n=${concat.length}:v=1:a=1[v][a]`,'[a]loudnorm=I=-16:TP=-1.5:LRA=11[normalized]');args.push('-filter_complex',filters.join(';'),'-map','[v]','-map','[normalized]','-r','25','-c:v','libx264','-preset','veryfast','-crf','24','-c:a','aac','-b:a','128k','-movflags','+faststart',path.join(out,'overview.mp4'));execFileSync(ff,args,{stdio:'pipe'});fs.writeFileSync(path.join(out,'overview.vtt'),chunks.join('\n')+'\n');return offset+6;
}
function probe(file){const text=execFileSync(ff,['-hide_banner','-i',file,'-f','null','-'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});return text;}
module.exports={fixVtt,overview};
if(require.main===module){
 const overviewDuration=overview(),manifest=[];
 for(const role of [...roles,'overview']){
  const video=path.join(out,role+'.mp4'),vtt=path.join(out,role+'.vtt'),cues=fixVtt(vtt);
  const decoded=spawnSync(ff,['-hide_banner','-i',video,'-f','null','-'],{encoding:'utf8'});
  if(decoded.status!==0)throw Error('Full decode failed for '+role);
  const measured=/Duration: (\d+:\d+:\d+\.\d+)/.exec(decoded.stderr),editedDuration=role==='overview'?overviewDuration:cuts[role].reduce((sum,[a,b])=>sum+b-a,0);
  manifest.push({role,duration_seconds:measured?parseStamp(measured[1]):Number(editedDuration.toFixed(3)),edited_duration_seconds:Number(editedDuration.toFixed(3)),full_decode_passed:true,mp4_bytes:fs.statSync(video).size,mp4_sha256:crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex'),vtt_sha256:crypto.createHash('sha256').update(fs.readFileSync(vtt)).digest('hex'),caption_cues:cues.length,no_caption_overlap:cues.every((cue,i)=>!i||cues[i-1].end<=cue.start),source:'actual provider sessions with synthetic visitor questions',edited_separate_sessions:true});
 }
 fs.writeFileSync(path.join(out,'media-manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest));
}
