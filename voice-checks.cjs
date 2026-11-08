const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function recognitionEvent(text,isFinal=true,alternatives=[]){const result=[{transcript:text},...alternatives.map(transcript=>({transcript}))];result.isFinal=isFinal;return{resultIndex:0,results:[result]}}

function boot(options={}){
  const storage=options.storage||new Map(),elements=new Map(),listeners={};
  let clock=1000,nextTimer=1;
  const timers=new Map(),recognizers=[],utterances=[];
  const el=selector=>{
    if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',value:'',attributes:{},style:{setProperty(k,v){this[k]=v}},setAttribute(k,v){this.attributes[k]=v},classList:{add(){},remove(){},toggle(){}},focus(){}});
    return elements.get(selector);
  };
  const schedule=(callback,delay,interval)=>{const id=nextTimer++;timers.set(id,{callback,due:clock+Math.max(0,delay),interval});return id};
  function tick(ms){
    const target=clock+ms;
    for(let calls=0;calls<10000;calls++){
      const next=[...timers].filter(([,t])=>t.due<=target).sort((a,b)=>a[1].due-b[1].due||a[0]-b[0])[0];
      if(!next){clock=target;return}
      const [id,timer]=next;clock=timer.due;
      if(timer.interval)timer.due+=timer.interval;else timers.delete(id);
      timer.callback();
    }
    throw Error('Fake timer loop did not settle');
  }
  class Recognition{
    constructor(){if(options.constructorError)throw Error('Recognition unavailable');recognizers.push(this);this.startCalls=0;this.abortCalls=0}
    start(){this.startCalls++;if(options.startError)throw Error('User gesture required')}
    abort(){this.abortCalls++}
    begin(){this.onstart?.({})}
    result(text,isFinal=true,alternatives=[]){this.onresult?.(recognitionEvent(text,isFinal,alternatives))}
    error(error){this.onerror?.({error})}
    end(){this.onend?.({})}
  }
  class Utterance{constructor(text){this.text=text}}
  const synthesis={cancelCalls:0,getVoices:()=>options.voices||(options.uzbekVoice===false?[]:[{name:'Uzbek test voice',lang:'uz-UZ'}]),speak(u){utterances.push(u)},cancel(){this.cancelCalls++}};
  const document={hidden:false,querySelector:el,documentElement:{},activeElement:{tagName:'BODY'},addEventListener:(name,callback)=>listeners[name]=callback};
  const window={scrollTo(){},open(){},speechSynthesis:synthesis,addEventListener:(name,callback)=>listeners[name]=callback};
  if(options.recognition!==false)window[options.prefixed?'webkitSpeechRecognition':'SpeechRecognition']=Recognition;
  const context=vm.createContext({console,Date,Math,JSON,Map,Set,performance:{now:()=>clock},setTimeout:(fn,ms)=>schedule(fn,ms,0),clearTimeout:id=>timers.delete(id),setInterval:(fn,ms)=>schedule(fn,ms,ms),clearInterval:id=>timers.delete(id),localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{hash:options.hash||'#unit-1',href:'https://wordly.example/#unit-1'},window,document,SpeechSynthesisUtterance:Utterance,speechSynthesis:synthesis});
  const run=source=>vm.runInContext(source,context);
  for(const file of ['vocabulary.js','elementary-vocabulary.js','upper-vocabulary.js','upper-lessons.js','library.js','i18n.js','cloze-data.js','elementary-cloze.js','upper-cloze.js','cloze.js','persistence.js','voice.js','answer-feedback.js','memory.js'])run(fs.readFileSync('dist/'+file,'utf8'));
  const start=()=>run("startSession('voice');beginVoiceRound()");
  const endPrompt=()=>{const u=utterances.at(-1);assert.ok(u,'Expected an Uzbek prompt');u.onend?.()};
  const listen=()=>{if(run('session.voiceState')==='prompting')endPrompt();const r=recognizers.at(-1);assert.ok(r,'Expected a recognizer');r.begin();return r};
  return {run,el,tick,jump:ms=>{clock+=ms},storage,timers,recognizers,utterances,synthesis,document,listeners,start,endPrompt,listen};
}

// Reading the Uzbek prompt and waiting for microphone permission consume no answer time.
let app=boot();app.start();
assert.equal(app.run('session.voiceState'),'prompting');assert.equal(app.recognizers.length,0);
assert.equal(app.run('voiceRuntime.deadline'),0);app.tick(4000);
assert.equal(app.run('session.voiceRemaining'),10);assert.equal(app.run('session.checked'),false);
app.endPrompt();assert.equal(app.run('session.voiceState'),'starting');app.tick(4000);
assert.equal(app.run('voiceRuntime.deadline'),0);assert.equal(app.run('Object.keys(progress).length'),0);
const rec=app.listen();const deadline=app.run('voiceRuntime.deadline');
assert.equal(deadline,19000);assert.equal(rec.lang,'en-US');assert.equal(app.run('session.voiceRemaining'),10);
app.tick(9999);assert.equal(app.run('session.checked'),false);
app.tick(1);assert.equal(app.run('session.checked'),true);assert.equal(app.run('session.voiceTimedOut'),true);
assert.equal(app.run('status(session.words[0])'),'unknown');assert.match(app.el('#app').innerHTML,/Vaqt tugadi/);
assert.ok(app.el('#app').innerHTML.includes(app.run('session.words[0].en')),'Timeout reveals the English answer');
assert.equal(app.run('progress[session.words[0].id].attempts'),1);assert.equal(app.timers.size,0);
app.tick(20000);assert.equal(app.run('progress[session.words[0].id].attempts'),1,'Timeout grades once');

