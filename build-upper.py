"""Compile Upper-Intermediate and fail on any missing unit, index reference or translation.

The reviewed source manifest is produced locally by import-upper.py. Translation
drafts and sense overrides are local JSON files; the website makes no translation
requests. Every original lesson/exercise is available alongside the cards.
"""
import json,re,hashlib,sys,unicodedata
from pathlib import Path
root=Path(__file__).parent
def read(name):return json.loads((root/name).read_text(encoding='utf-8'))
source=read('upper-source.json')
assert source['unitCount']==101 and [u['number'] for u in source['units']]==list(range(1,102))
assert not source['unparsed']
def canonical(text):return unicodedata.normalize('NFKC',text).lower().replace('’',"'").strip()
known={}
for file,prefix in [('vocabulary.js','const vocabulary = '),('elementary-vocabulary.js','const elementaryVocabulary = ')]:
    for u in json.loads((root/'dist'/file).read_text(encoding='utf-8').removeprefix(prefix).rstrip(';\n')):
        for w in u['words']:known.setdefault(canonical(w['en']),w)
drafts=read('upper-translations.json') if (root/'upper-translations.json').exists() else {}
overrides=read('upper-overrides.json') if (root/'upper-overrides.json').exists() else {}
if (root/'upper-manual.txt').exists():
    for line in (root/'upper-manual.txt').read_text(encoding='utf-8').splitlines():
        if not line.strip():continue
        key,uz,ru=line.rsplit('|',2)
        overrides[key]={'uz':uz,'ru':ru}
readingOverrides=read('upper-readings.json') if (root/'upper-readings.json').exists() else {}
extras={}
for line in (root/'upper-extra-terms.txt').read_text(encoding='utf-8').splitlines():
    n,terms=line.split('|',1);extras[int(n)]=terms.split(';')
units=[dict(number=u['number'],title=u['title'],group=u['group'],words=[]) for u in source['units']]
seen={n:{} for n in range(1,102)}
coverage=[]
def add(n,en,pos='',ipa='',indexId=None,extra=False):
    key=(canonical(en),pos,ipa if indexId is not None else '')
    if extra:
        existing=next((w for w in units[n-1]['words'] if canonical(w['en'])==canonical(en)),None)
        if existing:return existing
    if key in seen[n]:return seen[n][key]
    slug=re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',en).encode('ascii','ignore').decode().lower()).strip('-')
    if pos:slug+='-'+pos.replace(', ','-')
    identity=f'evup-{n:03}-{slug}'
    if any(w['id']==identity for w in units[n-1]['words']):identity+='-'+hashlib.sha1((en+'|'+pos+'|'+ipa).encode()).hexdigest()[:6]
    w={'id':identity,'en':en,'pos':pos,'sourceIpa':ipa,'sourceIndex':[]}
    units[n-1]['words'].append(w);seen[n][key]=w
    return w
for i,entry in enumerate(source['index']):
    for n in entry['units']:
        w=add(n,entry['term'],entry.get('pos',''),entry['ipa'],indexId=i)
        w['sourceIndex'].append(i)
        coverage.append({'index':i,'unit':n,'wordId':w['id']})
for n,terms in extras.items():
    for en in terms:add(n,en,extra=True)
