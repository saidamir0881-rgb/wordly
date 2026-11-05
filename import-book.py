"""Import the user's local textbook contents and lesson pages; no network required."""
import json
import re
import shutil
from pathlib import Path

root = Path(__file__).parent
text = (root / 'book-text.txt').read_text(encoding='utf-8')
pages = {int(n): t.strip() for n, t in re.findall(r'=== PAGE (\d+) ===\n(.*?)(?=\n=== PAGE |\Z)', text, re.S)}
contents = '\n'.join(line for line in (pages[4] + '\n' + pages[5]).splitlines() if not re.search(r'English Vocabulary in Use',line))
matches = list(re.finditer(r'^(\d{1,3}) (.+)$', contents, re.M))
assert [int(m[1]) for m in matches] == list(range(1, 101))
groups = [(1,'Learning'),(5,'The world around us'),(9,'People'),(16,'Daily life'),(31,'Education and study'),(35,'Work and business'),(41,'Leisure and entertainment'),(46,'Tourism'),(52,'Communication and technology'),(56,'Social issues'),(60,'Concepts'),(65,'Functional language'),(70,'Word formation'),(74,'Phrase building'),(81,'Key verbs'),(86,'Words and grammar'),(92,'Connecting and linking'),(95,'Style and register')]
book = []
for m in matches:
    number = int(m[1])
    title = m[2]
    # These titles wrap onto a second line in the printed contents.
    following = contents[m.end():].splitlines()
    if number in [63,66,67,68,69,80,81,83]:
        title += ' ' + next(line.strip() for line in following if line.strip())
    page = number * 2 + 7
    assert pages[page] and pages[page+1]
    book.append(dict(number=number,title=title,group=next(g for start,g in reversed(groups) if start<=number),page=page,printedPage=page-1,lesson=pages[page],exercises=pages[page+1]))
(root/'dist/book.js').write_text('const textbook = '+json.dumps(book,ensure_ascii=False)+';\n',encoding='utf-8')
shutil.copyfile(r'C:/Users/User/Downloads/Telegram Desktop/English Vocabulary in Use Pre-Intermediate and Intermediate.pdf',root/'dist/textbook.pdf')
print(f'Imported {len(book)} units, {len(book)*2} lesson/exercise pages.')
