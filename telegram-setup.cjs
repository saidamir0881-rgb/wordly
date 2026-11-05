// Bot credentials are read from hidden stdin; never written to source or logs.
function readInput(){return new Promise((resolve,reject)=>{
  let data='';const input=process.stdin;
  if(input.isTTY)input.setRawMode(true);
  input.setEncoding('utf8');input.resume();
  process.stdout.write('Ready for Telegram setup JSON on stdin (input is hidden).\n');
  const cleanup=()=>{input.off('data',onData);if(input.isTTY)input.setRawMode(false);input.pause()};
  function onData(chunk){data+=chunk;if(data.includes('\u0003')){cleanup();reject(Error('Cancelled'));return}if(data.includes('\n')||data.includes('\r')){cleanup();try{resolve(JSON.parse(data.trim()))}catch{reject(Error('Invalid setup input'))}}}
  input.on('data',onData);
})}
(async()=>{
  const config=await readInput();
  const token=config.token;
  if(typeof token!=='string'||!/^\d+:[A-Za-z0-9_-]+$/.test(token))throw Error('Invalid bot credential');
  async function api(method,body={},form=false){
    let response;
    const encoded=form?new URLSearchParams(Object.entries(body).map(([k,v])=>[k,typeof v==='object'?JSON.stringify(v):String(v)])):JSON.stringify(body);
    try{response=await fetch('https://api.telegram.org/bot'+token+'/'+method,{method:'POST',headers:{'Content-Type':form?'application/x-www-form-urlencoded':'application/json'},body:encoded,signal:AbortSignal.timeout(20000)})}
    catch{throw Error('Cannot connect to Telegram')}
    const value=await response.json();
    if(!response.ok||!value.ok)throw Error('Telegram rejected '+method+' ('+(value.error_code||response.status)+')');
    return value.result;
  }
  const [me,webhook,menu]=await Promise.all([api('getMe'),api('getWebhookInfo'),api('getChatMenuButton')]);
  console.log(JSON.stringify({username:me.username,name:me.first_name,hasWebhook:!!webhook.url,menu}));
  if(config.action==='connect'){
    if(config.expectedUsername&&me.username!==config.expectedUsername)throw Error('Bot username does not match');
    const url=new URL(config.url);
    if(url.protocol!=='https:')throw Error('A public HTTPS site is required');
    if(config.webhookUrl){
      const hook=new URL(config.webhookUrl);
      if(hook.protocol!=='https:'||hook.origin!==url.origin)throw Error('Webhook must use the same HTTPS origin');
      if(webhook.url&&webhook.url!==hook.href)throw Error('Another webhook is already configured; it was left unchanged');
    }
    const matchesMenu=button=>button.type==='web_app'&&button.web_app?.url===url.href&&button.text==='WORDLY ochish';
    if(!matchesMenu(menu))await api('setChatMenuButton',{menu_button:JSON.stringify({type:'web_app',text:'WORDLY ochish',web_app:{url:url.href}})},true);
    if(config.description)await api('setMyDescription',{description:config.description});
    if(config.webhookUrl&&webhook.url!==config.webhookUrl)await api('setWebhook',{url:config.webhookUrl,allowed_updates:['message'],drop_pending_updates:false});
    let finalMenu=await api('getChatMenuButton',{},true);
    for(let attempt=0;attempt<3&&!matchesMenu(finalMenu);attempt++){
      await new Promise(resolve=>setTimeout(resolve,1000));
      finalMenu=await api('getChatMenuButton',{},true);
    }
    const menuVerified=matchesMenu(finalMenu);
    console.log(JSON.stringify({connected:menuVerified,menuVerified,bot:'https://t.me/'+me.username,menu:finalMenu}));
    const finalHook=await api('getWebhookInfo');
    console.log(JSON.stringify({webhookConfigured:!!finalHook.url,pendingUpdates:finalHook.pending_update_count,lastError:finalHook.last_error_message||null}));
    if(!menuVerified)throw Error('Telegram menu button was not saved as expected');
  }
})().catch(error=>{console.error(error.message);process.exitCode=1});
