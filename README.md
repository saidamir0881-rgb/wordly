# WORDLY

A responsive English vocabulary workspace with a restrained navy, white and blue design. No build or runtime dependencies. Serve `dist/` using any static web server, or open `dist/index.html` locally.

Includes vocabulary study, English–Uzbek active recall in both directions, browser pronunciation, keyboard flashcards, five test formats, performance-based review scheduling, daily goals, personal statistics, streaks, milestones, levels and XP. Progress and review dates persist in localStorage with JSON export/import.

New known words return in one day, then three days, then an expanding interval using an adaptive ease factor. Difficult words return after a shorter interval; forgotten words return after one minute. Reviews prioritise lapses and overdue dates. Daily goals count distinct words; repeated answers do not award extra daily word XP.

Run `node checks.cjs` for learning-logic and view-rendering checks. These checks use a minimal document stub and do not replace real browser QA.

This release contains 36 original starter words across six units. The supplied PDF has not been imported. Shared Weekly TOP 10 and Global TOP 10 panels are present, but explicitly show an unconnected state: real rankings require accounts and a shared backend. Audio uses the browser's speech synthesis and available voices. Progress is local to the current browser and does not sync between devices.
