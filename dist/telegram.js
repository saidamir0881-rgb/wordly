(()=>{
  const app=window.Telegram?.WebApp;
  if(!app?.initData)return;
  app.ready();app.expand();
  if(app.isVersionAtLeast?.('6.1')){
    app.setHeaderColor('#0c1020');app.setBackgroundColor('#0c1020');
  }
  if(app.BackButton){
    const updateBack=()=>{if(location.hash&&location.hash!=='#units')app.BackButton.show();else app.BackButton.hide()};
    app.BackButton.onClick(()=>{if(session)action('exit');else go(null)});
    window.addEventListener('hashchange',updateBack);updateBack();
  }
})();
