"""Build all 60 units from reviewed terms extracted from the user's Elementary PDF.

No network: translations are local, with context overrides; pronunciation is an
approximate Uzbek-letter guide derived from CMUdict and reviewed spellings.
"""
import json
import re
from pathlib import Path

root=Path(__file__).parent
existing=json.loads((root/'dist/vocabulary.js').read_text(encoding='utf-8').removeprefix('const vocabulary = ').rstrip(';\n'))
lookup={}
for u in existing:
    for w in u['words']:
        lookup.setdefault(w['en'].lower(),w)
for line in (root/'elementary-glossary.txt').read_text(encoding='utf-8').splitlines():
    en,uz,ru=line.split('|')
    lookup[en.lower()]={'uz':uz,'ru':ru}
overrides={}
for line in (root/'elementary-overrides.txt').read_text(encoding='utf-8').splitlines():
    n,en,uz,ru=line.split('|')
    overrides[int(n),en.lower()]={'uz':uz,'ru':ru}

# Keep the same phoneme mapping as build-pronunciation.py.
phonemes={'AA':'a','AE':'e','AH':'a','AO':'o','AW':'au','AY':'ay','B':'b','CH':'ch','D':'d','DH':'z','EH':'e','ER':'er','EY':'ey','F':'f','G':'g','HH':'h','IH':'i','IY':'i','JH':'j','K':'k','L':'l','M':'m','N':'n','NG':'ng','OW':'ou','OY':'oy','P':'p','R':'r','S':'s','SH':'sh','T':'t','TH':'s','UH':'u','UW':'u','V':'v','W':'u','Y':'y','Z':'z','ZH':'j'}
lexicon={}
for line in (root/'cmudict.dict').read_text(encoding='utf-8').splitlines():
    token,*sounds=line.split(' #')[0].split()
    if '(' not in token:lexicon[token]=''.join(phonemes[re.sub(r'\d','',s)] for s in sounds)
lexicon.update({'ict':'ay si ti','sim':'sim','hogmanay':'hogmaney','voicemail':'voys meyl','selfie':'selfi','selfies':'selfiz','app':'ep','hi':'hay','fi':'fay','kayaking':'kayeking','snowboarding':'snoubording','thundery':'sandari','pre':'pri','hifi':'hay fay','non':'non','tikka':'tika','masala':'masala','yorkshire':'yorksha','preheat':'prihit','apps':'eps'})
lexicon.update({'aeroplane':'eropleyn','hairbrush':'herbrash','litre':'liter','newsagent':'nyuzeyjent','pyjamas':'pajamaz','toothache':'suseyk','whiteboard':'uaytbord','worktop':'uerktop'})
readings=json.loads((root/'pronunciations.json').read_text(encoding='utf-8'))
missing=set()
def reading(en):
    if en in readings:return readings[en]
    text=en.lower().replace('’',"'").replace('é','e')
    def replace(m):
        token=m[0]
        if token not in lexicon:missing.add(token)
        return lexicon.get(token,'?')
    return re.sub(r"[a-z]+(?:'[a-z]+)?",replace,text)

titles=['The family','Birth, marriage and death','Parts of the body','Clothes','Describing people','Health and illness','Feelings','Conversations 1: Greetings and wishes','Conversations 2: Useful words and expressions','Food and drink','In the kitchen','In the bedroom and bathroom','In the living room','Jobs','At school and university','Communications','Your phone','Holidays','Shops and shopping','Online shopping','In a hotel','Eating out','Sports','Cinema','Free time at home','Music and musical instruments','Countries and nationalities','Weather','In the town','In the countryside','Animals','Travelling','UK culture','Crime','The media','Problems at home and work','Global problems','Have / had / had','Go / went / gone','Do / did / done','Make / made / made','Come / came / come','Take / took / taken','Bring / brought / brought','Get / got / got','Phrasal verbs','Everyday things','Talking','Moving','Conjunctions and connecting words','Days, months, seasons','Time words','Places','Manner','Common uncountable nouns','Common adjectives: Good and bad things','Words and prepositions','Prefixes','Suffixes','Words you may confuse']
groups=[(1,'People'),(10,'At home'),(14,'School and workplace'),(18,'Leisure'),(27,'The world'),(34,'Social issues'),(38,'Everyday verbs'),(50,'Words and grammar')]
units=[]
for line in (root/'elementary-terms.txt').read_text(encoding='utf-8').splitlines():
    number,terms=line.split('|',1);n=int(number);words=[]
    for en in terms.split(';'):
        translated=overrides.get((n,en.lower()),lookup.get(en.lower()))
        assert translated and translated['uz'] and re.search('[а-яА-ЯёЁ]',translated['ru']), (n,en)
        key=re.sub('[^a-z0-9]+','-',en.lower()).strip('-')
        words.append({'id':f'eve-{n:03}-{key}','en':en,'uz':translated['uz'],'ru':translated['ru'],'pronunciation':reading(en)})
    units.append({'number':n,'title':titles[n-1],'group':next(g for start,g in reversed(groups) if n>=start),'words':words})
assert not missing, sorted(missing)
assert len(units)==60 and all(u['words'] for u in units)
assert len({w['id'] for u in units for w in u['words']})==sum(len(u['words']) for u in units)
(root/'dist/elementary-vocabulary.js').write_text('const elementaryVocabulary = '+json.dumps(units,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print(f'Built {len(units)} Elementary units and {sum(len(u["words"]) for u in units)} translated cards.')
questions=[]
for line in (root/'elementary-cloze.txt').read_text(encoding='utf-8').splitlines():
    number,entries=line.split('|',1)
    unit=units[int(number)-1]
    for entry in entries.split(';'):
        en,text=entry.split('=',1)
        matches=[w for w in unit['words'] if w['en']==en]
        assert len(matches)==1 and text.count('___')==1,(number,en)
        questions.append({'wordId':matches[0]['id'],'unit':int(number),'text':text})
assert len(questions)==180 and len({q['wordId'] for q in questions})==180
(root/'dist/elementary-cloze.js').write_text('const elementaryClozeQuestions = '+json.dumps(questions,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('Built 180 original Elementary gap exercises.')
