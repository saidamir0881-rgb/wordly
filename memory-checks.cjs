const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const elements=new Map(),listeners={};const element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',attributes:{},setAttribute(k,v){this.attributes[k]=v},classList:{add(){},remove(){},toggle(k,v){this[k]=v}},focus(){}});return elements.get(s)};
const saved=new Map();const c=vm.createContext({console,Date,Math,JSON,Map,Set,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},location:{hash:'#book-intermediate'},window:{matchMedia:()=>({matches:true}),addEventListener:(k,v)=>listeners[k]=v,scrollTo(){}},document:{querySelector:element,documentElement:{},activeElement:{tagName:'BODY'},addEventListener:(k,v)=>listeners[k]=v}});
const run=s=>vm.runInContext(s,c);
run(fs.readFileSync('dist/vocabulary.js','utf8'));run(fs.readFileSync('dist/elementary-vocabulary.js','utf8'));run(fs.readFileSync('dist/library.js','utf8'));run(fs.readFileSync('dist/i18n.js','utf8'));run(fs.readFileSync('dist/cloze-data.js','utf8'));run(fs.readFileSync('dist/elementary-cloze.js','utf8'));run(fs.readFileSync('dist/cloze.js','utf8'));run(fs.readFileSync('dist/persistence.js','utf8'));run(fs.readFileSync('dist/voice.js','utf8'));run(fs.readFileSync('dist/answer-feedback.js','utf8'));run(fs.readFileSync('dist/memory.js','utf8'));
assert.equal(run('vocabulary.length'),100);assert.ok(run('allWords.length')>2700);
assert.equal(run('new Set(allWords.map(w=>w.id)).size'),run('allWords.length'),'Stable IDs are unique');
assert.equal(run('vocabulary.every(u=>u.words.length&&u.words.every(w=>w.en.trim()&&w.uz.trim()))'),true);
assert.equal(run('allWords.every(w=>typeof w.pronunciation==="string"&&w.pronunciation.trim().length>0)'),true,'Every card has a reading guide');
assert.equal(run('allWords.find(w=>w.en==="weekly").pronunciation'),'uikli');
assert.doesNotMatch(element('#app').innerHTML,/Leaderboard|Weekly XP|Dashboard|<iframe/);
assert.match(element('#app').innerHTML,/#unit-100/);
run("query='widow';render()");assert.match(element('#app').innerHTML,/#unit-13/);assert.doesNotMatch(element('#app').innerHTML,/#unit-100/);
run("query='beva';render()");assert.match(element('#app').innerHTML,/#unit-13/);
run("query='';topic='Tourism';render()");assert.match(element('#app').innerHTML,/#unit-46/);assert.doesNotMatch(element('#app').innerHTML,/#unit-100/);
run("topic='';location.hash='#unit-13';route()");assert.match(element('#app').innerHTML,/widow/);
run('startSession()');assert.equal(run('session.flipped'),false);assert.match(element('#app').innerHTML,/id="card-back"[^>]+aria-hidden="true"/);
const beforeFlip=element('#app').innerHTML;
const front=beforeFlip.split('id="card-front"')[1].split('id="card-back"')[0];
assert.ok(front.includes(run('session.words[0].pronunciation')),'English face shows its reading guide');
assert.ok(!front.includes(run('session.words[0].uz')),'Reading guide keeps the translation hidden until flipping');
run('flip()');assert.equal(element('#app').innerHTML,beforeFlip,'Flip preserves DOM for the CSS transition');assert.equal(element('#flashcard').classList.flipped,true);assert.equal(element('#card-front').attributes['aria-hidden'],'true');assert.equal(element('#card-back').attributes['aria-hidden'],'false');assert.match(element('#flashcard').attributes['aria-label'],/beva ayol/);
run('flip()');assert.equal(element('#flashcard').classList.flipped,false);assert.equal(element('#card-back').attributes['aria-hidden'],'true');run('flip()');
run("rate('unknown')");assert.equal(run('session.index'),1);assert.equal(run('status(unit.words[0])'),'unknown');
assert.equal(run('session.flipped'),false);assert.match(element('#app').innerHTML,/id="card-back"[^>]+aria-hidden="true"/);
run("rate('known')");assert.equal(run('session.index'),2);assert.equal(run('status(unit.words[1])'),'known');
assert.ok(saved.get('wordly-memory-v1'));
run("session=null;listFilter='unknown';render();startSession()");assert.equal(run('session.words.length'),1);
run("rate('unknown')");assert.match(element('#app').innerHTML,/Mashq tugadi/);run("action('retry')");assert.equal(run('session.words.length'),1);assert.equal(run('session.index'),0);
run("rate('known');action('exit');listFilter='all';startSession('write')");
run("checkAnswer('not the answer')");assert.equal(run('session.correct'),false);assert.match(element('#app').innerHTML,/To‘g‘ri javob/);assert.equal(run('status(unit.words[0])'),'unknown');
const attempts=run('progress[unit.words[0].id].attempts');run("checkAnswer('beva ayol')");assert.equal(run('progress[unit.words[0].id].attempts'),attempts,'No double submissions');
run("advance();session.direction='en';checkAnswer(session.words[session.index].en.toUpperCase())");assert.equal(run('session.correct'),true);
assert.equal(run("normalise(' O‘ZBEKCHA ')==normalise(\"o'zbekcha\")"),true);
run("session=null;listFilter='all';location.hash='#unit/EVU-01';route()");assert.equal(run('unit.number'),1);
for(let n=1;n<=100;n++){run(`location.hash='#unit-${n}';route()`);assert.match(element('#app').innerHTML,/Boshlash/);run('startSession()');assert.ok(run('session.words.length')>0);}
run("session=null;location.hash='#unit-999';route()");assert.equal(run('unit'),null);
for(const [known,total,tier] of [[10,10,'excellent'],[9,10,'excellent'],[8,10,'satisfactory'],[7,10,'satisfactory'],[6,10,'needs-practice'],[0,10,'needs-practice'],[899,1000,'satisfactory'],[699,1000,'needs-practice'],[0,0,'empty']]){
  assert.equal(run(`resultFor(${known},${total}).tier`),tier,`${known}/${total} threshold`);
}
run("location.hash='#unit-13';route();startSession()");
for(const [known,total,tier,title] of [[9,10,'excellent','Barakalla!'],[7,10,'satisfactory','Yaxshi, qoniqarli'],[6,10,'needs-practice','Yomon'],[899,1000,'satisfactory','Yaxshi, qoniqarli']]){
  run(`session.words=Array(${total}).fill(unit.words[0])`);
  const output=run(`finishView({known:${known},unknown:${total-known}})`);
  assert.ok(output.includes(`result-${tier}`));assert.ok(output.includes(title));
  assert.equal(output.includes('result-confetti'),tier==='excellent');
  if(tier==='needs-practice')assert.match(output,/Yodlash kerak, bo‘lmasa darsda tik turasan!/);
  if(known===899)assert.match(output,/89[.,]9/);
  assert.match(output,/data-action="retry"/);
}
console.log('Passed: result boundaries at 90% and 70%, red warning, excellent-only celebration, current-attempt feedback and percentages without rounding into the next tier.');
console.log('Passed: 100 units, 2,700+ translated cards, unique IDs, EN/UZ search, filters, hidden translations, flip, both ratings, saved results, retry unknowns, typed recall, reverse recall, duplicate-submit protection and all unit routes.');
