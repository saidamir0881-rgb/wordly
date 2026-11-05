// Respond through Telegram's webhook reply protocol. No bot token or outbound API call is needed here.
function publicSite(){
  const value=process.env.WORDLY_SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'https://wordly-one-nu.vercel.app');
  try{
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.hostname==='localhost'||url.hostname.endsWith('.localhost'))return null;
    return url.origin;
  }catch{return null}
}
module.exports=function telegram(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET')return res.status(200).json({ok:true,service:'WORDLY Telegram webhook',site_url:publicSite()});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({ok:false})}
  let update=req.body;
  try{if(typeof update==='string')update=JSON.parse(update)}catch{return res.status(200).json({ok:true})}
  const message=update?.message;
  if(!Number.isSafeInteger(update?.update_id)||message?.chat?.type!=='private'||!Number.isSafeInteger(message.chat.id)||message.chat.id<=0)return res.status(200).json({ok:true});
  if(typeof message.text!=='string'||!/^\/(start|help)(?:@wordly_intermedit_bot)?(?:\s|$)/i.test(message.text))return res.status(200).json({ok:true});
  const url=publicSite();
  if(!url)return res.status(503).json({ok:false,error:'Production site URL is not configured'});
  return res.status(200).json({
    method:'sendMessage',chat_id:message.chat.id,
    text:'WORDLY’ga xush kelibsiz!\n\n100 ta unitdagi inglizcha so‘zlarni o‘zbekcha tarjima bilan yodlang.\n\nBoshlash uchun quyidagi tugmani bosing.',
    reply_markup:{inline_keyboard:[[{text:'WORDLY’ni ochish',web_app:{url:url+'/#units'}}]]}
  });
};
