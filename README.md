# WORDLY

## Hozirgi versiya: oddiy so‘z yodlash

Sayt yuqoridagi **O‘zbekcha / Русский** tugmalari orqali ikki tilda ishlaydi. Ruscha rejimda barcha 2 796 ta so‘zning tarjimasi, interfeys, yozma mashq va gapni to‘ldirishdagi yordam ruscha bo‘ladi. Inglizcha so‘z va o‘zbek harflaridagi o‘qilish saqlanadi. Qidiruv inglizcha va tanlangan tildagi tarjimadan izlaydi. Qurilmada ruscha TTS ovozi bo‘lsa, ovozli mashq ma’noni ruscha o‘qiydi; javob har doim inglizcha aytiladi.

Til `wordly-language-v1`da saqlanadi. Tilni mashq ichida almashtirish joriy mashqni saqlab, unitga qaytaradi. Yarim qolgan o‘zbekcha mashqlar avvalgi `wordly-sessions-v1`, ruscha mashqlar `wordly-sessions-ru-v1` kalitida saqlanadi. Bilaman/bilmayman holatlari ikkala til uchun umumiy. Ruscha yozma tekshirish `е` va `ё`ni teng qabul qiladi. `vocabulary-ru.json` qo‘lda tayyorlangan ruscha tarjimalar manbasi: har bir yozuv barqaror so‘z IDsi va inglizchasiga bog‘langan. Uni tahrirlagach `python build-vocabulary.py`ni bajaring. Sayt tarjima xizmatlariga so‘rov yubormaydi.

Asosiy sahifa — kitobdagi 100 ta unit. Unit ichida inglizcha–o‘zbekcha so‘zlar, Bilaman / Bilmayman / Yangi filtrlari, kartochkalar va yozib mashq qilish mavjud. Dashboard, XP, reyting, PDF o‘qish va boshqa bo‘limlar yangi interfeysda chiqarilmaydi.

`vocabulary-1.txt`, `vocabulary-2.txt`, `vocabulary-extra.txt` fayllaridan `python build-vocabulary.py` orqali 2 796 ta tarjimali kartochka yaratiladi. So‘z va iboralar PDFdagi qalin yozuvlardan mahalliy ajratilgan; sarlavha, ism va grammatik bo‘laklar tozalangan, ayrim so‘zlar lug‘atdagi asosiy shakliga keltirilgan. Grafikdagi yozuvlar va boshqa shriftdagi iboralar qo‘lda to‘ldirilgan. Tarjimalar tashqi tarjima API’siga yuborilmagan. Lug‘atni keyingi tahrirlashda shu matn fayllarini yangilang.

Old tomonda inglizcha so‘z va uning tagida o‘zbek harflaridagi taxminiy o‘qilishi chiqadi. Aniq talaffuzni ovoz tugmasidan tinglash mumkin. Bosish yoki Space tarjimani ochadi. Chapga surish / ← / 1 — Bilmayman; o‘ngga surish / → / 2 — Bilaman; S — ovoz. Yozma mashqda ikkala tarjima yo‘nalishi va xatoga darhol javob mavjud. Seans oxirida bilmagan so‘zlarni qayta yodlash mumkin.

Ikkinchi usul — «10 soniyada aytish»: o‘zbekcha tarjima ko‘rsatiladi, qurilmada o‘zbekcha TTS ovozi mavjud bo‘lsa o‘qiladi; o‘quvchi inglizchasini mikrofon orqali aytadi. 10 soniya mikrofon tinglashni boshlagach sanaladi. Faqat yakuniy, aniq tanilgan javob qabul qilinadi; to‘g‘ri javob darhol, javobsiz yoki noto‘g‘ri urinish vaqt tugaganda baholanadi. Noto‘g‘ri javobdan keyin qolgan vaqt ichida yana aytish mumkin. Tuzatish va foizli natijalar boshqa usullar bilan bir xil saqlanadi.

«Gapni to‘ldirish» — barcha 100 ta unitga 5 tadan, jami 500 ta original kontekstli gap. O‘zbekcha ma’no yordam sifatida ko‘rinadi, inglizcha so‘z yoki ibora javob tekshirilmaguncha yashiriladi. To‘g‘ri javob gap ichiga joylanadi, xato javobga tuzatish va animatsiya chiqadi. Mashq tanlangan Hammasi/Bilaman/Bilmayman/Yangi filtriga amal qiladi. Qoralama, tekshirilgan javob va qolgan savollar saqlanadi; natija va qayta mashq mavjud usullar bilan bir xil ishlaydi. Har bir so‘z uchun gap hali mavjud emas — tugma tayyor mashqlar sonini ko‘rsatadi. Gaplarni `cloze-1.txt` va `cloze-2.txt` orqali tahrirlang, so‘ng `python build-cloze.py` bilan `dist/cloze-data.js`ni yangilang.

Bu usul brauzerning SpeechRecognition / webkitSpeechRecognition va speechSynthesis imkoniyatlariga bog‘liq. O‘zbekcha ovoz bo‘lmasa matn ko‘rsatiladi. Mikrofon ruxsati, tarmoq yoki xizmat xatosi javobni noto‘g‘ri deb hisoblamaydi. Telegram oynasida ovozni tanish mavjud bo‘lmasa tashqi brauzerga o‘tish yoki inglizchasini yozish tugmalari bor. Oyna yashirilganda, unitdan chiqilganda va keyingi so‘zda mikrofon/taymer to‘xtatiladi. Yarim qolgan ovozli savol qayta kirilganda yangi 10 soniya bilan boshlanadi; tekshirilgan javob qayta baholanmaydi. Audio yozuvlari ilova serveriga yuklanmaydi; ovozni tanish brauzer xizmatida bajariladi.

