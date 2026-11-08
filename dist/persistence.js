// Word ratings and per-unit session checkpoints stay on this browser between visits.
let savedSessions={},checkpointReadError=false;
function validCheckpoint(value,number){
  const elementary=String(number).startsWith('elementary:');
  const book=libraryBooks.find(b=>b.id===(elementary?'elementary':'intermediate'));
  const unitNumber=elementary?Number(String(number).slice(11)):Number(number);
  const u=book.units.find(u=>u.number===unitNumber);
  if(!u||!value||!['flash','write','voice','cloze'].includes(value.mode)||!['uz','en'].includes(value.direction))return false;
  if(value.mode==='cloze'&&value.direction!=='en')return false;
  const ids=value.wordIds;
  if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||!ids.every(id=>u.words.some(w=>w.id===id)))return false;
  if(value.mode==='cloze'&&!ids.every(id=>clozeByWord.has(id)))return false;
  if(!Number.isInteger(value.index)||value.index<0||value.index>=ids.length)return false;
  if(!value.ratings||typeof value.ratings!=='object'||Array.isArray(value.ratings))return false;
  if(!Object.entries(value.ratings).every(([id,r])=>ids.includes(id)&&['known','unknown'].includes(r)))return false;
  if(!ids.slice(0,value.index).every(id=>value.ratings[id]))return false;
  if(typeof value.checked!=='boolean'||typeof value.answer!=='string'||value.answer.length>2000)return false;
  if(value.checked&&(!['write','voice','cloze'].includes(value.mode)||!value.ratings[ids[value.index]]))return false;
  return true;
}
function loadSavedSessions(){
  savedSessions={};checkpointReadError=false;
  try{
    const values=JSON.parse(localStorage.getItem(checkpointStorageKey())||'{}');
    if(values&&typeof values==='object')for(const[n,v]of Object.entries(values))if(validCheckpoint(v,n))savedSessions[n]=v;
  }catch{checkpointReadError=true}
}
loadSavedSessions();
function checkpointFor(u){return savedSessions[checkpointKey(u)]||null}
function completedUnit(u){return u.words.every(w=>status(w)!=='new')}
function saveActiveSession(){
  if(!session||!unit)return;
  if(session.index>=session.words.length)delete savedSessions[checkpointKey(unit)];
  else savedSessions[checkpointKey(unit)]={
    wordIds:session.words.map(w=>w.id),index:session.index,ratings:{...session.ratings},
    mode:session.mode,direction:session.direction,checked:session.checked,
    answer:session.answer,correct:session.correct,flipped:session.flipped,updated:Date.now(),
    voiceTimedOut:!!session.voiceTimedOut,voiceAudioUnavailable:!!session.voiceAudioUnavailable
  };
  try{localStorage.setItem(checkpointStorageKey(),JSON.stringify(savedSessions))}
  catch{storageError=true;notify('Mashqni saqlab bo‘lmadi. Brauzer xotirasini tekshiring.')}
}
function resumeSession(){
  const saved=checkpointFor(unit);if(!saved)return;
  stopVoiceRound();
  session={words:saved.wordIds.map(id=>byId.get(id)),index:saved.index,ratings:{...saved.ratings},
    mode:saved.mode,direction:saved.direction,checked:saved.checked,answer:saved.answer,
    correct:saved.checked&&saved.ratings[saved.wordIds[saved.index]]==='known',flipped:!!saved.flipped,
    voiceState:saved.checked?'feedback':'ready',voiceRemaining:10,voiceTimedOut:!!saved.voiceTimedOut,voiceAudioUnavailable:!!saved.voiceAudioUnavailable};
  render();window.scrollTo(0,0);focusAnswer();
}
function resumePrompt(u){const saved=checkpointFor(u);return saved?`<section class="resume-panel"><div><strong>Mashq yarim qolgan</strong><p>${saved.index+1} / ${saved.wordIds.length}-kartochkadan davom eting. Natijalar saqlangan.</p></div><button class="button primary" data-action="resume">Davom etish ${svg('arrow')}</button></section>`:''}
