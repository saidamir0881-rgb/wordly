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
