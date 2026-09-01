# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"לומדים AI — מ-0 עד 100" — a Hebrew (RTL) interactive course that teaches AI concepts from the absolute basics through Transformers, LLMs, generative AI and ethics/alignment. It's a client-only Vite + React + TypeScript SPA: 6 modules, 28 lessons, ~109 quiz questions, all content authored directly in TypeScript data files (no CMS, no backend, no database).

## Commands

```bash
npm run dev       # Vite dev server — served at http://localhost:5173/-ai-/ (note the base path, see below)
npm run build     # tsc -b (typecheck) + vite build
npm run lint       # oxlint
npm run preview   # preview the production build locally
```

There is no test suite in this repo. Verification is `tsc -b --noEmit` + `npm run lint` + manually exercising the change in a browser (desktop and mobile widths — this app has repeatedly had RTL/overflow bugs that only show up at narrow widths).

**Base path gotcha:** `vite.config.ts` sets `base: '/-ai-/'` to match the GitHub Pages deploy path (`github.com/Roeegoddes/-ai-`). The dev server therefore serves the app at `/-ai-/`, not `/` — `http://localhost:5173/` alone will 404.

## Product principles

- Optimize for real understanding and long-term retention, not just lesson completion — and for motivation to keep going, not just to finish once.
- Use active recall and spaced repetition as core mechanics (see the spaced-recall system below), not just one-shot end-of-lesson quizzes.
- Keep learning simple and interactive — short, concrete steps over long passive reading.
- Preserve the premium, non-childish visual language: dark theme, purple/cyan/pink accents, restrained motion. Avoid cartoonish gamification (confetti, mascots, loud badges).
- RTL and mobile are requirements, not edge cases — every change gets checked at narrow widths in Hebrew, not just desktop.
- Avoid unnecessary complexity: prefer the simplest structure that solves the actual problem (see the rail-layout note below for a concrete example of this going wrong and getting fixed).

## Architecture

**No router.** `App.tsx` is a hand-rolled state machine (`useState<Route>`), not react-router: `{ screen: 'home' }`, `{ screen: 'glossary' }`, or `{ screen: 'lesson', moduleId, lessonId }`. Navigating is just calling `setRoute`.

**Content is one file.** `src/data/curriculum.ts` is the single source of truth: an array of `Module` → `Lesson[]` → `quiz: QuizQuestion[]` (typed in `src/types.ts`). Each module carries its own accent `color` (green/cyan/purple/pink/amber/red) that every UI piece for that module's lessons — rail markers, card borders, badges — pulls from directly; there's no separate theming layer. Adding or editing lesson content means editing this file only.

**Progress lives in localStorage, unlocking is computed, not stored.** `src/hooks/useProgress.ts` persists `{ completedLessons, quizScores }` under the key `limud-ai-progress-v1`. Whether a given lesson is *unlocked* is not part of that state — it's derived on every render in `Home.tsx`/`LearningPath.tsx` by flattening all lessons across modules and checking that the previous lesson in that flattened order is completed. Lesson 1 of module 1 is always unlocked.

**Home page (`LearningPath.tsx`) renders progress as a vertical rail**, not a plain list: a thin colored line runs through markers (module icon, then each lesson), with lesson content as cards beside it (flexbox row-per-lesson, no absolute positioning or coordinate math — an earlier zigzag/absolute-positioned layout was deliberately replaced because it caused persistent text/line overlap bugs). Three distinct visual weights by design, not just three color variants: the **current** lesson is a large bordered card with a glow and its own CTA pill; **completed** lessons collapse to a compact single line; **locked** lessons stay a plain muted card. A subtle "✦ שלב הושלם" divider appears between modules once every lesson in one is done.

**A lesson has two possible flows**, chosen by `App.tsx` per lesson:
- **Normal flow** (`LessonPage.tsx` → `LessonReader.tsx` → `Quiz.tsx`): reading is a step-by-step card stepper — one idea per card, then an optional key-terms flashcard step, then the end-of-lesson quiz. `LessonReader.tsx` also owns the **spaced-recall system**: with a 60% chance (`RECALL_CHANCE`), one extra card is inserted near the end of the reading steps, pulling a random question from a lesson the user already completed (via `useProgress`) and labeling it "בדיקת זיכרון 🧠". It reuses existing quiz content — no separate recall question bank.
- **Prototype flow** (`components/prototype/LessonPrototype.tsx` + `data/prototypeLesson.ts`): an experimental 8-stage format (Hook → Prediction → Concept cards → Interactive → Apply It → Understanding checks → AI Map → Mastery check), currently wired to exactly **one** lesson via the `PROTOTYPE_LESSON` constant (`{ moduleId: 'foundations', lessonId: 'what-is-ai' }`) in `prototypeLesson.ts`. `App.tsx` checks that constant to decide which flow to render. It's meant to stay scoped to that single lesson unless explicitly asked to expand — don't assume it should apply to all lessons.

**Glossary (`GlossaryPage.tsx` + `data/glossary.ts`)** is a separate, hand-curated term list (not auto-derived from lesson content) with search and category filtering — 74 terms across 7 categories.

**Deployment is two parallel targets that both need updating:**
1. GitHub Pages via `.github/workflows/deploy.yml` (builds and deploys `dist/` on push to `main`) — this is the "real" deploy.
2. A Claude Artifact, published by manually inlining the built `dist/assets/*.js` and `*.css` into a single self-contained HTML file. This is not automated; it's redone by hand (build → read the two asset files → paste into one `<style>`/`<script>` HTML shell → publish) whenever the artifact needs to reflect the latest build.

**Styling:** Tailwind v4 via `@tailwindcss/vite` — there is no `tailwind.config.js`; theme tokens (colors, fonts) are defined in the `@theme` block at the top of `src/index.css`. Dark theme only, `dir="rtl"` throughout, Heebo (Hebrew) / JetBrains Mono loaded from Google Fonts in `index.html`.
