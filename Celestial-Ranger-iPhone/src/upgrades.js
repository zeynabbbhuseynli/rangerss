  var character='fernan', chats={fernan:[],oakley:[]}, busy=false, listening=false, chatAbort=null, toastTimer;
  var notes={};
  try { notes=JSON.parse(localStorage.getItem('rangerNotes')||'{}'); } catch(e){}
  function $(id){return document.getElementById(id);}
  function toast(text){var el=$('rangerToast');el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3500);}
  function nextMission(){return nearestUnvisitedFrom(200,500);}
  function renderMission(){
    var box=$('missionCard');if(!box)return;
    var next=nextMission();box.querySelector('h2').textContent=next?'Find the '+next.plantName:'Your constellation is complete';
    box.querySelector('p').textContent=next?'Follow your next clue in '+next.name+'. Every discovery brings Oakley closer to home.':'Five stamps collected. Meet at the Carousel to celebrate with Oakley and Fernan.';
    box.querySelector('.progress-rail i').style.width=(state.visitedOrder.length*20)+'%';
    $('missionProgress').textContent=state.visitedOrder.length+' of 5 discoveries';
    $('missionNext').textContent=next?'Explore next mission':'See my certificate';
    $('missionNext').onclick=()=>next?openBooth(next.id):showScreen('recap');
  }
  function renderBoothNote(id){
    if(!$('fieldNote'))return;
    $('fieldNote').value=notes[id]||'';$('noteStatus').textContent='Saved only on this device.';
    $('fieldNote').oninput=function(){notes[id]=this.value.slice(0,600);try{localStorage.setItem('rangerNotes',JSON.stringify(notes));window.RangerNative.save('rangerNotes',JSON.stringify(notes));$('noteStatus').textContent='Note saved on this device.';}catch(e){$('noteStatus').textContent='Could not save this note. Keep a copy before leaving.';}};
  }
  function renderJournal(){
    var out=$('personalJournal');out.replaceChildren();
    BOOTHS.filter(b=>notes[b.id]).forEach(b=>{var card=document.createElement('div');card.className='card';var title=document.createElement('h3');title.textContent=b.plantName;var p=document.createElement('p');p.className='journal-entry';p.textContent=notes[b.id];card.append(title,p);out.append(card);});
  }
  function renderMore(){$('moreProgress').textContent=state.rangerName+' · '+state.visitedOrder.length+'/5 discoveries · '+state.ecoPoints+' eco points';}
  function offlineReply(question){
    var q=question.toLowerCase(),b=boothById(state.currentBoothId)||nextMission()||BOOTHS[0];
    var lead=character==='fernan'?'Psst, Ranger! ':'You are doing well, Ranger. ';
    if(/lost|scared|help me|emergency/.test(q))return 'If you are really lost or need help, stay in a safe public place and ask a park team member or your trusted grown-up. I am a story character and cannot see your location or send help.';
    if(/hello|hi\b|who are|friend/.test(q))return character==='fernan'?'Hi! I am Fernan, a curious explorer with a talent for getting into adventures. Oakley usually helps me; today we are helping her. Ready to follow a clue?':'Hello, I am Oakley. I am safe in our story, and I left plant clues for you and Fernan. Taking your time and looking closely is a wonderful way to explore.';
    if(/next|mission|where/.test(q)){var n=nextMission();return lead+(n?'Your next discovery is '+n.plantName+' in '+n.name+'. Open the map and tap your next mission.':'You found all five! Visit the recap to celebrate your constellation.');}
    if(/clue|hint/.test(q))return lead+b.clue;
    if(/plant|fact|learn/.test(q))return lead+b.funFact;
    if(/progress|stamp|how many/.test(q))return lead+'You have collected '+state.visitedOrder.length+' of 5 stamps and earned '+state.ecoPoints+' eco points. Each discovery counts!';
    if(/tired|water|rest/.test(q))return character==='fernan'?'Even adventurers need a pause! Take a water break with your grown-up, find some shade, and return when you are ready.':'Rest is part of a good adventure. Pause somewhere safe with your group, drink some water, and take your time.';
    return 'This beta uses written story replies. Ask me about a clue, a plant fact, your next mission, or your stamps. Free-flowing AI conversation is not connected yet.';
  }
  function renderChat(){
    if(!$('chatLog'))return;
    $('characterBio').textContent=character==='fernan'?'Fernan · Your curious, playful companion':'Oakley · A calm voice from across the galaxy';
    document.querySelectorAll('[data-character]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.character===character)));
    if(!chats[character].length)chats[character].push({role:'assistant',content:offlineReply('hello')});
    var log=$('chatLog');log.replaceChildren();
    chats[character].forEach(m=>{var div=document.createElement('div');div.className='message'+(m.role==='user'?' user':'');var speaker=document.createElement('span');speaker.className='speaker';speaker.textContent=m.role==='user'?'You':character==='fernan'?'Fernan':'Oakley';var text=document.createElement('span');text.textContent=m.content;div.append(speaker,text);log.append(div);});
    log.scrollTop=log.scrollHeight;
    $('chatSend').disabled=busy;$('chatStatus').textContent=busy?'Listening to your question…':window.RANGER_CONFIG.apiBase?'Story chat · AI available after adult consent':'Story chat · written replies · AI not connected';
  }
  async function sendChat(text){
    text=text.trim().slice(0,500);if(!text||busy)return;
    var who=character;chats[who].push({role:'user',content:text});$('chatInput').value='';busy=true;renderChat();
    try{
      var answer;
      if(window.RANGER_CONFIG.apiBase && $('aiConsent').checked && state.mode!=='kid'){
        chatAbort=new AbortController();var timeout=setTimeout(()=>chatAbort.abort(),20000);
        try{var response=await fetch(window.RANGER_CONFIG.apiBase+'/chat',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+$('betaCode').value.trim()},body:JSON.stringify({character:who,messages:chats[who].slice(-8),progress:{stamps:state.visitedOrder.length,points:state.ecoPoints,nextPlant:nextMission()?.plantName||null}}),signal:chatAbort.signal});if(!response.ok)throw Error('unavailable');var result=await response.json();if(typeof result.text!=='string'||!result.text.trim())throw Error('empty');answer=result.text.slice(0,1600);}finally{clearTimeout(timeout);chatAbort=null;}
      }else answer=offlineReply(text);
      chats[who].push({role:'assistant',content:answer});chats[who]=chats[who].slice(-40);
      if($('readReplies').checked && character===who && document.body.dataset.screen==='chat')window.RangerNative.speak(answer,who);
    }catch(e){chats[who].push({role:'assistant',content:'The AI connection is unavailable. Your message was not answered. You can switch off AI and use the story prompts, or try again.'});}
    finally{busy=false;renderChat();}
  }
  function initUpgrade(){
    document.body.insertAdjacentHTML('beforeend','<div class="toast" id="rangerToast" role="status" hidden></div>');
    window.addEventListener('ranger-voice-error',()=>toast('Voice playback is unavailable. You can read the reply.'));
    window.addEventListener('ranger-save-error',()=>toast('Your latest progress could not be saved to the device.'));
    $('screen-map').insertAdjacentHTML('afterbegin','<div class="mission-card" id="missionCard"><div class="eyebrow">The search for Oakley</div><h2></h2><p></p><div class="progress-rail"><i></i></div><div class="mission-caption"><span id="missionProgress"></span><span>Ranger journey</span></div><button class="btn btn-primary btn-block" id="missionNext"></button></div>');
    $('stampBtn').insertAdjacentHTML('beforebegin','<div class="card"><h3>My field note</h3><label class="sub" for="fieldNote">What did you notice?</label><textarea class="name-field note-field" id="fieldNote" maxlength="600" placeholder="A color, a shape, a new discovery…"></textarea><div class="note-status" id="noteStatus" role="status"></div></div>');
    $('screen-passport').insertAdjacentHTML('beforeend','<h2 style="margin:20px 0 12px">My observations</h2><div id="personalJournal"></div>');
    document.querySelector('main').insertAdjacentHTML('beforeend',`<section class="screen" id="screen-chat"><div class="eyebrow">A little company on your journey</div><h2>Talk with your buddies</h2><div class="character-switch"><button data-character="fernan" aria-pressed="true"><img class="chat-avatar" src="assets/fernan.png" alt="">Fernan</button><button data-character="oakley" aria-pressed="false"><img class="chat-avatar" src="assets/oakley.png" alt="">Oakley</button></div><p class="chat-bio" id="characterBio"></p><div class="chat-log" id="chatLog" role="log" aria-live="polite" aria-label="Character conversation"></div><div class="suggestions"><button data-question="Where do we go next?">Next mission</button><button data-question="Give me a clue">A little hint</button><button data-question="Tell me a plant fact">Plant fact</button><button data-question="How many stamps do I have?">My progress</button></div><form id="chatForm"><label class="sub" for="chatInput">Your message</label><div class="chat-compose"><textarea class="name-field" id="chatInput" maxlength="500" rows="2" placeholder="Ask about your adventure…"></textarea><button class="btn btn-primary" id="chatSend" type="submit">Send</button></div></form><div class="voice-row"><button class="btn btn-ghost btn-sm" id="talkMic">🎙 Speak</button><button class="btn btn-ghost btn-sm" id="stopVoice">Stop voice</button><label class="sub"><input type="checkbox" id="readReplies"> Read replies aloud</label></div><p id="chatStatus" class="chat-status" role="status"></p><p class="notice">Fictional story companions. Replies in this beta are written prompts, not live people. Voice input turns speech into editable text; check it before sending. Apple may process speech. Chat messages disappear when you close the app.</p><details class="chat-enable" id="aiSettings"><summary>Adult beta tester: AI conversation</summary><p class="sub">AI replies require a configured server. Messages and mission progress are sent to that server and its AI provider. Do not include personal details. Kid mode keeps offline story replies.</p><label><input type="checkbox" id="aiConsent">I am an adult tester and consent to sending these messages.</label><label for="betaCode">Tester access code</label><input type="password" class="name-field" id="betaCode" autocomplete="off"></details><button class="btn btn-ghost btn-sm" id="clearChat">Clear conversation</button></section><section class="screen" id="screen-more"><div class="eyebrow">Your adventure toolkit</div><h2>Ranger essentials</h2><p class="sub" id="moreProgress"></p><div class="more-grid"><button class="more-tile" data-more="food"><span>🍉</span>Snack ideas</button><button class="more-tile" data-more="plushie"><span>🧸</span>Shoulder buddies</button><button class="more-tile" data-more="recap"><span>✨</span>My certificate</button><button class="more-tile" id="resetAdventure"><span>↺</span>New adventure</button></div><div class="notice"><b>Your data, on your device.</b><br>Progress and field notes stay on this device. Deleting the app removes them. Microphone access is requested only when you tap Speak. No location tracking, ads, analytics, or real orders.</div><p class="disclaimer">Unofficial fan-made concept. Not affiliated with Universal or its partners. Map, routes, distances, snack orders, and park activity are simulated.</p></section>`);
    $('aiSettings').hidden=!window.RANGER_CONFIG.apiBase;
    document.querySelector('.bottomnav-inner').innerHTML=[['map','🗺️','Explore'],['passport','📘','Journal'],['chat','💬','Talk'],['eco','🌍','Eco'],['more','✦','More']].map(n=>'<button class="navbtn" data-screen="'+n[0]+'"><span class="ic">'+n[1]+'</span><span class="lbl">'+n[2]+'</span></button>').join('');
    document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>{stopListening();showScreen(b.dataset.screen);});
    document.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>showScreen(b.dataset.more));
    document.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>{if(busy)return;stopListening();window.RangerNative.stopSpeaking();character=b.dataset.character;renderChat();});
    document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>sendChat(b.dataset.question));
    $('chatForm').onsubmit=e=>{e.preventDefault();stopListening();sendChat($('chatInput').value);};
    $('stopVoice').onclick=()=>{stopListening();window.RangerNative.stopSpeaking();};
    $('talkMic').onclick=async()=>{if(listening){await stopListening();return;}try{listening=true;$('talkMic').textContent='Stop recording';await window.RangerNative.listen(text=>{$('chatInput').value=text.slice(0,500);},()=>{listening=false;$('talkMic').textContent='🎙 Speak';});}catch(e){await stopListening();toast('Speech input is unavailable or permission was denied. You can type instead.');}};
    $('clearChat').onclick=()=>{if(busy)return;stopListening();window.RangerNative.stopSpeaking();chats={fernan:[],oakley:[]};$('betaCode').value='';$('aiConsent').checked=false;renderChat();};
    $('resetAdventure').onclick=()=>{if(confirm('Erase your stamps and field notes and start a new adventure?')){clearProgress();localStorage.removeItem('rangerNotes');window.RangerNative.remove('rangerNotes').then(()=>location.reload());}};
    document.addEventListener('visibilitychange',()=>{if(document.hidden){stopListening();window.RangerNative.stopSpeaking();}});
    setupSteps();
  }
  async function stopListening(){if(!listening)return;listening=false;$('talkMic').textContent='🎙 Speak';await window.RangerNative.stopListening();}
  function setupSteps(){
    var onboard=$('screen-onboard'),children=Array.from(onboard.children),steps=[];
    var intro=$('cinematicIntroCard'),mission=onboard.querySelector('.eyebrow-free'),mode=$('modeGrid').closest('.card'),interests=$('interestGrid').closest('.card');
    var top=document.createElement('div');top.className='step-top';top.innerHTML='<span id="stepLabel"></span><span class="step-dots"><i></i><i></i><i></i></span>';onboard.insertBefore(top,intro);
    [[intro],[mission],[mode,interests]].forEach((items,i)=>{var sec=document.createElement('div');sec.className='onboard-step';sec.dataset.step=i;items.forEach(x=>sec.append(x));onboard.append(sec);steps.push(sec);});
    var actions=document.createElement('div');actions.className='step-actions';actions.innerHTML='<button class="btn btn-ghost" id="stepBack">Back</button><button class="btn btn-primary" id="stepNext">Join the search</button>';onboard.append(actions);
    var disclaimer=children.find(x=>x.classList.contains('disclaimer'));if(disclaimer)onboard.append(disclaimer);
    var current=0;function display(){steps.forEach((s,i)=>s.hidden=i!==current);$('stepLabel').textContent=['1 / 3 · Meet your companions','2 / 3 · Become a Ranger','3 / 3 · Make it yours'][current];top.querySelectorAll('i').forEach((x,i)=>x.classList.toggle('on',i<=current));$('stepBack').hidden=current===0;$('stepNext').hidden=current===2;$('stepNext').textContent=current===0?'Join the search':'Choose my adventure';window.scrollTo(0,0);}
    $('stepNext').onclick=()=>{if(current===1&&!oathCheckbox.checked){toast('Take the Ranger Oath to continue.');oathCheckbox.focus();return;}current=Math.min(2,current+1);display();};$('stepBack').onclick=()=>{current=Math.max(0,current-1);display();};display();
  }
