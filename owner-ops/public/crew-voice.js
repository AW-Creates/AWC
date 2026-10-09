// Provider credentials, routing, grant limits and destinations stay on the server.
(() => {
  const panel = document.querySelector('#crew-panel');
  const status = document.querySelector('#voice-status');
  const step = document.querySelector('#crew-voice-step');
  const consent = document.querySelector('#crew-voice-consent');
  const share = document.querySelector('#crew-share-context');
  const shareContainer = document.querySelector('#crew-share-context-container');
  const start = document.querySelector('#crew-voice-start');
  const end = document.querySelector('#crew-voice-end');
  const callForm = document.querySelector('#crew-callback-form');
  const phone = document.querySelector('#crew-callback-phone');
  const callConsent = document.querySelector('#crew-callback-consent');
  const callSubmit = document.querySelector('#crew-callback-submit');
  const base = '/api/prospects/' + document.body.dataset.prospect;
  const specialist = document.body.dataset.specialist;
  const launcherCaption = document.querySelector('#crew-launcher small');
  const originalLauncherCaption = launcherCaption.textContent;
  const greeting = document.querySelector('#messages .message span');
  const originalGreeting = greeting.cloneNode(true);
  let availability = {talkAvailable:false, callAvailable:false};
  let client = null, preflight = null, active = false, generation = 0;
  let timer = null, watchdog = null, started = false, talkAttempted = false, callAttempted = false;
  let callbackBusy = false;

  async function api(action, input) {
    const response = await fetch(base + '/' + action, input === undefined ? undefined : {
      method:'POST', headers:{'Content-Type':'application/json', 'X-Owner-Action':'local-workbench'},
      body:JSON.stringify(input)
    });
    const data = await response.json();
    if (!response.ok) {
      const error=Error('Connection unavailable. Please use Chat.');
      error.connectionMessage=typeof data.error==='string'&&data.error.length<=500?data.error:error.message;
      throw error;
    }
    return data;
  }
  function say(text, state='idle') {
    status.textContent = text;
    step.dataset.state = state;
  }
  function context() {
    const current = window.crewConversationContext();
    return share.checked ? {shareContext:true, context:{lastUserRequest:current.lastUserRequest, summary:current.summary}} : {shareContext:false};
  }
  function track(name, data) { window.crewEngagement.emit(name, data); }
  function release() {
    clearTimeout(timer); clearTimeout(watchdog);
    preflight?.getTracks().forEach(track => track.stop()); preflight = null;
  }
  function stop(outcome='closed') {
    const wasStarted = started;
    generation++; active=false; started=false; release();
    const previous = client; client=null;
    try { previous?.stopCall(); } catch {}
    start.disabled=talkAttempted || !availability.talkAvailable;
    end.disabled=true; consent.disabled=false; share.disabled=false;
    if (wasStarted && ['visitor-ended','provider-ended'].includes(outcome)) {
      track('crew_conversation_completed', {channel:'talk', outcome});
    }
    if (outcome !== 'closed') say(outcome === 'error' ? 'Voice could not connect. Use Chat below. No automatic retry.' : 'Voice conversation ended. You can continue in Chat.', outcome === 'error' ? 'error' : 'ended');
    if(talkAttempted && outcome!=='closed') refreshAvailability();
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src=src; script.onload=resolve; script.onerror=()=>reject(Error('Voice tools could not load. Use Chat.'));
      document.head.append(script);
    });
  }
  let sdkPromise;
  function sdk() {
    if (!sdkPromise) sdkPromise=(async () => {
      await loadScript('/crew-assets/eventemitter3.js'); window.eventemitter3=window.EventEmitter3;
      await loadScript('/crew-assets/livekit.js'); window.livekitClient=window.LivekitClient;
      await loadScript('/crew-assets/retell.js');
      if (!window.retellClientJsSdk?.RetellWebClient) throw Error('Voice tools could not load. Use Chat.');
    })();
    return sdkPromise;
  }
  async function refreshAvailability() {
    try {availability=await api('channels');} catch {availability={talkAvailable:false,callAvailable:false};}
    for (const [channel, key] of [['talk','talkAvailable'],['call','callAvailable']]) {
      const control=document.querySelector('[data-crew-channel="'+channel+'"]');
      control.setAttribute('aria-disabled', String(!availability[key]));
      control.querySelector('small').textContent=availability[key] ? (channel==='talk'?'Available · Up to two minutes':'Available · Verified demo number only') : 'Currently unavailable';
    }
    start.disabled=!availability.talkAvailable || talkAttempted || active;
    callSubmit.disabled=!availability.callAvailable || callAttempted || callbackBusy;
    document.querySelector('[data-crew-copy-preview]').hidden=availability.talkAvailable;
    document.querySelector('[data-crew-copy-live]').hidden=!availability.talkAvailable;
    document.querySelector('#invitation-voice-status').textContent=availability.talkAvailable?'Voice available · Microphone starts with your permission.':availability.reason?.includes('exhausted')?'Voice test allowance used · Chat remains available.':'Voice preview — not connected yet.';
    launcherCaption.textContent=availability.talkAvailable?'AI specialist · Voice available':availability.callAvailable?'AI specialist · Phone demo available':originalLauncherCaption;
    const anyAvailable=availability.talkAvailable || availability.callAvailable;
    if (availability.talkAvailable) {
      const liveCopy=document.querySelector('[data-crew-copy-live]');
      greeting.replaceChildren(...[...liveCopy.childNodes].map(node=>node.cloneNode(true)));
      greeting.append(' I can explain the reviewed services and help prepare your request for the team. '+(availability.callAvailable?'Call me is also available for the verified demo number.':'Call me is currently unavailable.')+' Chat is available if you prefer typing. Use fictional details in this private concept.');
    } else if (availability.callAvailable) {
      greeting.textContent='Hi, I’m '+specialist+'. Call me is available for a real phone conversation at the verified demo number. I can explain the reviewed services and help you choose a useful next step. Talk Here is currently unavailable; you can keep typing in Chat. Use fictional details in this private concept.';
    } else if(availability.reason?.includes('exhausted')) {
      launcherCaption.textContent='AI specialist · Voice test used';
      greeting.textContent='The supervised voice test allowance has been used. You can continue with '+specialist+' in Chat while a new voice test is prepared.';
    } else greeting.replaceChildren(...[...originalGreeting.childNodes].map(node=>node.cloneNode(true)));
    const availabilityNote=document.querySelector('[data-crew-availability-note]');
    if(availabilityNote) availabilityNote.textContent=anyAvailable?'Chat works here. '+(availability.talkAvailable?'Talk Here is available after consent. ':'Talk Here is currently unavailable. ')+(availability.callAvailable?'Call me is available for the verified demo number.':'Call me is currently unavailable.'):'Chat works in this demo. Talk Here and Call me are currently unavailable.';
    document.querySelector('#voice-context-availability').textContent=anyAvailable?'Talk Here uses your microphone and plays replies in this window when available. Call me requests a phone call when available. Each starts only after your consent.':'Talk Here would use your browser microphone. Call me would request a phone call. Each requires explicit consent and a validated connection; neither is enabled here.';
    document.querySelector('#voice-context-handoff').textContent=anyAvailable?'You can optionally share your recent text request with this AI connection. A callback requires consent and the verified demo number. This demo cannot confirm bookings or transfer you to another specialist.':'In a connected Crew, you could agree to a call from a digital Sales Specialist with your needs, preferences and unanswered questions carried forward. Keep chatting, decline, or request a person instead. This preview collects no number and schedules no call.';
    document.querySelector('#voice-context-privacy').textContent=anyAvailable?'This summary stays in page memory unless you explicitly choose to share it for a voice or callback request.':'This summary stays in page memory. It is not sent to a voice service.';
    if(!active && step.hidden && callForm.hidden) say(availability.talkAvailable?'Choose Talk Here for a conversation in this window, Call me for an available phone alternative, or Chat below.':availability.callAvailable?'Choose Call me for a phone conversation at the verified demo number, or Chat below. Talk Here is currently unavailable.':'Talk Here and Call me are currently unavailable. Chat works below.');
    return availability;
  }
  function open(channel) {
    if (channel==='chat') {if(active)stop('visitor-ended');step.hidden=true; callForm.hidden=true;shareContainer.hidden=true; return;}
    if (active) return;
    share.checked=false;
    shareContainer.hidden=!(channel==='talk'?availability.talkAvailable:availability.callAvailable);
    step.hidden=channel!=='talk' || !availability.talkAvailable;
    callForm.hidden=channel!=='call' || !availability.callAvailable;
    if (channel==='talk') say(availability.talkAvailable ? 'Speak to '+specialist+' right here. Agree to the AI voice disclosure, then choose Start Talking.' : 'Talk Here is currently unavailable. Chat works below.');
    else say(availability.callAvailable ? 'Enter your verified demo number and agree to receive this AI call. The call starts only after you choose Call Me Now.' : 'Call me is currently unavailable. Chat works below.');
  }
  start.addEventListener('click', async () => {
    if (active || talkAttempted || !availability.talkAvailable) return;
    if (!consent.checked) {say('Please agree to the AI voice disclosure first.'); consent.focus(); return;}
    if (!isSecureContext || !navigator.mediaDevices?.getUserMedia) {say('Voice needs a secure page with microphone support. Please use Chat.','error'); return;}
    active=true; const current=++generation; start.disabled=true; end.disabled=false; consent.disabled=true; share.disabled=true;
    say('Preparing voice…','connecting');
    watchdog=setTimeout(()=>{if (generation===current) stop('error');},25000);
    let phase='availability';
    try {
      await refreshAvailability();
      if (generation!==current) return;
      if (!availability.talkAvailable) throw Error('Voice is unavailable. Use Chat.');
      phase='tools';await sdk(); if (generation!==current) return;
      phase='microphone';
      const granted=await navigator.mediaDevices.getUserMedia({audio:true});
      if (generation!==current) {granted.getTracks().forEach(track=>track.stop()); return;}
      preflight=granted;
      phase='session';const session=await api('channel-session',{channel:'talk'});
      if (generation!==current) return;
      talkAttempted=true;
      phase='provider';const join=await api('voice-session',{sessionToken:session.sessionToken,consent:true,...context()});
      if (generation!==current) return;
      preflight.getTracks().forEach(track=>track.stop()); preflight=null;
      phase='audio';const joiningClient=new window.retellClientJsSdk.RetellWebClient();
      client=joiningClient;
      client.on('call_started',()=>{
        if (generation!==current) return;
        clearTimeout(watchdog); started=true;
        say('Connected to '+specialist+' · Microphone on. Speak naturally; replies play here.','live');
        track('crew_conversation_started',{channel:'talk',connected:true});
      });
      client.on('call_ended',()=>{if(generation===current)stop('provider-ended');});
      client.on('error',()=>{if(generation===current){stop('error');say('Browser audio could not connect. The test attempt has been used; no automatic retry. Please use Chat.','error');}});
      timer=setTimeout(()=>{if(generation===current)stop('visitor-ended');},115000);
      await joiningClient.startCall({accessToken:join.access_token,callId:join.call_id,transport:join.transport,iceServers:join.ice_servers});
      if (generation!==current) {try{joiningClient.stopCall();}catch{} return;}
    } catch(error) {
      if(generation===current){
        stop('error');
        const detail=error.connectionMessage || (phase==='microphone'?'Microphone access failed. Check browser permission and your input device; no provider call was requested.':phase==='tools'?'Browser voice tools could not load. No provider call was requested.':'Voice could not connect at the '+phase+' step. Please use Chat; no automatic retry.');
        say(detail,'error');
      }
    }
  });
  end.addEventListener('click',()=>stop('visitor-ended'));
  function close(){if(active)stop();else generation++;phone.value='';callConsent.checked=false;}
  panel.addEventListener('close',close);
  panel.addEventListener('cancel',close);
  window.addEventListener('pagehide',()=>stop());
  callForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (callbackBusy || callAttempted || !availability.callAvailable) return;
    if (!callConsent.checked) {say('Please confirm the number is yours and agree to the AI call.'); callConsent.focus(); return;}
    if (!/^\+[1-9]\d{7,14}$/.test(phone.value.trim())) {say('Use the verified demo number in international format, starting with +.'); phone.focus(); return;}
    callbackBusy=true; callSubmit.disabled=true;
    const current=generation, requestedPhone=phone.value.trim(), requestedContext=context();
    say('Submitting your call request…','connecting');
    try {
      const session=await api('channel-session',{channel:'call'});
      if(generation!==current)return;
      callAttempted=true;
      const result=await api('callback',{sessionToken:session.sessionToken,consent:true,phone:requestedPhone,phoneConfirmed:true,...requestedContext});
      if(generation!==current)return;
      if (result.status !== 'accepted') throw Error('Unexpected callback result');
      phone.value=''; callConsent.checked=false;
      say('Request accepted by the call service. Pickup is not confirmed from this page.','accepted');
      track('crew_handoff_requested',{channel:'call',destination:'phone',draftOnly:false,connected:false});
    } catch(error) {say(error.message || 'Call request unavailable. Please use Chat.','error');}
    finally {callbackBusy=false; callSubmit.disabled=callAttempted || !availability.callAvailable;await refreshAvailability();}
  });
  window.crewVoice={open,refreshAvailability,get availability(){return availability;}};
  refreshAvailability();
})();