// Interim text is visible but ungraded; a wrong final utterance leaves the remaining window open.
app=boot({uzbekVoice:false,prefixed:true});app.start();assert.equal(app.run('session.voiceAudioUnavailable'),true);
assert.match(app.el('#app').innerHTML,/o‘zbekcha ovoz topilmadi/);
let current=app.listen(),answer=app.run('session.words[0].en');
current.result(answer,false);assert.equal(app.run('session.checked'),false);assert.equal(app.run('Object.keys(progress).length'),0);
app.tick(2000);current.result('a different word');assert.equal(app.run('session.checked'),false);
assert.equal(app.run('Object.keys(progress).length'),0);app.tick(1000);
const staleResult=current.onresult;
current.result(answer.toUpperCase());assert.equal(app.run('session.checked'),true);assert.equal(app.run('session.correct'),true);
assert.equal(app.run('status(session.words[0])'),'known');assert.equal(current.abortCalls,1);assert.equal(app.timers.size,0);
staleResult(recognitionEvent(answer));assert.equal(app.run('progress[session.words[0].id].attempts'),1);
app.run('advance()');assert.equal(app.run('session.index'),1);assert.equal(app.run('session.checked'),false);
staleResult(recognitionEvent(answer));assert.equal(app.run('Object.keys(session.ratings).length'),1,'Old word callback cannot grade the next word');

// Silence-triggered recognition restarts preserve the original deadline.
app=boot({uzbekVoice:false});app.start();current=app.listen();
const originalDeadline=app.run('voiceRuntime.deadline');app.tick(2000);current.end();
assert.equal(app.recognizers.length,2);app.recognizers.at(-1).begin();
assert.equal(app.run('voiceRuntime.deadline'),originalDeadline);app.tick(8000);
assert.equal(app.run('session.voiceTimedOut'),true);assert.equal(app.run('progress[session.words[0].id].attempts'),1);

// onstart can synchronously pause or settle; it must not create a timer afterwards.
app=boot({uzbekVoice:false});app.start();current=app.recognizers.at(-1);
app.document.hidden=true;current.begin();
assert.equal(app.run('session.voiceState'),'paused');assert.equal(app.run('session.checked'),false);
assert.equal(app.run('Object.keys(progress).length'),0);assert.equal(current.abortCalls,1);
assert.equal(app.timers.size,0,'Hidden initial onstart must not allocate a stale interval');
app.tick(20000);assert.equal(app.run('Object.keys(progress).length'),0);

app=boot({uzbekVoice:false});app.start();current=app.listen();app.tick(2000);current.end();
const delayedRestart=app.recognizers.at(-1);
app.jump(8001); // A suspended browser delivers onstart before its overdue timer callbacks.
delayedRestart.begin();
assert.equal(app.run('session.checked'),true);assert.equal(app.run('session.voiceTimedOut'),true);
assert.equal(app.run('progress[session.words[0].id].attempts'),1);assert.equal(delayedRestart.abortCalls,1);
assert.equal(app.timers.size,0,'Expired restart onstart must not allocate a stale interval');
app.tick(20000);assert.equal(app.run('progress[session.words[0].id].attempts'),1);

// Callbacks from a stopped recognizer cannot affect its replacement in the same round.
app=boot({uzbekVoice:false});app.start();current=app.listen();
const replacedResult=current.onresult,replacedEnd=current.onend,replacedError=current.onerror;
current.end();const replacement=app.recognizers.at(-1);
replacedResult(recognitionEvent(app.run('session.words[0].en')));replacedEnd();replacedError({error:'network'});
assert.equal(app.run('session.checked'),false);assert.equal(app.run('Object.keys(progress).length'),0);
assert.equal(app.recognizers.length,2);assert.equal(app.run('session.voiceState'),'starting');assert.equal(replacement.abortCalls,0);
replacement.begin();replacement.result(app.run('session.words[0].en'));assert.equal(app.run('session.correct'),true);

// Recognition service failures and denied permission never become incorrect vocabulary answers.
for(const error of ['not-allowed','service-not-allowed','audio-capture','network','language-not-supported']){
  app=boot({uzbekVoice:false});app.start();current=app.recognizers.at(-1);current.error(error);
  assert.equal(app.run('session.voiceState'),'error',error);assert.equal(app.run('session.checked'),false,error);
  assert.equal(app.run('Object.keys(progress).length'),0,error);assert.equal(app.timers.size,0,error);
  app.tick(20000);assert.equal(app.run('Object.keys(progress).length'),0,error);
}
app=boot({uzbekVoice:false,startError:true});app.start();assert.equal(app.run('session.voiceState'),'error');assert.equal(app.run('Object.keys(progress).length'),0);
app=boot({uzbekVoice:false,constructorError:true});app.start();assert.equal(app.run('session.voiceState'),'error');assert.equal(app.run('Object.keys(progress).length'),0);
app=boot({uzbekVoice:false});app.start();app.tick(15000);assert.equal(app.run('session.voiceState'),'error');assert.equal(app.run('Object.keys(progress).length'),0,'Microphone-start watchdog does not grade');

