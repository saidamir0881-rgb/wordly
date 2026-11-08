"""Build a local, reviewed English–Uzbek word bank. No external translation service."""
import json,re
from pathlib import Path
root=Path(__file__).parent
pronunciations=json.loads((root/'pronunciations.json').read_text(encoding='utf-8'))
book=json.loads((root/'dist/book.js').read_text(encoding='utf-8').removeprefix('const textbook = ').rstrip(';\n'))
entries={n:[] for n in range(1,101)}
for name in ['vocabulary-1.txt','vocabulary-2.txt','vocabulary-extra.txt']:
    for line in (root/name).read_text(encoding='utf-8').splitlines():
        if not line.strip():continue
        n,content=line.split('|',1)
        n=int(n)
        for pair in content.split(';'):
            en,uz=pair.split('=',1)
            en=en.strip().replace('r ub out','rub out')
            if en=='fortunately':uz='yaxshiyamki'
            assert en and uz and '<' not in en and '<' not in uz
            if any(w['en'].lower()==en.lower() for w in entries[int(n)]):continue
            key=re.sub(r'[^a-z0-9]+','-',en.lower()).strip('-')
            if any(w['id']==f'evu-{n:03}-{key}' for w in entries[n]):
                key+='-noun' if '-' in en else '-phrase'
            entries[int(n)].append(dict(id=f'evu-{n:03}-{key}',en=en,uz=uz.strip(),pronunciation=pronunciations[en]))
data=[dict(number=u['number'],title=u['title'],group=u['group'],words=entries[u['number']]) for u in book]
assert all(u['words'] for u in data) and len(data)==100
(root/'dist/vocabulary.js').write_text('const vocabulary = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print(f"Built {len(data)} units and {sum(len(u['words']) for u in data)} flashcards.")
