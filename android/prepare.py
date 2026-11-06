"""Download the checksum-pinned official Windows Android toolchain locally."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / '.android-tools'


def download(item):
    key, data = item
    archive = TOOLS / (key + '.zip')
    if not archive.exists():
        request = urllib.request.Request(data['url'], headers={'User-Agent': 'Wordly-Android-Build'})
        with urllib.request.urlopen(request, timeout=90) as response, archive.open('wb') as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
    algorithm = 'sha256' if 'sha256' in data else 'sha1'
    with archive.open('rb') as source:
        actual = hashlib.file_digest(source, algorithm).hexdigest()
    if actual != data[algorithm]:
        raise ValueError(key + ' checksum mismatch; remove the incomplete ZIP and retry')
    destination = (TOOLS / key).resolve()
    with zipfile.ZipFile(archive) as source:
        for entry in source.infolist():
            if not (destination / entry.filename).resolve().is_relative_to(destination):
                raise ValueError('Unsafe archive entry')
        source.extractall(destination)
    print(key + ': verified and extracted', flush=True)


if __name__ == '__main__':
    TOOLS.mkdir(exist_ok=True)
    items = json.loads((ROOT / 'android' / 'toolchain.json').read_text())
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(download, items.items()))