Natijalar `wordly-memory-v1` localStorage kalitida saqlanadi. Oldingi `wordly-v1` ma’lumotlari o‘chirilmaydi. Ovoz qurilmadagi brauzer speech synthesis orqali ishlaydi. Internetdagi va localhostdagi natijalar alohida saqlanadi.

Yarim qolgan mashqlar `wordly-sessions-v1` ichida har bir unit uchun alohida saqlanadi: kartochka tartibi, turgan joyi, javoblar, yozma javob qoralamasi va yo‘nalishi. Qayta ochilganda «Davom etish» tugmasi orqali tiklanadi. Hammasi ko‘rib chiqilgan unitlar yashil «Tugallangan» bo‘ladi; bu hamma so‘zni bilish degani emas — bilaman va takrorlash sonlari alohida ko‘rsatiladi. Muddat tugashi yoki har kuni yangilash yo‘q. Shu telefon, brauzer va sayt manziliga qaytilganda holat saqlanadi; qurilmalar orasida avtomatik sinxronlash yo‘q.

Vercel uchun `vercel.json` tayyor statik `dist` papkasini ko‘rsatadi. Vercel loyihasi shu GitHub repoga ulangan bo‘lsa, Production Branch `main` va avtomatik deploy yoqilgan bo‘lsa, push yangi deploy yaratadi. Ushbu konfiguratsiya GitHub integratsiyasini o‘zi ulamaydi.

Telegram: `@wordly_intermedit_bot` menyusi va `/start` yoki `/help` javobidagi tugma `https://wordly-one-nu.vercel.app/#units` sahifasini Mini App sifatida ochadi. `api/telegram.js` Vercel funksiyasi Telegram webhook javob protokoli orqali faqat shaxsiy chat buyruqlariga javob beradi. Funksiyada bot tokeni yo‘q, tashqi API chaqirilmaydi va kiruvchi xabarlar saqlanmaydi. Token faqat `telegram-setup.cjs` sozlash yordamchisiga yashirin stdin orqali beriladi; faylga yoki Git’ga yozilmaydi. `WORDLY_SITE_URL` ixtiyoriy HTTPS konfiguratsiyasi bilan sayt manzilini almashtirish mumkin.

Telegram SDK sayt ochilganda tayyor holatni bildiradi, oynani kengaytiradi va orqaga qaytish tugmasini ulaydi. O‘quv natijalari avvalgidek shu brauzer yoki Telegram WebView xotirasida saqlanadi; ular Telegram akkaunti orqali tashqi brauzerga sinxronlanmaydi.

Tekshirish: `npm.cmd test` (PowerShell) yoki `node memory-checks.cjs`.

Quyidagi eski versiya qaydlari faqat texnik tarix uchun saqlangan.

## Localhost

Terminalda `wordly` papkasiga o'ting va `npm start` buyrug'ini bajaring.
Sayt: http://localhost:3000. Qo'shimcha paket o'rnatish shart emas; Node.js yetarli.
Serverni to'xtatish: Ctrl+C. Boshqa port uchun PowerShell: `$env:PORT=3001; npm start`.
Localhost va nashr qilingan sayt taraqqiyotni alohida saqlaydi. Ko'chirish uchun Export/Import funksiyasidan foydalaning.

A responsive English vocabulary workspace with a restrained navy, white and blue design. No build or runtime dependencies. Serve `dist/` using any static web server, or open `dist/index.html` locally.

Includes vocabulary study, English–Uzbek active recall in both directions, browser pronunciation, keyboard flashcards, five test formats, performance-based review scheduling, daily goals, personal statistics, streaks, milestones, levels and XP. Progress and review dates persist in localStorage with JSON export/import.

New known words return in one day, then three days, then an expanding interval using an adaptive ease factor. Difficult words return after a shorter interval; forgotten words return after one minute. Reviews prioritise lapses and overdue dates. Daily goals count distinct words; repeated answers do not award extra daily word XP.

Run `node checks.cjs` for learning-logic and view-rendering checks. These checks use a minimal document stub and do not replace real browser QA.

All 100 units from the supplied fourth-edition PDF are imported with their exact titles, 18 topic groups, lesson and exercise text, and links to their original PDF pages. Unit reading progress is saved separately from vocabulary retention. PDF page numbering is offset by one from the printed book. Search by unit number, title, or topic; filter by topic; navigate between adjacent units. Extracted text can lose visual table layout, so the original PDF remains available.

The interactive flashcard bank still contains 36 original starter words, mapped to relevant textbook topics. The full textbook vocabulary has not been converted to Uzbek flashcards. Textbook exercises are readable rather than automatically graded. Shared Weekly TOP 10 and Global TOP 10 panels show an unconnected state: real rankings require accounts and a shared backend. Audio uses browser speech synthesis. Progress is local to the current browser and does not sync between devices.

Reading guides: edit `pronunciations.json`, then run `python build-vocabulary.py`. To regenerate the initial approximations from CMUdict and manual exceptions, run `python build-pronunciation.py`. Dictionary license: `cmudict-LICENSE.txt` (also included in `dist`).
