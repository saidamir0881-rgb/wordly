import logging
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent.parent/'.tools'))
logging.disable(logging.CRITICAL)
from pypdf import PdfReader,PdfWriter
root=Path(__file__).parent/'dist'
reader=PdfReader(str(root.parent/'book-source.pdf'))
out=root/'textbook'
out.mkdir(exist_ok=True)
for part in range(10):
    writer=PdfWriter()
    for p in range(8+part*20,28+part*20):
        writer.add_page(reader.pages[p])
    target=out/f'part-{part+1}.pdf'
    writer.write(str(target))
    print(target.name,target.stat().st_size)
