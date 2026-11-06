"""Compile original contextual gap exercises linked to stable vocabulary IDs."""
import json
from pathlib import Path
root=Path(__file__).parent
units=json.loads((root/'dist/vocabulary.js').read_text(encoding='utf-8').removeprefix('const vocabulary = ').rstrip(';\n'))
questions=[]
for name in ['cloze-1.txt','cloze-2.txt']:
    for line in (root/name).read_text(encoding='utf-8').splitlines():
        number,entries=line.split('|',1)
        unit=units[int(number)-1]
        for entry in entries.split(';'):
            target,text=entry.split('=',1)
            matches=[w for w in unit['words'] if w['en'].casefold()==target.casefold()]
            if len(matches)!=1:raise ValueError(f"Unit {number}: unknown vocabulary {target!r}")
            assert text.count('___')==1,(number,text)
            text=text.strip()
            if not text.rstrip("'\"").endswith(('.', '?', '!')):text+='.'
            questions.append(dict(wordId=matches[0]['id'],unit=int(number),text=text))
assert len(questions)==500
assert len({q['wordId'] for q in questions})==500
assert all(sum(q['unit']==n for q in questions)==5 for n in range(1,101))
(root/'dist/cloze-data.js').write_text('const clozeQuestions = '+json.dumps(questions,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('Built 500 contextual gap exercises across 100 units.')
