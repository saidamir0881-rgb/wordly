const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function boot(storage=new Map(),hash='#unit-1'){
  const elements=new Map(),listeners={};
  const el=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',attributes:{},setAttribute(k,v){this.attributes[k]=v},classList:{add(){},remove(){},toggle(){}},focus(){this.focused=true}});return elements.get(s)};
  const context=vm.createContext({console,Date,Math,JSON,Map,Set,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},location:{hash},window:{matchMedia:()=>({matches:true}),addEventListener:(k,v)=>listeners[k]=v,scrollTo(){}},document:{querySelector:el,documentElement:{},activeElement:{tagName:'BODY'},addEventListener:(k,v)=>listeners[k]=v}});
  const run=s=>vm.runInContext(s,context);
  for(const file of ['vocabulary.js','elementary-vocabulary.js','library.js','i18n.js','cloze-data.js','elementary-cloze.js','cloze.js','persistence.js','voice.js','answer-feedback.js','memory.js'])run(fs.readFileSync('dist/'+file,'utf8'));
  return{run,el,storage,listeners};
}
let app=boot();
assert.equal(app.run('clozeQuestions.length'),500);
assert.equal(app.run('new Set(clozeQuestions.map(q=>q.wordId)).size'),500);
assert.equal(app.run('vocabulary.every(u=>clozeAvailable(u.words).length===5)'),true);
assert.equal(app.run("clozeQuestions.every(q=>byId.has(q.wordId)&&vocabulary[q.unit-1].words.some(w=>w.id===q.wordId)&&q.text.split('___').length===2)"),true);
assert.match(app.el('#app').innerHTML,/data-action="cloze"/);
app.run("action('cloze')");assert.equal(app.run('session.mode'),'cloze');assert.equal(app.run('session.direction'),'en');assert.equal(app.run('session.words.length'),5);
assert.match(app.el('#app').innerHTML,/GAPNI TO‘LDIRING/);
const sentence=app.el('#app').innerHTML.match(/<p class="cloze-sentence"[^>]*>(.*?)<\/p>/s)[1];
assert.match(sentence,/______/);assert.doesNotMatch(sentence,/routine/i);
app.el('#answer').value='rou';app.el('#answer').oninput();
app=boot(app.storage);app.run('resumeSession()');assert.equal(app.run('session.mode'),'cloze');assert.equal(app.run('session.answer'),'rou');assert.equal(app.run('session.index'),0);
app.run("checkAnswer(' ')");assert.equal(app.run('Object.keys(progress).length'),0);
app.run("checkAnswer('  ROUTINE  ')");assert.equal(app.run('session.correct'),true);assert.match(app.el('#app').innerHTML,/answer-correct/);assert.match(app.el('#app').innerHTML,/cloze-gap filled/);
const id=app.run('session.words[0].id'),attempts=app.run('progress[session.words[0].id].attempts');
app=boot(app.storage);app.run('resumeSession()');assert.equal(app.run('session.checked'),true);
app.run("checkAnswer('wrong')");assert.equal(app.run(`progress[${JSON.stringify(id)}].attempts`),attempts);
app.run("action('next');checkAnswer('wrong')");assert.equal(app.run('session.correct'),false);assert.match(app.el('#app').innerHTML,/answer-wrong/);assert.match(app.el('#app').innerHTML,/weekly/);
app.run("action('next');while(session.index<session.words.length){checkAnswer(session.words[session.index].en);advance()}");
assert.match(app.el('#app').innerHTML,/Mashq tugadi/);assert.match(app.el('#app').innerHTML,/Yaxshi, qoniqarli/);assert.equal(app.run('completedUnit(unit)'),false,'Five sentence questions do not falsely complete the full vocabulary unit');
assert.equal(JSON.parse(app.storage.get('wordly-sessions-v1'))[1],undefined);
app.run("action('retry')");assert.equal(app.run('session.mode'),'cloze');assert.equal(app.run('session.words.length'),1);assert.equal(app.run('session.words[0].en'),'weekly');
app.run("checkAnswer('weekly');advance()");assert.match(app.el('#app').innerHTML,/Barakalla!/);
app.run("action('exit');listFilter='unknown';startCloze()");assert.equal(app.run('session'),null);assert.match(app.el('#toast').textContent,/tayyor gap yo‘q/);
app.run("listFilter='all';startCloze()");
const invalid=JSON.parse(JSON.stringify(app.run('savedSessions[1]')));invalid.wordIds=[app.run('unit.words.find(w=>!clozeFor(w)).id')];invalid.index=0;invalid.ratings={};
app.storage.set('wordly-sessions-v1',JSON.stringify({1:invalid}));app=boot(app.storage);assert.equal(app.run('checkpointFor(unit)'),null);
for(let n=1;n<=100;n++){
  app.run(`location.hash='#unit-${n}';route();startCloze()`);
  assert.equal(app.run('session.words.length'),5);
  assert.equal(app.run("session.words.every(w=>clozeView(w).includes('cloze-sentence'))"),true);
}
console.log('Passed: 500 linked gap exercises, all 100 units, hidden answers, English-only checking, correction/animations, draft and checked-answer restoration, no duplicate grading, five-question scores, retry/filter behaviour and invalid checkpoint rejection.');
