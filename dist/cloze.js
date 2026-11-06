const clozeByWord=new Map(clozeQuestions.map(q=>[q.wordId,q]));
const clozeFor=w=>clozeByWord.get(w.id);
const clozeAvailable=words=>words.filter(w=>clozeFor(w));
function startCloze(){
  const words=clozeAvailable(unit.words.filter(w=>listFilter==='all'||status(w)===listFilter));
  if(!words.length)return notify('Bu bo‘limda tayyor gap yo‘q. «Hammasi»ni tanlang.');
  startSession('cloze',words.map(w=>w.id));
}
function clozeView(w){
  const s=session,q=clozeFor(w);
  if(!q)return '<section class="write-card"><p>Bu so‘z uchun gap topilmadi.</p><button class="button secondary" data-action="exit">Unitga qaytish</button></section>';
  const [before,after]=q.text.split('___');
  return `<section class="write-card cloze-card ${s.checked?'answer-'+(s.correct?'correct':'wrong'):''}"><span class="eyebrow">GAPNI TO‘LDIRING</span><p class="cloze-instruction">Bo‘sh joyga unitdagi inglizcha so‘z yoki iborani yozing.</p><p class="cloze-sentence" lang="en">${html(before)}<span class="cloze-gap ${s.checked?'filled':''}" ${!s.checked?'aria-label="Bo‘sh joy"':''}>${s.checked?html(w.en):'______'}</span>${html(after)}</p><div class="cloze-hint"><span>O‘ZBEKCHA MA’NOSI</span><strong lang="uz">${html(w.uz)}</strong></div><form id="answer-form"><label class="sr-only" for="answer">Tushirib qoldirilgan inglizcha so‘z yoki ibora</label><input id="answer" placeholder="Inglizcha javobni yozing…" value="${html(s.answer)}" autocomplete="off" autocapitalize="off" spellcheck="false" ${s.checked?'disabled':''}>${!s.checked?'<button class="button primary" type="submit">Tekshirish</button>':''}</form>${s.checked?`<div class="answer-feedback ${s.correct?'known':'unknown'}" role="status">${answerIcon(s.correct)}<strong>${s.correct?'To‘g‘ri!':'To‘g‘ri javob:'}</strong><span lang="en">${html(w.en)}</span>${!s.correct?`<small>Siz yozdingiz: ${html(s.answer)}</small>`:''}</div><button class="button secondary" data-sound="${w.id}">${svg('audio')} Talaffuzini tinglash</button><button class="button primary" data-action="next">Davom etish ${svg('arrow')}</button>`:''}</section>`;
}
