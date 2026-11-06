# WORDLY Android

Installable, signed Android 8+ application (`uz.wordly.app`, version 1.0.0).
It opens the production WORDLY site in its own WebView, so website updates appear
without reinstalling the APK. Internet is required. Progress persists in the
app's own WebView storage and is separate from Telegram/Chrome. Clearing app data
or uninstalling removes that local progress; there is no account sync.

The native adapter connects English speech recognition and installed Android
text-to-speech voices to the existing exercises. Microphone permission is requested
only when starting a voice exercise. Missing/denied services leave the existing
typing fallback available. Uzbek speech requires an installed Uzbek TTS voice.
Backgrounding stops recording and audio. Native requests are restricted to the
exact HTTPS production origin; external HTTPS navigation opens the browser.
No JavaScript file/system bridge or SSL bypass is enabled.

## Build on Windows

1. `python android/prepare.py` downloads checksum-pinned official Temurin JDK 17,
   Android API 35 and SDK Build Tools 35 into ignored `.android-tools/`.
2. `python android/build.py` compiles, aligns, signs and verifies the APK with the
   official SDK tools. Run as your normal Windows user; a restricted sandbox user
   cannot use your Windows DPAPI credentials.
3. `npm.cmd test` validates the learning flows, platform gating and native JS bridge.

Public artifacts: `dist/downloads/wordly.apk` and `release.json` (SHA-256/size/version).
The signer certificate SHA-256 for this release is
`9593abcbbd92701bec586e9e96fbbcbfb46adba1c29f3bfa5ee0ca7fd96ac9e2`.
The build verifies v2/v3 signatures and ZIP alignment. No Android device or emulator
was available during implementation; installation, microphone and TTS should also
be checked on a physical Android phone.

## Preserve signing identity

`android/signing/` contains the private release key and a Windows DPAPI-encrypted
password. Both are ignored by Git. Keep this directory: the same signing key is
required for Android upgrades that retain installed app data. The encrypted
password is tied to the Windows user/machine; migrate it securely before changing
computers. Do not publish either signing file. Increment the manifest versionCode
and build-script release version for a future APK update.

## Telegram distribution

The existing `/start`/menu opens `https://wordly-one-nu.vercel.app/#units`.
Only Android Telegram Mini Apps get the initial “APK yuklab olasizmi?” dialog.
iOS, desktop, ordinary browsers and the installed APK never get it. The Telegram
Bot API does not provide a chat user's operating system; detection happens after
the Mini App opens, via `Telegram.WebApp.platform`. Dismissal is saved locally,
with a small “Android APK” button to reopen it. Download opens the public HTTPS
APK in the external browser with the Android APK MIME type and attachment header.
