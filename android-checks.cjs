const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const install=fs.readFileSync('dist/android-install.js','utf8');
function boot(platform,userAgent='Android',options={}){
  const storage=options.storage||new Map(),body=[],opened=[],events={};let focused=false;
  function node(){return{handlers:{},children:{},setAttribute(){},addEventListener(type,fn){this.handlers[type]=fn},querySelector(key){return this.children[key]||(this.children[key]=node())},showModal(){this.visible=true},close(){this.visible=false},remove(){this.removed=true}}}
  const document={activeElement:{focus(){focused=true}},createElement:node,querySelector:selector=>selector==='#android-install-offer'?body.find(n=>n.id==='android-install-offer'&&!n.removed):null,body:{append:n=>body.push(n)}};
  const app={platform,initData:options.initData===undefined?'telegram-session':options.initData,openLink:(...args)=>opened.push(args)};
  vm.runInNewContext(install,{window:{Telegram:{WebApp:app},WordlyAndroid:options.native},localizeMarkup:markup=>markup,t:text=>text,navigator:{userAgent},location:{origin:'https://wordly-one-nu.vercel.app'},document,URL,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  return{body,opened,storage,dialog:()=>document.querySelector('#android-install-offer'),focused:()=>focused};
}
for(const platform of ['ios','tdesktop','macos','web','weba','webk'])assert.equal(boot(platform).body.length,0,platform+' must not show APK');
assert.equal(boot('android','iPhone',{initData:''}).body.length,0,'outside Telegram');
assert.equal(boot('android','Android',{native:true}).body.length,0,'inside installed APK');
for(const platform of ['android','android_x','unknown',undefined])assert.equal(boot(platform).dialog().visible,true);
assert.equal(boot('unknown','iPhone').body.length,0);
let app=boot('android');
assert.match(app.dialog().innerHTML,/alohida saqlanadi/);
app.dialog().querySelector('#apk-download').handlers.click({preventDefault(){}});
assert.equal(app.opened[0][0],'https://wordly-one-nu.vercel.app/downloads/wordly.apk');
assert.equal(app.dialog(),undefined);assert.equal(app.focused(),true);
const reloaded=boot('android','Android',{storage:app.storage});assert.equal(reloaded.dialog(),undefined);
reloaded.body[0].handlers.click();assert.equal(reloaded.dialog().visible,true,'download still available after dismissal');
reloaded.dialog().handlers.cancel({preventDefault(){}});assert.equal(reloaded.dialog(),undefined);

// Native speech adapters ignore aborted/stale callbacks and expose final alternatives.
const messages=[],window={prompt:message=>messages.push(JSON.parse(message.slice(14)))};
vm.runInNewContext(fs.readFileSync('dist/android-native.js','utf8'),{window,URL,location:{href:'https://wordly-one-nu.vercel.app/#units'},navigator:{userAgent:'Android WordlyAndroid/1.0'}});
assert.equal(window.WordlyAndroid,true);
window.open('/#unit-1');assert.equal(messages.at(-1).action,'browser');assert.equal(messages.at(-1).url,'https://wordly-one-nu.vercel.app/#unit-1');
let starts=0,results=0,ended=0;
const first=new window.SpeechRecognition();first.onstart=()=>starts++;first.onresult=()=>results++;first.start();
const id=messages.at(-1).id;window.wordlyNativeEvent(id,'start');assert.equal(starts,1);
first.abort();window.wordlyNativeEvent(id,'result',['word']);assert.equal(results,0);
const second=new window.SpeechRecognition();second.start();const secondId=messages.at(-1).id;
second.onresult=event=>{results++;assert.equal(event.results[0].isFinal,true);assert.equal(event.results[0][1].transcript,'second alternative')};
second.onend=()=>ended++;
window.wordlyNativeEvent(id,'result',['stale']);assert.equal(results,0);
window.wordlyNativeEvent(secondId,'result',['word','second alternative']);window.wordlyNativeEvent(secondId,'end');assert.equal(results,1);assert.equal(ended,1);
let spoken=0;const utterance=new window.SpeechSynthesisUtterance('word');utterance.onend=()=>spoken++;
window.speechSynthesis.speak(utterance);window.wordlyNativeEvent(messages.at(-1).id,'tts-end');assert.equal(spoken,1);
window.speechSynthesis.speak(utterance);const speechId=messages.at(-1).id;window.speechSynthesis.cancel();window.wordlyNativeEvent(speechId,'tts-end');assert.equal(spoken,1);
const release=JSON.parse(fs.readFileSync('dist/downloads/release.json','utf8'));
const apk=fs.readFileSync('dist/downloads/wordly.apk');assert.equal(apk.length,release.bytes);assert.equal(crypto.createHash('sha256').update(apk).digest('hex'),release.sha256);
assert.equal(apk.readUInt32LE(),0x04034b50,'real APK zip');
const index=fs.readFileSync('dist/index.html','utf8');assert.ok(index.indexOf('android-native.js')<index.indexOf('voice.js'));assert.ok(index.indexOf('android-install.js')>index.indexOf('memory.js'));assert.match(index,/<script src="android-install.js" defer>/,'wait for deferred Telegram SDK');
assert.equal(JSON.parse(fs.readFileSync('vercel.json','utf8')).headers[0].headers.find(h=>h.key==='Content-Type').value,'application/vnd.android.package-archive');
console.log('Passed: Android-only Telegram offer, iPhone/desktop/native exclusions, dismissal/reopen/download, native speech cancellation, APK digest and release integration.');
