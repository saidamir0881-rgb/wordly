// The APK supplies native speech services through origin-checked JS prompts.
(()=>{
  if(!/WordlyAndroid\/1\.0/.test(navigator.userAgent))return;
  window.WordlyAndroid=true;
  const send=data=>window.prompt('wordly-native:'+JSON.stringify(data),'');
  window.open=url=>{send({action:'browser',url:new URL(url,location.href).href});return null};
  let sequence=0,recognition=null,utterance=null;
  class NativeRecognition{
    start(){this.id=++sequence;recognition=this;send({action:'listen',id:this.id})}
    abort(){if(recognition===this){recognition=null;send({action:'abort',id:this.id})}}
    stop(){this.abort()}
  }
  window.SpeechRecognition=NativeRecognition;
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;this.lang='en-GB';this.rate=1}};
  const synthesis={
    getVoices:()=>window.WordlyNativeVoices||[],
    cancel(){utterance=null;send({action:'tts-stop'})},
    speak(value){utterance=value;value.id=++sequence;send({action:'speak',id:value.id,text:String(value.text).slice(0,2000),lang:value.lang||'en-GB',rate:value.rate||1})}
  };
  Object.defineProperty(window,'speechSynthesis',{value:synthesis,configurable:true});
  window.wordlyNativeEvent=(id,type,data)=>{
    if(type==='tts-end'||type==='tts-error'){
      if(utterance?.id!==id)return;
      const value=utterance;utterance=null;
      if(type==='tts-end')value.onend?.();else value.onerror?.({error:'synthesis-unavailable'});
      return;
    }
    const rec=recognition;if(!rec||rec.id!==id)return;
    if(type==='start')rec.onstart?.();
    if(type==='result'){
      const result=(data||[]).map(transcript=>({transcript,confidence:1}));result.isFinal=true;
      rec.onresult?.({resultIndex:0,results:[result]});
    }
    if(type==='error')rec.onerror?.({error:data});
    if(type==='end'&&recognition===rec){recognition=null;rec.onend?.()}
  };
})();
