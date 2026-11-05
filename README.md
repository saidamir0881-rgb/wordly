# WORDLY

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
