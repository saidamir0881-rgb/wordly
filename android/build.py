"""Build and verify a signed APK using the official Android command-line tools.

No Gradle or third-party Android dependencies. The local signing password is
encrypted with Windows DPAPI; neither it nor the private key belongs in Git.
"""
import hashlib
import json
import os
from pathlib import Path
import secrets
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent.parent
ANDROID = ROOT / 'android'
TOOLS = ROOT / '.android-tools'
BUILD = ANDROID / 'build'
SIGNING = ANDROID / 'signing'
OUTPUT = ROOT / 'dist' / 'downloads'


def tool(name):
    matches = list(TOOLS.rglob(name))
    if not matches:
        raise SystemExit('Missing Android tool: ' + name)
    return matches[0]


def run(command, **kwargs):
    subprocess.run([str(value) for value in command], check=True, **kwargs)


def main():
    if os.name != 'nt':
        raise SystemExit('This build script uses the Windows SDK and DPAPI signing storage.')
    for directory in (BUILD, SIGNING, OUTPUT):
        directory.mkdir(parents=True, exist_ok=True)
    java = tool('javac.exe').parent
    sdk = tool('aapt2.exe').parent
    platform = tool('android.jar')
    env = os.environ.copy()
    env['JAVA_HOME'] = str(java.parent)
    env['PATH'] = str(java) + os.pathsep + env.get('PATH', '')
    password_file = SIGNING / 'password.dpapi'
    key_file = SIGNING / 'wordly-release.p12'
    env['WORDLY_SIGNING_PATH'] = str(password_file)
    if not key_file.exists():
        env['WORDLY_SIGNING_PASSWORD'] = secrets.token_urlsafe(36)
        run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command',
             "$env:WORDLY_SIGNING_PASSWORD | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Set-Content -LiteralPath $env:WORDLY_SIGNING_PATH"], env=env)
        run([java / 'keytool.exe', '-genkeypair', '-keystore', key_file, '-storetype', 'PKCS12',
             '-storepass:env', 'WORDLY_SIGNING_PASSWORD', '-keypass:env', 'WORDLY_SIGNING_PASSWORD',
             '-alias', 'wordly', '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000',
             '-dname', 'CN=WORDLY Android, O=WORDLY, C=UZ'], env=env)
    else:
        if not password_file.exists():
            raise SystemExit('Signing password is missing. Restore it; do not replace the existing signing key.')
        result = subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command',
            "$value=Get-Content -LiteralPath $env:WORDLY_SIGNING_PATH | ConvertTo-SecureString; $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($value); try{[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)}"],
            env=env, check=True, capture_output=True, text=True)
        env['WORDLY_SIGNING_PASSWORD'] = result.stdout.strip()
        if not env['WORDLY_SIGNING_PASSWORD']:
            raise SystemExit('Cannot decrypt signing password with this Windows user.')
    classes = BUILD / 'classes'
    dex = BUILD / 'dex'
    classes.mkdir(exist_ok=True)
    dex.mkdir(exist_ok=True)
    run([java / 'javac.exe', '--release', '8', '-encoding', 'UTF-8', '-classpath', platform,
         '-d', classes, *sorted((ANDROID / 'src').rglob('*.java'))], env=env)
    with zipfile.ZipFile(BUILD / 'classes.jar', 'w', zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(classes.rglob('*.class')):
            archive.write(file, file.relative_to(classes).as_posix())
    run([sdk / 'd8.bat', '--min-api', '26', '--lib', platform, '--output', dex, BUILD / 'classes.jar'], env=env)
    run([sdk / 'aapt2.exe', 'compile', '--dir', ANDROID / 'res', '-o', BUILD / 'resources.zip'], env=env)
    unsigned = BUILD / 'unsigned.apk'
    run([sdk / 'aapt2.exe', 'link', '-I', platform, '--manifest', ANDROID / 'AndroidManifest.xml',
         '-o', unsigned, BUILD / 'resources.zip'], env=env)
    with zipfile.ZipFile(unsigned, 'a', zipfile.ZIP_DEFLATED) as archive:
        archive.write(dex / 'classes.dex', 'classes.dex')
    aligned = BUILD / 'aligned.apk'
    run([sdk / 'zipalign.exe', '-f', '-p', '4', unsigned, aligned], env=env)
    apk = OUTPUT / 'wordly.apk'
    run([sdk / 'apksigner.bat', 'sign', '--ks', key_file, '--ks-key-alias', 'wordly',
         '--ks-pass', 'env:WORDLY_SIGNING_PASSWORD', '--key-pass', 'env:WORDLY_SIGNING_PASSWORD',
         '--v1-signing-enabled', 'false', '--v2-signing-enabled', 'true', '--v3-signing-enabled', 'true',
         '--v4-signing-enabled', 'false', '--out', apk, aligned], env=env)
    run([sdk / 'apksigner.bat', 'verify', '--verbose', '--print-certs', apk], env=env)
    run([sdk / 'zipalign.exe', '-c', '-p', '4', apk], env=env)
    release = dict(version='1.0.0', versionCode=1, minAndroid='8.0', package='uz.wordly.app',
                   file='wordly.apk', bytes=apk.stat().st_size, sha256=hashlib.sha256(apk.read_bytes()).hexdigest())
    (OUTPUT / 'release.json').write_text(json.dumps(release, indent=2) + '\n', encoding='utf-8')
    print('Signed and verified:', apk)
    print('APK SHA-256:', release['sha256'])


if __name__ == '__main__':
    main()
