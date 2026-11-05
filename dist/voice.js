const voiceRuntime={generation:0,recognition:null,utterance:null,timer:null,watchdog:null,deadline:0,restarts:0};
const voiceClock=()=>typeof performance!=='undefined'?performance.now():Date.now();
const recognitionType=()=>window.SpeechRecognition||window.webkitSpeechRecognition;
window.speechSynthesis?.getVoices?.();
const micIcon=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>';
function stopVoiceRound(){
  voiceRuntime.generation++;
  clearInterval(voiceRuntime.timer);clearTimeout(voiceRuntime.watchdog);
  voiceRuntime.timer=null;voiceRuntime.watchdog=null;voiceRuntime.deadline=0;
  const rec=voiceRuntime.recognition;voiceRuntime.recognition=null;
  if(rec){rec.onstart=null;rec.onresult=null;rec.onerror=null;rec.onend=null;try{rec.abort()}catch{}}
  const utterance=voiceRuntime.utterance;voiceRuntime.utterance=null;
  if(utterance){utterance.onend=null;utterance.onerror=null;window.speechSynthesis?.cancel()}
}
function voiceCurrent(s,index,generation){return session===s&&s.mode==='voice'&&s.index===index&&!s.checked&&voiceRuntime.generation===generation}
function canonicalVoice(value){
  const spellings={colour:'color',colourful:'colorful',humour:'humor',favourite:'favorite',centre:'center',centres:'centers',organise:'organize',organisation:'organization',travelling:'traveling',travelled:'traveled',theatre:'theater',grey:'gray',realise:'realize',apologise:'apologize'};
  return normalise(value).replace(/\b[a-z]+\b/g,word=>spellings[word]||word);
}
function voiceMatches(w,transcript){
  const heard=canonicalVoice(transcript);
  return acceptedAnswers(w,'en').some(answer=>canonicalVoice(answer)===heard)||(/^[A-Z]{2,6}$/.test(w.en)&&heard.replace(/\s/g,'')===w.en.toLowerCase());
}
function voiceView(w){
  const s=session,state=s.voiceState||'ready',busy=['prompting','starting','listening'].includes(state),remaining=s.voiceRemaining??10;
  if(s.checked)return `<section class="voice-card voice-feedback"><span class="eyebrow">2-USUL · OVOZLI JAVOB</span><p class="voice-prompt" lang="uz">${html(w.uz)}</p><div class="answer-feedback ${s.correct?'known':'unknown'}" role="status"><strong>${s.correct?'To‘g‘ri!':s.voiceTimedOut?'Vaqt tugadi':'Yana mashq qiling'}</strong><span class="voice-correct-answer" lang="en">${html(w.en)}</span><small>${s.answer?`Siz aytdingiz: ${html(s.answer)}`:'Inglizcha javob eshitilmadi.'}</small></div><button class="button secondary" data-sound="${w.id}">${svg('audio')} To‘g‘ri talaffuzni tinglash</button><button class="button primary" data-action="next">Davom etish ${svg('arrow')}</button></section>`;
  const descriptions={ready:'O‘zbekcha ma’nosini eshiting. Inglizchasini 10 soniyada ayting.',prompting:'O‘zbekcha ma’no o‘qilmoqda…',starting:'Mikrofon ruxsatini kutyapmiz. Vaqt hali boshlanmadi.',listening:'Tinglayapman. Inglizchasini ayting!',paused:'Mashq to‘xtatildi. Davom etganda yangi 10 soniya beriladi.',error:s.voiceReason||'Mikrofon ishlamadi. Qayta urinib ko‘ring.',unsupported:'Bu brauzer ovozli javobni taniy olmaydi. Saytni Chrome yoki Safari orqali oching.'};
  return `<section class="voice-card"><span class="eyebrow">2-USUL · OVOZLI JAVOB</span><div id="voice-countdown" class="voice-countdown ${remaining<=3&&state==='listening'?'urgent':''}" style="--time-left:${remaining/10*100}%" role="progressbar" aria-label="Javob uchun qolgan soniyalar" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${remaining}"><div><strong id="voice-seconds">${remaining}</strong><span>soniya</span></div></div><p class="voice-prompt" lang="uz">${html(w.uz)}</p><p class="voice-instruction" id="voice-instruction" role="status">${html(descriptions[state]||descriptions.ready)}</p>${s.voiceAudioUnavailable?'<p class="voice-note">Qurilmada o‘zbekcha ovoz topilmadi. Ma’noni ekrandan o‘qib javob bering.</p>':''}${state==='listening'?`<div class="voice-listening">${micIcon()} Mikrofon yoqilgan</div><p class="voice-transcript" id="voice-transcript" aria-live="polite">${html(s.answer||'Javobingiz shu yerda ko‘rinadi…')}</p>`:''}${!busy&&state!=='unsupported'?`<button class="button primary" data-action="voice-begin">${micIcon()} ${['error','paused'].includes(state)?'Mikrofonni yoqish':'Tinglash va aytish'}</button>`:''}${busy?'<button class="button secondary" data-action="voice-pause">To‘xtatish</button>':''}${['unsupported','error'].includes(state)?'<button class="button secondary" data-action="voice-browser">Brauzerda ochish</button><button class="voice-text-fallback" data-action="voice-write">Inglizchasini yozib mashq qilish</button>':''}<p class="voice-note">Mikrofon uchun ruxsat kerak. Javob va natijangiz saqlanadi.</p></section>`;
}
function beginVoiceRound(){
  const s=session;if(!s||s.mode!=='voice'||s.checked||!s.words[s.index])return;
  stopVoiceRound();s.voiceRemaining=10;s.answer='';s.voiceTimedOut=false;s.voiceReason='';
  if(!recognitionType()){s.voiceState='unsupported';saveActiveSession();render();return}
  const index=s.index,generation=voiceRuntime.generation;
  voiceRuntime.restarts=0;
  const start=()=>{if(voiceCurrent(s,index,generation))startVoiceRecognition(s,index,generation)};
  const synthesis=window.speechSynthesis;
  const UzbekVoice=synthesis?.getVoices?.().find(v=>/^uz(?:-|_|$)/i.test(v.lang));
  if(UzbekVoice&&typeof SpeechSynthesisUtterance!=='undefined'){
    s.voiceAudioUnavailable=false;s.voiceState='prompting';render();
    const utterance=new SpeechSynthesisUtterance(s.words[index].uz);
    utterance.lang='uz-UZ';utterance.voice=UzbekVoice;utterance.rate=.95;voiceRuntime.utterance=utterance;
    const done=()=>{if(!voiceCurrent(s,index,generation))return;clearTimeout(voiceRuntime.watchdog);voiceRuntime.watchdog=null;voiceRuntime.utterance=null;start()};
    utterance.onend=done;utterance.onerror=()=>{if(voiceCurrent(s,index,generation))s.voiceAudioUnavailable=true;done()};
    voiceRuntime.watchdog=setTimeout(()=>{if(!voiceCurrent(s,index,generation))return;utterance.onend=null;utterance.onerror=null;synthesis.cancel();s.voiceAudioUnavailable=true;voiceRuntime.utterance=null;start()},15000);
    try{synthesis.cancel();synthesis.speak(utterance)}catch{s.voiceAudioUnavailable=true;done()}
  }else{s.voiceAudioUnavailable=true;start()}
}
function startVoiceRecognition(s,index,generation){
  if(!voiceCurrent(s,index,generation))return;
  if(voiceRuntime.deadline&&voiceClock()>=voiceRuntime.deadline)return settleVoice(false,true);
  let rec;try{rec=new (recognitionType())()}catch{return voiceError('Ovozni tanish ishga tushmadi. Brauzerda ochib ko‘ring.')}
  voiceRuntime.recognition=rec;rec.lang='en-US';rec.interimResults=true;rec.continuous=true;rec.maxAlternatives=5;
  const current=()=>voiceCurrent(s,index,generation)&&voiceRuntime.recognition===rec;
  s.voiceState='starting';render();
  rec.onstart=()=>{
    if(!current())return;
    clearTimeout(voiceRuntime.watchdog);voiceRuntime.watchdog=null;
    if(!voiceRuntime.deadline)voiceRuntime.deadline=voiceClock()+10000;
    s.voiceState='listening';render();updateVoiceClock(s,index,generation);
    if(current()&&!voiceRuntime.timer)voiceRuntime.timer=setInterval(()=>updateVoiceClock(s,index,generation),100);
  };
  rec.onresult=event=>{
    if(!current()||!voiceRuntime.deadline)return;
    if(voiceClock()>=voiceRuntime.deadline)return settleVoice(false,true);
    for(let i=event.resultIndex||0;i<event.results.length;i++){
      const result=event.results[i],alternatives=Array.from(result).map(a=>String(a.transcript||'').trim()).filter(Boolean);
      if(!alternatives.length)continue;
      s.answer=alternatives[0].slice(0,2000);const transcript=$('#voice-transcript');if(transcript)transcript.textContent=s.answer;
      if(result.isFinal){saveActiveSession();const match=alternatives.find(text=>voiceMatches(s.words[index],text));if(match){s.answer=match.slice(0,2000);settleVoice(true,false);return}}
    }
  };
  rec.onerror=event=>{
    if(!current())return;
    if(event.error==='no-speech')return;
    const reasons={'not-allowed':'Mikrofonga ruxsat berilmadi. Brauzer sozlamasidan ruxsat berib qayta bosing.','service-not-allowed':'Bu oynada ovozni tanish bloklangan. Saytni tashqi brauzerda oching.','audio-capture':'Mikrofon topilmadi yoki boshqa dastur band qilgan.','network':'Ovozni tanishda tarmoq xatosi. Internetni tekshirib qayta urinib ko‘ring.','language-not-supported':'Brauzer inglizcha ovozni tanishni qo‘llamayapti.'};
    voiceError(reasons[event.error]||'Ovozni tanish to‘xtadi. Qayta urinib ko‘ring.');
  };
  rec.onend=()=>{
    if(!current())return;
    if(voiceRuntime.deadline&&voiceClock()>=voiceRuntime.deadline)return settleVoice(false,true);
    if(voiceRuntime.restarts++<3&&voiceRuntime.deadline)startVoiceRecognition(s,index,generation);
    else voiceError('Mikrofon tinglashni to‘xtatdi. Qayta yoqing — bu xato javob hisoblanmaydi.');
  };
  voiceRuntime.watchdog=setTimeout(()=>{if(voiceCurrent(s,index,generation))voiceError('Mikrofon hali ishga tushmadi. Ruxsatni tekshirib, qayta bosing.')},15000);
  try{rec.start()}catch{voiceError('Mikrofonni yoqish uchun yana bir marta bosing yoki tashqi brauzerda oching.')}
}
function updateVoiceClock(s,index,generation){
  if(!voiceCurrent(s,index,generation))return;
  if(document.hidden)return pauseVoiceRound();
  const remaining=Math.max(0,Math.ceil((voiceRuntime.deadline-voiceClock())/1000));s.voiceRemaining=remaining;
  const seconds=$('#voice-seconds'),ring=$('#voice-countdown');
  if(seconds)seconds.textContent=String(remaining);
  if(ring){ring.style.setProperty('--time-left',Math.max(0,(voiceRuntime.deadline-voiceClock())/10000*100)+'%');ring.setAttribute('aria-valuenow',String(remaining));ring.classList.toggle('urgent',remaining<=3)}
  if(!remaining)settleVoice(false,true);
}
function settleVoice(correct,timedOut){
  const s=session;if(!s||s.mode!=='voice'||s.checked||!s.words[s.index])return;
  stopVoiceRound();s.checked=true;s.correct=correct;s.voiceTimedOut=timedOut;s.voiceState='feedback';
  const w=s.words[s.index],rating=correct?'known':'unknown';setRating(w,rating);s.ratings[w.id]=rating;
  saveActiveSession();render();$('[data-action="next"]')?.focus();
}
function voiceError(reason){const s=session;if(!s||s.mode!=='voice'||s.checked)return;stopVoiceRound();s.voiceState='error';s.voiceReason=reason;s.voiceRemaining=10;saveActiveSession();render()}
function pauseVoiceRound(){const s=session;if(!s||s.mode!=='voice'||s.checked)return;stopVoiceRound();s.voiceState='paused';s.voiceRemaining=10;saveActiveSession();render()}
function voiceTextFallback(){if(!session||session.mode!=='voice')return;const ids=session.words.slice(session.index).map(w=>w.id);startSession('write',ids);session.direction='en';saveActiveSession();render();focusAnswer()}
function openVoiceBrowser(){const url=location.origin+location.pathname+(unit?'#unit-'+unit.number:'#units');const app=window.Telegram?.WebApp;if(app?.initData&&app.openLink)app.openLink(url);else window.open(url,'_blank','noopener,noreferrer')}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&typeof session!=='undefined'&&session?.mode==='voice'&&!session.checked)pauseVoiceRound()});
