const assert=require('node:assert/strict');
const handler=require('./api/telegram');
const original=process.env.WORDLY_SITE_URL;
process.env.WORDLY_SITE_URL='https://wordly-one-nu.vercel.app';
function call(method,body){const res={headers:{},status(n){this.code=n;return this},setHeader(k,v){this.headers[k]=v},json(v){this.body=v;return this}};handler({method,body},res);return res}
const start={update_id:1,message:{chat:{id:123,type:'private'},text:'/start'}};
let r=call('POST',start);assert.equal(r.code,200);assert.equal(r.body.method,'sendMessage');assert.equal(r.body.chat_id,123);assert.equal(r.body.reply_markup.inline_keyboard[0][0].web_app.url,'https://wordly-one-nu.vercel.app/#units');
assert.equal(r.headers['Cache-Control'],'no-store');
for(const text of ['/help','/start ref123','/start@wordly_intermedit_bot']){r=call('POST',{...start,message:{...start.message,text}});assert.equal(r.body.method,'sendMessage')}
for(const text of ['/starter','/start@another_bot','hello']){r=call('POST',{...start,message:{...start.message,text}});assert.equal(r.body.method,undefined)}
assert.equal(call('POST',{...start,message:{...start.message,chat:{id:-123,type:'group'}}}).body.method,undefined);
assert.equal(call('POST','broken JSON').code,200);assert.equal(call('POST',null).code,200);
assert.equal(call('DELETE',null).code,405);assert.equal(call('GET').body.site_url,'https://wordly-one-nu.vercel.app');
process.env.WORDLY_SITE_URL='http://localhost:3000';assert.equal(call('POST',start).code,503);
process.env.WORDLY_SITE_URL='https://user:secret@example.com';assert.equal(call('POST',start).code,503);
delete process.env.WORDLY_SITE_URL;const prod=process.env.VERCEL_PROJECT_PRODUCTION_URL;process.env.VERCEL_PROJECT_PRODUCTION_URL='wordly-one-nu.vercel.app';assert.equal(call('POST',start).body.method,'sendMessage');
if(original===undefined)delete process.env.WORDLY_SITE_URL;else process.env.WORDLY_SITE_URL=original;
if(prod===undefined)delete process.env.VERCEL_PROJECT_PRODUCTION_URL;else process.env.VERCEL_PROJECT_PRODUCTION_URL=prod;
console.log('Passed: Telegram /start and /help responses, Mini App URL, unsupported/group updates, invalid JSON, production URL and credential-free webhook.');
