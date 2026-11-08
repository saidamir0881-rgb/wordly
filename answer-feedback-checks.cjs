const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

function boot(options={}){
  const storage=options.storage||new Map(),nodes=new Map(),listeners={},timers=new Map();
  let clock=1000,nextTimer=1,renders=0;
  function node(selector,tag=''){
    const classes=new Set((tag.match(/\bclass="([^"]*)"/)?.[1]||'').split(/\s+/).filter(Boolean));
    let contents='';const attributes={};
    for(const match of tag.matchAll(/([\w-]+)="([^"]*)"/g))attributes[match[1]]=match[2];
    return{attributes,value:'',textContent:'',style:{setProperty(){}},setAttribute(k,v){attributes[k]=v},focus(){},classList:{add(...names){names.forEach(n=>classes.add(n))},remove(...names){names.forEach(n=>classes.delete(n))},contains:n=>classes.has(n),toggle(n,force){const on=force??!classes.has(n);if(on)classes.add(n);else classes.delete(n);return on}},get innerHTML(){return contents},set innerHTML(value){contents=value;if(selector==='#app'){renders++;for(const key of nodes.keys())if(key!=='#app'&&key!=='#toast')nodes.delete(key)}}};
  }
  nodes.set('#app',node('#app'));nodes.set('#toast',node('#toast'));
  const el=selector=>{
    if(nodes.has(selector))return nodes.get(selector);
    const content=nodes.get('#app').innerHTML;
    const attribute=selector.startsWith('#')?'id="'+selector.slice(1)+'"':selector.startsWith('[data-action=')?selector.slice(1,-1):'';
    if(!attribute)return null;
    const tag=content.match(new RegExp('<[^>]*'+attribute+'[^>]*>'))?.[0];
    if(!tag)return null;
    nodes.set(selector,node(selector,tag));return nodes.get(selector);
  };
  const schedule=(callback,delay,interval)=>{const id=nextTimer++;timers.set(id,{callback,due:clock+delay,interval});return id};
  function tick(ms){const target=clock+ms;for(let n=0;n<10000;n++){const next=[...timers].filter(([,t])=>t.due<=target).sort((a,b)=>a[1].due-b[1].due||a[0]-b[0])[0];if(!next){clock=target;return}const[id,t]=next;clock=t.due;if(t.interval)t.due+=t.interval;else timers.delete(id);t.callback()}throw Error('Timer loop did not settle')}
  const context=vm.createContext({console,Date,Math,JSON,Map,Set,performance:{now:()=>clock},setTimeout:(fn,ms)=>schedule(fn,ms,0),clearTimeout:id=>timers.delete(id),setInterval:(fn,ms)=>schedule(fn,ms,ms),clearInterval:id=>timers.delete(id),localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{hash:options.hash||'#unit-1',href:'https://wordly.example/#unit-1'},window:{matchMedia:()=>({matches:!!options.reducedMotion}),scrollTo(){},addEventListener:(name,fn)=>listeners[name]=fn},document:{hidden:false,querySelector:el,documentElement:{},activeElement:{tagName:'BODY'},addEventListener:(name,fn)=>listeners[name]=fn}});
  const run=source=>vm.runInContext(source,context);
  for(const file of ['vocabulary.js','elementary-vocabulary.js','upper-vocabulary.js','upper-lessons.js','library.js','i18n.js','cloze-data.js','elementary-cloze.js','upper-cloze.js','cloze.js','persistence.js','voice.js','answer-feedback.js','memory.js'])run(fs.readFileSync('dist/'+file,'utf8'));
  return{run,el,tick,timers,storage,listeners,renderCount:()=>renders,feedbackCallback:()=>timers.get(run('answerFeedback.timer')).callback};
}

// The answer is committed immediately, while the outgoing card remains visible for 420ms.
let app=boot();app.run('startSession()');
const oldMarkup=app.el('#app').innerHTML,oldCard=app.el('#flashcard'),renderCount=app.renderCount();
app.run("rate('known')");
assert.equal(app.run('session.index'),1);assert.equal(app.run('status(session.words[0])'),'known');
assert.equal(JSON.parse(app.storage.get('wordly-sessions-v1'))[1].index,1);
assert.equal(app.run('answerFeedback.active'),true);assert.equal(app.renderCount(),renderCount);
assert.equal(app.el('#app').innerHTML,oldMarkup);assert.equal(app.el('#flashcard'),oldCard);
assert.ok(oldCard.classList.contains('feedback-correct'));assert.equal(oldCard.attributes['aria-disabled'],'true');
assert.match(app.el('#card-verdict').innerHTML,/Bilaman/);
app.run("rate('unknown');flip();action('known');action('flip')");
assert.equal(app.run('session.index'),1);assert.equal(app.run('Object.keys(session.ratings).length'),1);assert.equal(app.run('session.flipped'),false);
app.tick(419);assert.equal(app.renderCount(),renderCount);assert.equal(app.el('#app').innerHTML,oldMarkup);
app.tick(1);assert.equal(app.renderCount(),renderCount+1);assert.equal(app.run('answerFeedback.active'),false);
assert.notEqual(app.el('#flashcard'),oldCard);assert.ok(app.el('#app').innerHTML.includes(app.run('session.words[1].en')));
app.run("rate('unknown')");assert.ok(app.el('#flashcard').classList.contains('feedback-wrong'));assert.match(app.el('#card-verdict').innerHTML,/Qayta yodlang/);app.tick(420);
assert.equal(app.run('status(session.words[1])'),'unknown');

// Every view change cancels the pending callback, even if it was already queued.
for(const operation of ["action('exit')","location.hash='#unit-2';route()","startSession('write')","resumeSession()"]){
  app=boot();app.run("startSession();rate('known')");const stale=app.feedbackCallback();
  app.run(operation);const stableMarkup=app.el('#app').innerHTML,stableRenders=app.renderCount();
  assert.equal(app.run('answerFeedback.active'),false,operation);assert.equal(app.timers.size,0,operation);
  stale();app.tick(1000);assert.equal(app.el('#app').innerHTML,stableMarkup,operation);assert.equal(app.renderCount(),stableRenders,operation);
}

// Reloading during the feedback animation resumes the next saved cursor without double grading.
const storage=new Map();app=boot({storage});app.run("startSession();rate('known')");
const answeredId=app.run('session.words[0].id');
app=boot({storage});app.run('resumeSession()');assert.equal(app.run('session.index'),1);
assert.equal(app.run('Object.keys(session.ratings).length'),1);assert.equal(app.run(`progress[${JSON.stringify(answeredId)}].attempts`),1);
assert.equal(app.run('answerFeedback.active'),false);assert.equal(app.timers.size,0);

// Last-card progress is stored before the transition; the results screen waits for that transition.
app=boot();app.run('startSession()');
const total=app.run('session.words.length');
for(let n=0;n<total-1;n++){app.run("rate('known')");app.tick(420)}
const beforeLast=app.el('#app').innerHTML;app.run("rate('known')");
assert.equal(app.run('session.index'),total);assert.equal(app.run('completedUnit(unit)'),true);
assert.equal(JSON.parse(app.storage.get('wordly-sessions-v1'))[1],undefined);
app.tick(419);assert.equal(app.el('#app').innerHTML,beforeLast);assert.doesNotMatch(app.el('#app').innerHTML,/Mashq tugadi/);
app.tick(1);assert.match(app.el('#app').innerHTML,/Mashq tugadi/);assert.equal(app.timers.size,0);

// Reduced motion advances immediately, with no invisible locked period.
app=boot({reducedMotion:true});app.run('startSession()');const beforeReduced=app.renderCount();
app.run("rate('known')");assert.equal(app.run('session.index'),1);assert.equal(app.run('answerFeedback.active'),false);
assert.equal(app.renderCount(),beforeReduced+1);assert.equal(app.timers.size,0);

// Written and voice corrections keep their settled state and expose distinct animation classes.
for(const correct of [true,false]){
  app=boot();app.run("startSession('write')");
  app.run(correct?"checkAnswer(session.words[0].uz)":"checkAnswer('incorrect answer')");
  assert.ok(app.el('#app').innerHTML.includes('write-card answer-'+(correct?'correct':'wrong')));
  assert.match(app.el('#app').innerHTML,/class="answer-icon"/);assert.equal(app.run('session.index'),0);assert.equal(app.timers.size,0);
  app=boot();app.run("startSession('voice')");app.run(`settleVoice(${correct},${!correct})`);
  assert.ok(app.el('#app').innerHTML.includes('voice-card voice-feedback answer-'+(correct?'correct':'wrong')));
  assert.match(app.el('#app').innerHTML,/class="answer-icon"/);assert.equal(app.run('session.index'),0);assert.equal(app.timers.size,0);
}
console.log('Passed: immediate grading/checkpoints, 420ms outgoing-card feedback, duplicate/flip lock, stale callback cancellation, reload continuation, last-card results, reduced-motion fallback and written/voice answer animation classes.');