// Exiting or backgrounding cancels every runtime resource and invalidates stale callbacks.
app=boot();app.start();const latePrompt=app.utterances.at(-1).onend;
app.run("action('exit')");latePrompt();assert.equal(app.recognizers.length,0);assert.equal(app.timers.size,0);assert.equal(app.run('session'),null);
app=boot({uzbekVoice:false});app.start();current=app.listen();const lateRecognition=current.onresult;
app.tick(1000);app.document.hidden=true;app.listeners.visibilitychange();
assert.equal(app.run('session.voiceState'),'paused');assert.equal(current.abortCalls,1);assert.equal(app.timers.size,0);
lateRecognition(recognitionEvent(app.run('session.words[0].en')));app.tick(20000);assert.equal(app.run('Object.keys(progress).length'),0);
app.document.hidden=false;app.run('beginVoiceRound()');assert.equal(app.run('session.voiceRemaining'),10);

// Unsupported environments provide a useful alternative without penalty.
app=boot({recognition:false});app.start();assert.equal(app.run('session.voiceState'),'unsupported');
assert.equal(app.run('Object.keys(progress).length'),0);assert.equal(app.timers.size,0);
assert.match(app.el('#app').innerHTML,/Brauzerda ochish/);assert.match(app.el('#app').innerHTML,/Inglizchasini yozib mashq qilish/);
app.run('voiceTextFallback()');assert.equal(app.run('session.mode'),'write');assert.equal(app.run('session.direction'),'en');

// A checkpoint restores feedback as feedback; an interrupted active round restores safely idle.
const storage=new Map();app=boot({storage,uzbekVoice:false});app.start();current=app.listen();
current.result(app.run('session.words[0].en'));
const id=app.run('session.words[0].id'),attempts=app.run('progress[session.words[0].id].attempts');
app=boot({storage,uzbekVoice:false});app.run('resumeSession()');
assert.equal(app.run('session.mode'),'voice');assert.equal(app.run('session.checked'),true);assert.equal(app.run('session.voiceState'),'feedback');
assert.equal(app.recognizers.length,0);assert.equal(app.run(`progress[${JSON.stringify(id)}].attempts`),attempts);
app.run('advance()');app.listen();app.tick(2000);app.run('saveActiveSession()');
app=boot({storage,uzbekVoice:false});app.run('resumeSession()');
assert.equal(app.run('session.index'),1);assert.equal(app.run('session.checked'),false);assert.equal(app.run('session.voiceState'),'ready');assert.equal(app.run('session.voiceRemaining'),10);assert.equal(app.recognizers.length,0);

// Exact matching accepts case, punctuation, known UK/US variants and spaced letter acronyms.
assert.equal(app.run("voiceMatches({en:'colour'},'COLOR')"),true);
assert.equal(app.run("voiceMatches({en:'organise'},'organize.')"),true);
assert.equal(app.run("voiceMatches({en:'CV'},'C V')"),true);
assert.equal(app.run("voiceMatches({en:'get on'},'get on with')"),false);
assert.equal(app.run("voiceMatches({en:'right'},'light')"),false);
app=boot({uzbekVoice:false});app.start();current=app.listen();
current.result('wrong first alternative',true,[app.run('session.words[0].en')]);assert.equal(app.run('session.correct'),true,'An exact final alternative may match');
console.log('Passed: voice prompt/permission timing, exact 10-second timeout, final-only recognition, retry window, errors without penalty, stale callbacks, background cancellation, unsupported fallback, voice checkpoints and spoken-answer matching.');
app=boot({voices:[{name:'Russian test voice',lang:'ru-RU'}]});
app.run("changeLanguage('ru')");app.start();
assert.equal(app.utterances.at(-1).lang,'ru-RU');
assert.equal(app.utterances.at(-1).text,app.run('session.words[0].ru'));
assert.match(app.el('#app').innerHTML,/Читаем значение по-русски/);
current=app.listen();assert.equal(current.lang,'en-US');
const staleRussianResult=current.onresult;
app.run("changeLanguage('uz')");
assert.equal(current.abortCalls,1);assert.equal(app.timers.size,0);
staleRussianResult(recognitionEvent('routine'));
assert.equal(app.run('Object.keys(progress).length'),0,'Language switch cancels stale recognition without grading');
app=boot({voices:[{name:'Uzbek test voice',lang:'uz-UZ'}]});app.run("changeLanguage('ru')");app.start();
assert.equal(app.run('session.voiceAudioUnavailable'),true);
assert.match(app.el('#app').innerHTML,/нет русского голоса/);
console.log('Passed: Russian TTS prompt, English recognition, missing Russian voice fallback, and resource cleanup on language change.');
