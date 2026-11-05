# WORDLY

## Hozirgi versiya: oddiy so‘z yodlash

Asosiy sahifa — kitobdagi 100 ta unit. Unit ichida inglizcha–o‘zbekcha so‘zlar, Bilaman / Bilmayman / Yangi filtrlari, kartochkalar va yozib mashq qilish mavjud. Dashboard, XP, reyting, PDF o‘qish va boshqa bo‘limlar yangi interfeysda chiqarilmaydi.

`vocabulary-1.txt`, `vocabulary-2.txt`, `vocabulary-extra.txt` fayllaridan `python build-vocabulary.py` orqali 2 796 ta tarjimali kartochka yaratiladi. So‘z va iboralar PDFdagi qalin yozuvlardan mahalliy ajratilgan; sarlavha, ism va grammatik bo‘laklar tozalangan, ayrim so‘zlar lug‘atdagi asosiy shakliga keltirilgan. Grafikdagi yozuvlar va boshqa shriftdagi iboralar qo‘lda to‘ldirilgan. Tarjimalar tashqi tarjima API’siga yuborilmagan. Lug‘atni keyingi tahrirlashda shu matn fayllarini yangilang.

Old tomonda faqat inglizcha so‘z chiqadi. Bosish yoki Space tarjimani ochadi. Chapga surish / ← / 1 — Bilmayman; o‘ngga surish / → / 2 — Bilaman; S — ovoz. Yozma mashqda ikkala tarjima yo‘nalishi va xatoga darhol javob mavjud. Seans oxirida bilmagan so‘zlarni qayta yodlash mumkin.

Natijalar `wordly-memory-v1` localStorage kalitida saqlanadi. Oldingi `wordly-v1` ma’lumotlari o‘chirilmaydi. Ovoz qurilmadagi brauzer speech synthesis orqali ishlaydi. Internetdagi va localhostdagi natijalar alohida saqlanadi.

Yarim qolgan mashqlar `wordly-sessions-v1` ichida har bir unit uchun alohida saqlanadi: kartochka tartibi, turgan joyi, javoblar, yozma javob qoralamasi va yo‘nalishi. Qayta ochilganda «Davom etish» tugmasi orqali tiklanadi. Hammasi ko‘rib chiqilgan unitlar yashil «Tugallangan» bo‘ladi; bu hamma so‘zni bilish degani emas — bilaman va takrorlash sonlari alohida ko‘rsatiladi. Muddat tugashi yoki har kuni yangilash yo‘q. Shu telefon, brauzer va sayt manziliga qaytilganda holat saqlanadi; qurilmalar orasida avtomatik sinxronlash yo‘q.

Vercel uchun `vercel.json` tayyor statik `dist` papkasini ko‘rsatadi. Vercel loyihasi shu GitHub repoga ulangan bo‘lsa, Production Branch `main` va avtomatik deploy yoqilgan bo‘lsa, push yangi deploy yaratadi. Ushbu konfiguratsiya GitHub integratsiyasini o‘zi ulamaydi.

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
