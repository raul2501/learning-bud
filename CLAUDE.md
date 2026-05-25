# CLAUDE.md

This file gives Claude Code the context to be useful on this project. Read it at the start of any session.

## What this is

A personal curriculum tracker I'm using to learn AI building over 6 weeks (24 May to 1 July 2026). It's a single-page React app deployed on Vercel that I use daily to:

- Check off curriculum items (readings, building tasks, reviews)
- Answer active recall questions before marking fundamentals complete
- Take weekly spaced recall tests on past material
- Write weekly reflections
- Track progress across 6 weeks

This is a personal tool, not a product. It serves an audience of one (me). Optimize accordingly.

## What this is NOT

- Not a SaaS, not multi-user, not a startup MVP. Do not add auth, user accounts, server-side anything, or analytics.
- Not a content product. The curriculum data is mine and lives in this codebase. Don't move it to a database or CMS.
- Not a long-term codebase. It exists for 6 weeks. After that I'll archive it or rewrite it from scratch as part of my actual main project. Optimize for legibility now, not "scalability."

## Stack

- **Framework:** Vite + React (JavaScript, not TypeScript)
- **Persistence:** Browser localStorage (no backend)
- **Icons:** lucide-react
- **Hosting:** Vercel (auto-deploy on push to main)
- **Fonts:** Google Fonts (Fraunces, JetBrains Mono, Inter) imported via CSS @import

No CSS framework. No state management library. No routing library. No database. The simplicity is intentional.

## Architecture

The entire app is one component in `src/App.jsx`. This is deliberate. Do not refactor it into smaller files unless I explicitly ask for it.

Inside `App.jsx`, the structure is:

1. `QUESTIONS` constant: keyed by curriculum item ID, contains arrays of active recall questions with model answers
2. `CURRICULUM` constant: 6 weeks of structured curriculum data, each with sections and items
3. Helper components: `QuestionModal`, `QuestionBank`, `WeeklyTest`
4. Main `Curriculum` component (default export): handles state, persistence, view switching, and rendering

### State and persistence

Five pieces of state, each persisted to a localStorage key:

| State        | localStorage key             | Shape                                      |
|--------------|------------------------------|--------------------------------------------|
| `completed`  | `curriculum_progress_v4`     | `{ [itemId]: boolean }`                    |
| `notes`      | `curriculum_notes_v4`        | `{ [weekNumber]: string }`                 |
| `expanded`   | `curriculum_expanded_v4`     | `{ [weekNumber]: boolean }`                |
| `answers`    | `curriculum_answers_v4`      | `{ [qid]: { userAnswer, selfRating, ... } }` |
| `tests`      | `curriculum_tests_v4`        | `{ [testKey]: { questions, results, ... } }` |

If you change the shape of any of these, bump the `_v4` to `_v5` so old data doesn't break the app. Do not migrate data automatically; it's a personal tool, losing progress is annoying but acceptable.

### Curriculum data structure

```
CURRICULUM = [
  {
    week: 1,
    dates: "24 May – 30 May",
    theme: "...",
    why: "...",
    sections: [
      {
        type: "fundamentals" | "reading" | "watching" | "doing" | "review",
        title: "...",
        budget: "X hours",
        items: [
          { id: "w1f1", text: "...", url: "https://..." (optional) },
          ...
        ]
      }
    ]
  },
  ...
]
```

Item IDs follow a pattern: `w{week}{sectionType}{number}`. For example:
- `w1f1` = Week 1, fundamentals, item 1
- `w3d2` = Week 3, doing (building), item 2
- `w5s1` = Week 5, Sunday review, item 1

This pattern is used elsewhere (the QUESTIONS keys, the week regex in the test selector), so don't change it.

### Questions

Questions are keyed by item ID in the QUESTIONS object. Each question has:
- `qid`: unique question ID (format: `q_{itemId}_{number}`)
- `question`: the prompt
- `modelAnswer`: the canonical answer
- `lookFor`: rubric of what a strong answer covers

Items with questions cannot be marked complete until all their questions are answered (gated in the `toggle` function).

### The weekly test

When you're in Week N (N > 1), there's a "Start Test" button. It pulls 5 random questions from items in any previous week (`< N`) that you've already answered. Once started, the question set is saved in the `tests` state and persists, so refreshing doesn't reshuffle.

## Conventions

### When I ask for changes

- Default to surgical edits, not refactors. If I ask to fix a bug or change a color, change only that.
- If you think a refactor would help, say so before doing it. Do not refactor without asking.
- When adding curriculum items, follow the existing ID naming pattern.
- When adding questions, follow the existing QUESTIONS object structure.

### Styling

All styles are inline in the `<style>` tag inside the component. This is intentional (one-file simplicity). Do not extract to a separate CSS file or to CSS modules.

Color palette (do not change without asking):
- Background: `#f5efe6` (warm cream)
- Card background: `#fdfaf3` (lighter cream)
- Borders: `#d9c9ab`, `#c9b89d`, `#e8dcc7`
- Text primary: `#1f1a13`, `#2a241c`
- Text secondary: `#4a3f2f`, `#5a4d3a`, `#6b5a44`
- Accent (gold): `#b8860b`, `#d4a017`
- Accent (green for done/success): `#6b8e23`
- Accent (red for missed): `#d97757`

### What to do when localStorage is full or corrupt

Wrap reads in try/catch. If JSON.parse fails, treat as empty state and let the user start over. Don't surface confusing error messages. This is a personal tool; failures should be silent and recoverable, not blocking.

## What to optimize for

In rough order:
1. **It works on my main device.** I use this on macOS Chrome primarily. If something doesn't work elsewhere, lower priority.
2. **Changes are easy to make.** When I want to add a question or tweak a week, I should be able to do it in minutes. Don't introduce abstractions that make this harder.
3. **The reading experience is good.** This is a tool I look at for 30+ minutes daily. Typography, spacing, and visual rhythm matter. Don't break them.
4. **Progress feels durable.** localStorage failures are scary. Defensive coding around saves is worth the effort.

## What NOT to optimize for

- Bundle size, performance, SEO, accessibility scores, mobile pixel-perfection. None of these matter for a personal tool I use on my laptop.
- "Production-ready" patterns. This is not production. It's a 6-week scratchpad.
- Testing. There are no tests. Adding tests is not on the roadmap.
- Beautiful code. Working code that I can read is the bar.

## Commands

| Task              | Command            |
|-------------------|--------------------|
| Install           | `npm install`      |
| Local dev         | `npm run dev`      |
| Build             | `npm run build`    |
| Preview build     | `npm run preview`  |

Push to `main` on GitHub triggers auto-deploy on Vercel.

## Deployment

- **Live:** https://learning-bud.vercel.app/
- **GitHub:** https://github.com/raul2501/learning-bud
- Auto-deploys on push to `main`

## My current context

I'm Rahul, an aspiring AI-native product builder transitioning from PM/founder work. This curriculum tracker is the v0 of what may become my main 6-week project: an AI-native personalized learning system. So this codebase is partly a learning tool AND partly a design reference for what I'll build.

When suggesting changes, you can assume I:
- Know React basics but am not a daily engineer
- Use Claude Code as my pair programmer for most building work
- Prefer being told what's happening over having things hidden behind abstractions
- Value understanding the code over shipping faster
