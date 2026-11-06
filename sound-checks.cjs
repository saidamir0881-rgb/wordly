const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
(async()=>{
 const storage=new Map(),tones=[];let resumes=0;
 class AudioContext{
  constructor(){this.state='suspended';this.currentTime=1;this.destination={}}
  resume(){resumes++;this.state='running';return Promise.resolve()}
  createOscillator(){const tone={frequency:{setValueAtTime:f=>tone.frequencyValue=f},connect(){},disconnect(){},start(){tone.started=true},stop(){tone.stopped=true}};tones.push(tone);return tone}
  createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
 }
 const ctx=vm.createContext({window:{AudioContext},document:{addEventListener(){},querySelector(){return null}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout,clearTimeout});
 const run=s=>vm.runInContext(s,ctx);run(readFileSync('dist/answer-feedback.js','utf8'));
 assert.equal(tones.length,0,'no autoplay');
 run('playAnswerSound(true)');await new Promise(resolve=>setImmediate(resolve));
 assert.equal(resumes,1);assert.deepEqual(tones.map(t=>t.frequencyValue),[660,880]);
 run('playAnswerSound(false)');assert.deepEqual(tones.slice(2).map(t=>t.frequencyValue),[220,165]);
 run('toggleAnswerSound();playAnswerSound(true)');assert.equal(tones.length,4);assert.equal(storage.get('wordly-sound-v1'),'off');
 run('toggleAnswerSound();answerAudio.context.state="suspended";playAnswerSound(true);stopAnswerAudio()');await new Promise(resolve=>setImmediate(resolve));assert.equal(tones.length,4,'cancel pending audio on navigation');
 run('toggleAnswerSound()');const reloaded=vm.createContext({window:{},document:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k)}});vm.runInContext(readFileSync('dist/answer-feedback.js','utf8'),reloaded);
 assert.equal(vm.runInContext('answerAudio.enabled',reloaded),false,'mute persists');
 console.log('Passed: distinct feedback tones, no autoplay, audio resume, mute persistence and stale playback cancellation.');
})().catch(e=>{console.error(e);process.exitCode=1});
