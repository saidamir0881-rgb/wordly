const answerFeedback={active:false,timer:null,generation:0};
function cancelAnswerFeedback(){
  answerFeedback.generation++;
  clearTimeout(answerFeedback.timer);
  answerFeedback.timer=null;answerFeedback.active=false;
}
function showAnswerFeedback(rating){
  cancelAnswerFeedback();
  const correct=rating==='known',message=correct?'Bilaman':'Qayta yodlang';
  const status=$('#answer-status');if(status)status.textContent=message;
  const card=$('#flashcard');
  if(!card||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){render();return}
  const current=session,index=session.index,generation=answerFeedback.generation;
  answerFeedback.active=true;
  card.classList.add(correct?'feedback-correct':'feedback-wrong');
  card.setAttribute('aria-disabled','true');
  const verdict=$('#card-verdict');
  if(verdict){verdict.innerHTML=svg(correct?'check':'close')+'<span>'+message+'</span>';verdict.setAttribute('aria-hidden','false')}
  answerFeedback.timer=setTimeout(()=>{
    if(answerFeedback.generation!==generation||session!==current||session.index!==index)return;
    answerFeedback.active=false;answerFeedback.timer=null;render();focusAnswer();
  },420);
}
function answerIcon(correct){return `<span class="answer-icon" aria-hidden="true">${svg(correct?'check':'close')}</span>`}

// Short local tones: no downloads and no audio before a user interaction.
const answerAudio={context:null,enabled:true,generation:0,nodes:[]};
try{answerAudio.enabled=localStorage.getItem('wordly-sound-v1')!=='off'}catch{}
function unlockAnswerAudio(){
  if(!answerAudio.enabled)return;
  try{
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    const ctx=answerAudio.context||(answerAudio.context=new Audio());
    if(ctx.state==='suspended')return ctx.resume().catch(()=>{});
  }catch{}
}
function stopAnswerAudio(){
  answerAudio.generation++;
  for(const node of answerAudio.nodes){try{node.stop()}catch{}}
  answerAudio.nodes=[];
}
function playAnswerSound(correct){
  stopAnswerAudio();
  if(!answerAudio.enabled)return;
  const generation=answerAudio.generation;
  const ready=unlockAnswerAudio();
  const play=()=>{
    const ctx=answerAudio.context;
    if(!answerAudio.enabled||generation!==answerAudio.generation||!ctx||ctx.state!=='running')return;
    try{
      const frequencies=correct?[660,880]:[220,165];
      frequencies.forEach((frequency,i)=>{
        const tone=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+i*.11;
        tone.type='sine';tone.frequency.setValueAtTime(frequency,start);
        gain.gain.setValueAtTime(0,start);
        gain.gain.linearRampToValueAtTime(correct?.07:.05,start+.015);
        gain.gain.exponentialRampToValueAtTime(.001,start+.15);
        tone.connect(gain);gain.connect(ctx.destination);
        tone.onended=()=>{tone.disconnect();gain.disconnect();answerAudio.nodes=answerAudio.nodes.filter(n=>n!==tone)};
        answerAudio.nodes.push(tone);tone.start(start);tone.stop(start+.16);
      });
    }catch{stopAnswerAudio()}
  };
  if(ready?.then)ready.then(play).catch(()=>{});else play();
}
function answerSoundButton(){return `<button class="icon-button answer-sound" data-action="sound-toggle" aria-pressed="${answerAudio.enabled}" aria-label="Javob ovozi: ${answerAudio.enabled?'yoqilgan':'o?chirilgan'}" title="Javob ovozini ${answerAudio.enabled?'o?chirish':'yoqish'}">${svg('audio')}<span>${answerAudio.enabled?'On':'Off'}</span></button>`}
function toggleAnswerSound(){
  answerAudio.enabled=!answerAudio.enabled;stopAnswerAudio();
  try{localStorage.setItem('wordly-sound-v1',answerAudio.enabled?'on':'off')}catch{}
  if(answerAudio.enabled)unlockAnswerAudio();
  const button=document.querySelector('[data-action="sound-toggle"]');
  if(button){const holder=document.createElement('div');holder.innerHTML=answerSoundButton();button.replaceWith(holder.firstElementChild)}
}
document.addEventListener('pointerdown',unlockAnswerAudio,{capture:true,passive:true});
document.addEventListener('keydown',unlockAnswerAudio,{capture:true});
