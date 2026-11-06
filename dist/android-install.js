(()=>{
  const app=window.Telegram?.WebApp;
  const platform=app?.platform;
  const android=platform==='android'||platform==='android_x'||((!platform||platform==='unknown')&&/Android/i.test(navigator.userAgent));
  if(!app?.initData||!android||window.WordlyAndroid)return;
  const key='wordly-apk-offer-v1';
  const dismissed=()=>{try{return localStorage.getItem(key)==='dismissed'}catch{return false}};
  function offer(){
    if(dismissed()||document.querySelector('#android-install-offer'))return;
    const previous=document.activeElement,dialog=document.createElement('dialog');
    dialog.id='android-install-offer';
    dialog.setAttribute('aria-labelledby','apk-title');
    dialog.innerHTML='<span class="eyebrow">WORDLY · ANDROID</span><h2 id="apk-title">APK yuklab olasizmi?</h2><p>WORDLY’ni telefoningizga ilova sifatida o‘rnating.</p><p class="apk-note">Internet kerak. Ilovada yodlash natijalari alohida saqlanadi; Telegram’dagi natijalar avtomatik ko‘chmaydi.</p><a class="button primary" id="apk-download" href="/downloads/wordly.apk" download="wordly.apk">APK yuklab olish</a><button class="button secondary" id="apk-later">Hozir emas</button><small>Android 8 yoki yangiroq. Yuklab olgach, APK faylini oching va Android so‘ragan o‘rnatish ruxsatini bering.</small>';
    document.body.append(dialog);
    const close=()=>{try{localStorage.setItem(key,'dismissed')}catch{}dialog.close();dialog.remove();previous?.focus?.()};
    dialog.querySelector('#apk-later').addEventListener('click',close);
    dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
    dialog.querySelector('#apk-download').addEventListener('click',event=>{
      if(typeof app.openLink==='function'){
        event.preventDefault();
        app.openLink(new URL('/downloads/wordly.apk',location.origin).href,{try_instant_view:false});
      }
      close();
    });
    dialog.showModal();
  }
  // A visible entry remains available after dismissing the initial question.
  const button=document.createElement('button');
  button.className='apk-install-entry';button.textContent='Android APK';button.setAttribute('aria-label','Android ilovasini yuklab olish');
  button.addEventListener('click',()=>{try{localStorage.removeItem(key)}catch{}offer()});
  document.body.append(button);offer();
})();
