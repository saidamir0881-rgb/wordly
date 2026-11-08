"""Extract the supplied Upper-Intermediate PDF locally; audit every index entry.

Usage: python import-upper.py <path-to-pdf>
Requires PyMuPDF. Full lesson text and index provenance are retained for coverage.
"""
import sys,json,re,hashlib,unicodedata,collections
from pathlib import Path
root=Path(__file__).parent
sys.path.insert(0,str(root.parent/'.tools/pdf-reader'))
import pymupdf
source=Path(sys.argv[1])
pdf=pymupdf.open(source)
def clean(text):
    return unicodedata.normalize('NFKC',text).replace('\ue01d','ft').replace('\ue01e','ff').replace('\uf0a1','').replace('\u00ad','')
groups=[(1,'Effective vocabulary learning'),(5,'Topics'),(42,'Feelings and actions'),(51,'Basic concepts'),(61,'Connecting and linking words'),(70,'Word formation'),(80,'Words and pronunciation'),(83,'Counting people and things'),(89,'Phrasal verbs and verb-based expressions'),(95,'Varieties and styles')]
units=[]
for n in range(1,102):
    page=pdf[n*2+6]
    spans=[s for b in page.get_text('dict')['blocks'] if 'lines'in b for l in b['lines'] for s in l['spans']]
    title=' '.join(s['text'].strip() for s in spans if 28<s['size']<35).strip()
    assert title,(n,page.number)
    units.append({'number':n,'title':clean(title),'group':next(g for start,g in reversed(groups) if n>=start),'sourcePage':page.number+1,'lesson':clean(page.get_text()),'exercises':clean(pdf[n*2+7].get_text()),'bold':[clean(s['text']).strip() for s in spans if 'Bold'in s['font'] and 12.5<s['size']<16 and s['text'].strip()]})

entries=[];unparsed=[];lineCount=0
def parse(raw,page):
    raw=clean(re.sub(r'\s+',' ',raw)).strip()
    match=re.search(r'(\d+(?:\s*,\s*\d+)*)\s*$',raw)
    if not match:
        unparsed.append({'page':page,'raw':raw});return
    numbers=[int(n) for n in re.findall(r'\d+',match[1])]
    if not all(1<=n<=101 for n in numbers):unparsed.append({'page':page,'raw':raw});return
    content=raw[:match.start()].strip()
    compound=re.match(r'^(.*?)\s+n\s+/([^/]+)/\s+(.*?)\s+v\s+/([^/]+)/$',content)
    if compound and compound[1]==compound[3]:
        for pos,ipa in [('n',compound[2]),('v',compound[4])]:
            entries.append({'term':compound[1],'pos':pos,'units':numbers,'ipa':ipa,'sourcePage':page,'raw':raw})
        return
    depth=0;slash=None
    for at,c in enumerate(content):
        if c=='(':depth+=1
        if c==')':depth=max(0,depth-1)
        if c=='/' and not depth:
            end=content.find('/',at+1)
            segment=content[at+1:end if end>=0 else len(content)]
            if (at>0 and content[at-1].isspace()) or re.search(r'[\ue022-\ue0ff\uf769\u0250-\u02ffθð]',segment) or (end>=0 and re.fullmatch('[a-zA-Z]{1,8}',segment)):slash=at;break
    if slash is not None:
        term=content[:slash].strip()
        pronunciation=content[slash+1:].rstrip('/').strip()
    else:
        phonetic=re.search(r'\s+[^\s]*[\ue022-\ue0ff\uf769\u0250-\u02ff?]',content)
        term=content[:phonetic.start()].strip() if phonetic else content
        pronunciation=content[len(term):].strip()
    phonetic=re.search(r'\s+[^\s]*[\ue022-\ue0ff\uf769\u0250-\u02ff?]',term)
    if phonetic:
        pronunciation=term[phonetic.start():].strip().rstrip('/')
        term=term[:phonetic.start()].strip()
    pos=re.search(r'\s+((?:adj|adv|n|v)(?:,\s*(?:adj|adv|n|v))*)\s*$',term)
    partOfSpeech=pos[1] if pos else ''
    if pos:term=term[:pos.start()]
    term=term.replace('\ue067','g')
    if not term or not re.search('[a-zA-Z]',term):unparsed.append({'page':page,'raw':raw});return
    entries.append({'term':term,'pos':partOfSpeech,'units':numbers,'ipa':pronunciation,'sourcePage':page,'raw':raw})

pending='';pendingPage=None
for i in range(258,279):
    page=pdf[i]
    lines=[{'x':l['bbox'][0],'y':l['bbox'][1],'text':''.join(s['text'] for s in l['spans'])} for b in page.get_text('dict')['blocks'] if 'lines'in b for l in b['lines'] if 150<l['bbox'][1]<975] if i==258 else [{'x':l['bbox'][0],'y':l['bbox'][1],'text':''.join(s['text'] for s in l['spans'])} for b in page.get_text('dict')['blocks'] if 'lines'in b for l in b['lines'] if 35<l['bbox'][1]<975]
    starts=[]
    for x,count in collections.Counter(round(l['x'],1) for l in lines).most_common():
        if all(abs(x-s)>100 for s in starts):starts.append(x)
        if len(starts)==3:break
    starts.sort()
    assert len(starts)==3,(i,starts)
    for start in starts:
        column=sorted([l for l in lines if min(starts,key=lambda x:abs(x-l['x']))==start],key=lambda l:l['y'])
        for line in column:
            lineCount+=1
            if not pending:pendingPage=i+1
            pending+=(' ' if pending else '')+line['text']
            if re.search(r'\d\s*$',line['text']):
                parse(pending,pendingPage);pending=''
if pending:parse(pending,pendingPage)

corrections=[]
for entry in entries:
    before=entry['term']
    if before=='ook' and 19 in entry['units']:entry['term']='ebook'
    if before=='ard' and 35 in entry['units']:entry['term']='e-card'
    if before=='North' and 'fr' in entry['ipa']:entry['term']='North African'
    if before=='get' and entry['ipa'].endswith('tu\ue03a'):entry['term']='get to'
    if before=='cange out of':entry['term']='change out of'
    if before!=entry['term']:corrections.append({'page':entry['sourcePage'],'extracted':before,'corrected':entry['term'],'raw':entry['raw']})
out={'sourceName':source.name,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pdfPages':len(pdf),'unitCount':len(units),'indexPageRange':[259,279],'indexLineCount':lineCount,'indexEntryCount':len(entries),'unparsed':unparsed,'sourceCorrections':corrections,'index':entries,'units':units}
(root/'upper-source.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Extracted',len(units),'units,',len(entries),'index entries,',sum(len(e['units']) for e in entries),'unit references. Unparsed:',len(unparsed))
print(json.dumps(unparsed[:25],ensure_ascii=False))
print(json.dumps(entries[:8],ensure_ascii=False))
