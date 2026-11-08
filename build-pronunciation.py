"""Build Uzbek-letter reading guides from CMUdict (see cmudict-LICENSE.txt).

These are approximate reading aids, not IPA. Keep the reviewed output in
pronunciations.json so normal vocabulary builds need no external dependencies.
"""
import json
import re
from pathlib import Path

root = Path(__file__).parent
phones = dict(zip(
    'AA AE AH AO AW AY B CH D DH EH ER EY F G HH IH IY JH K L M N NG OW OY P R S SH T TH UH UW V W Y Z ZH'.split(),
    'a e a o au ay b ch d z e er ey f g h i i j k l m n ng ou oy p r s sh t s u u v u y z j'.split(),
))
lexicon = {}
for line in (root / 'cmudict.dict').read_text(encoding='utf-8').splitlines():
    word, *sounds = line.split(' #')[0].split()
    if '(' not in word:
        lexicon[word] = ''.join(phones[re.sub(r'\d', '', sound)] for sound in sounds)

data = json.loads((root / 'dist/vocabulary.js').read_text(encoding='utf-8').removeprefix('const vocabulary = ').rstrip(';\n'))
def normalise(text):
    return text.lower().replace('’', "'").replace('‘', "'")

lexicon.update({
    'answerphone': 'anserfoun', 'burgle': 'bergl', 'cashpoint': 'keshpoynt',
    'colourful': 'kalaful', 'courgette': 'kurjet', 'dialling': 'dayaling',
    'duvet': 'duvey', 'emphasise': 'emfasayz', 'enrolment': 'inroulment',
    'exempli': 'igzempli', 'flautist': 'flotist', 'flavour': 'fleyva',
    'footballer': 'futbola', 'generalisation': 'jeneralizeyshn', 'gp': 'ji pi',
    'gratia': 'greyshia', 'hairdryer': 'herdrayer', 'highlighter': 'haylayter',
    'isp': 'ay es pi', 'maths': 'mess', 'motorway': 'moutavey', 'mp': 'em pi',
    'nectarine': 'nektarin', 'noticeboard': 'noutisbord', 'nought': 'not',
    'offence': 'afens', 'organise': 'organayz', 'phrasal': 'freyzal',
    'postgraduate': 'poustgrejuat', 'preposition': 'prepozishn',
    'roundish': 'raundish', 'sharpener': 'sharpener', 'smoothie': 'smuzi',
    'spacebar': 'speysbar', 'sunblock': 'sanblok', 'tallish': 'tolish',
    'toastie': 'tousti', 'twentyish': 'tuentiish', 'uncountable': 'ankauntabl',
    'unsociable': 'ansoushabl', 'webcam': 'uebkem', 'windsurfing': 'uindserfing',
    "couldn't": 'kudnt', "doesn't": 'daznt', "isn't": 'iznt',
})
tokens = {t for u in data for w in u['words'] for t in re.findall(r"[a-z]+(?:'[a-z]+)?", normalise(w['en']))}
missing = sorted(tokens - lexicon.keys())
if missing:
    raise ValueError('Missing pronunciations: ' + ' | '.join(missing))
readings = {w['en']: re.sub(r"[a-z]+(?:'[a-z]+)?", lambda m: lexicon[m[0]], normalise(w['en'])) for u in data for w in u['words']}
(root / 'pronunciations.json').write_text(json.dumps(readings, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Built {len(readings)} reading guides.')