required=sorted({w['en'] for u in units for w in u['words'] if canonical(w['en']) not in known})
(root/'upper-word-plan.json').write_text(json.dumps(units,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(root/'upper-translation-queue.json').write_text(json.dumps(required,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if '--prepare' in sys.argv:
    print(f'Prepared {len(units)} units, {sum(len(u["words"]) for u in units)} cards, {len(required)} new translations.');sys.exit()

arpabet={'AA':'a','AE':'e','AH':'a','AO':'o','AW':'au','AY':'ay','B':'b','CH':'ch','D':'d','DH':'z','EH':'e','ER':'er','EY':'ey','F':'f','G':'g','HH':'h','IH':'i','IY':'i','JH':'j','K':'k','L':'l','M':'m','N':'n','NG':'ng','OW':'ou','OY':'oy','P':'p','R':'r','S':'s','SH':'sh','T':'t','TH':'s','UH':'u','UW':'u','V':'v','W':'u','Y':'y','Z':'z','ZH':'j'}
lexicon={}
for line in (root/'cmudict.dict').read_text(encoding='utf-8').splitlines():
    token,*sounds=line.split(' #')[0].split()
    if '('not in token:lexicon[token]=''.join(arpabet[re.sub(r'\d','',s)] for s in sounds)
lexicon.update({canonical(k):v for k,v in readingOverrides.items()})
phoneticMap={'\ue022':'','\ue027':'','\ue03a':'','\ue05a':'ʒ','\ue067':'g','\ue07b':'æ','\ue0c6':'ɜ','\ue0f6':'ʌ','\uf769':'ɪ','υ':'ʊ'}
ipaMap={'eɪ':'ey','aɪ':'ay','ɔɪ':'oy','aʊ':'au','əʊ':'ou','ɪə':'ia','eə':'ea','ʊə':'ua','dʒ':'j','tʃ':'ch','ʃ':'sh','ʒ':'j','θ':'s','ð':'z','ŋ':'ng','æ':'e','ɑ':'a','ɒ':'o','ɔ':'o','ə':'a','ɜ':'e','ʌ':'a','ɪ':'i','ʊ':'u','j':'y','w':'u','ˌ':'','ˈ':'',':':''}
ipaPattern=re.compile('|'.join(re.escape(k) for k in sorted(ipaMap,key=len,reverse=True)))
missingReadings=set()
def reading(w):
    if w['en'] in readingOverrides:return readingOverrides[w['en']]
    if w['sourceIpa']:
        ipa=''.join(phoneticMap.get(c,c) for c in w['sourceIpa']).replace('/','')
        text=ipaPattern.sub(lambda m:ipaMap[m[0]],ipa).strip()
        text=re.sub(r'[^a-zA-Z0-9\s.,!?()\-]','',text)
        if re.search('[a-z]',text,re.I):return text
    match=known.get(canonical(w['en']))
    if match:return match['pronunciation']
    def replace(m):
        token=m[0]
        if token in lexicon:return lexicon[token]
        missingReadings.add(token);return '?'
    return re.sub(r"[a-z]+(?:'[a-z]+)?",replace,canonical(w['en']))

missingTranslations=[]
for u in units:
    for w in u['words']:
        w['pronunciation']=reading(w)
        sense=overrides.get(w['id']) or overrides.get(f"{u['number']}|{w['en']}|{w['pos']}") or overrides.get(f"{u['number']}|{w['en']}") or overrides.get(w['en'])
        translated=sense or drafts.get(w['en']) or known.get(canonical(w['en']))
        if not translated or not all(isinstance(translated.get(k),str) and translated[k].strip() for k in ['uz','ru']):missingTranslations.append(w['en']);continue
        assert re.search('[а-яА-ЯёЁ]',translated['ru']),(w['en'],translated)
        assert not re.search('[\u0900-\u097f\u4e00-\u9fff]',translated['uz']+translated['ru']),(w['en'],translated)
        w['uz']=translated['uz'];w['ru']=translated['ru']
        if '('in w['en'] and ')'in w['en']:
            match=re.search(r'^(.*?)\(([^)]+)\)(.*)$',w['en'])
            if match:
                before,options,after=match.groups()
                w['enAnswers']=list(dict.fromkeys(re.sub(r'\s+',' ',before+option+after).strip() for option in ['',*options.split('/')]))
        del w['sourceIpa']
if '--readings' in sys.argv:
    print('Missing readings:',sorted(missingReadings));sys.exit()
assert not missingTranslations, f'{len(set(missingTranslations))} missing translations: {sorted(set(missingTranslations))[:20]}'
assert not missingReadings, f'Missing readings: {sorted(missingReadings)}'
assert all(u['words'] for u in units)
ids={w['id'] for u in units for w in u['words']}
assert len(ids)==sum(len(u['words']) for u in units)
assert len(coverage)==sum(len(e['units']) for e in source['index'])
assert all(c['wordId'] in ids for c in coverage)
assert {c['index'] for c in coverage}==set(range(len(source['index'])))

def emit(file,variable,data):
    (root/'dist'/file).write_text('const '+variable+' = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
emit('upper-vocabulary.js','upperVocabulary',units)
emit('upper-lessons.js','upperLessons',[{k:u[k] for k in ['number','lesson','exercises','sourcePage']} for u in source['units']])
questions=[];questionCounts={}
for u in units:
    lesson=source['units'][u['number']-1]['lesson']
    lesson=re.sub(r'\s+',' ',lesson)
    sentences=re.split(r'(?<=[.!?])\s+(?=[A-Z“‘])',lesson)
    selected=set()
    for w in sorted(u['words'],key=lambda w:(len(w['en'].split())==1,len(w['en']))):
        if len(selected)>=3:break
        if len(w['en'])<3 or re.search(r'[()[\]/]',w['en']):continue
        pattern=re.compile(r'(?<![A-Za-z])'+re.escape(w['en'])+r'(?![A-Za-z])',re.I)
        for sentence in sentences:
            if not 35<=len(sentence)<=220 or len(sentence.split())<7 or 'NOT'in sentence or 'Common mistakes'in sentence:continue
            if len(pattern.findall(sentence))!=1:continue
            text=pattern.sub('___',sentence,count=1)
            if not text.endswith(('.', '?', '!')):continue
            questions.append({'wordId':w['id'],'unit':u['number'],'text':text});selected.add(w['id']);break
    questionCounts[u['number']]=len(selected)
emit('upper-cloze.js','upperClozeQuestions',questions)
print('Upper contextual exercises:',len(questions),'units without exercises:',[n for n,count in questionCounts.items() if not count])
report={'sourceName':source['sourceName'],'sourceSha256':source['sourceSha256'],'unitCount':len(units),'indexEntryCount':len(source['index']),'indexReferences':len(coverage),'coveredIndexReferences':len(coverage),'missingIndexReferences':[],'cardCount':len(ids),'units':[{'number':u['number'],'title':u['title'],'cards':len(u['words']),'indexReferences':sum(c['unit']==u['number'] for c in coverage)} for u in units],'mapping':coverage}
assert all((root/'dist/pages'/f'upper-{n:03}-{kind}.webp').is_file() for n in range(1,102) for kind in ['lesson','exercises'])
report['preservedPages']=202
(root/'dist/upper-coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Built {len(units)} units, {len(ids)} cards. All {len(source["index"])} index entries / {len(coverage)} references covered.')
