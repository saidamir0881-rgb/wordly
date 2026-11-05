import logging,json,re,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent.parent/'.tools'))
logging.disable(logging.CRITICAL)
from pypdf import PdfReader
root=Path(__file__).parent
r=PdfReader(str(root/'book-source.pdf'))
result=[]
for unit in range(1,101):
    spans=[]
    def visitor(t,cm,tm,font,size):
        font=str((font or {}).get('/BaseFont',''))
        if t.strip():spans.append(dict(text=t,font=font,size=size,x=tm[4],y=tm[5]))
    r.pages[unit*2+6].extract_text(visitor_text=visitor)
    items=[];pending='';last=None
    def flush():
        global pending
        word=re.sub(r'\s+',' ',pending).strip(' ,.;:*\n\t“”‘’')
        word=re.sub(r'\d+$','',word).strip()
        if len(word)>1 and re.search('[a-zA-Z]',word) and word.lower() not in [i.lower() for i in items] and len(word)<85:
            items.append(word)
        pending=''
    for sp in spans:
        bold='SourceSansPro-Bold' in sp['font'] and 9<sp['size']<=14.5 and sp['y']>60
        if not bold:flush();last=None;continue
        if last and (abs(sp['y']-last['y'])>22 or (abs(sp['y']-last['y'])<2 and sp['x']-last['x']>len(last['text'])*sp['size']*.53+5)):flush()
        pending+=(' ' if pending else '')+sp['text'];last=sp
    flush()
    result.append(dict(unit=unit,terms=items))
(root/'bold-terms.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
for u in result:print(str(u['unit'])+' | '+'; '.join(u['terms']))
