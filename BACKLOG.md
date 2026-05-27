# Backlog

How to use this file:

- **Next up**: 1 to 3 items max. The things I'm actually working on next session.
- **Considering**: ideas I think are interesting but haven't committed to yet.
- **Parked**: things I wrote down but decided against, or depend on something else.

End-of-session habit: update this file before closing Claude Code.
Start-of-session habit: pick from "Next up" before opening any code.

---

## Next up

*(empty for now, pick from Considering before starting next session)*

---

## Main project architecture context

Reference: `learning_system_foundations.md` in the project root.

The document makes the case for a four-component architecture for the AI-native learning system (the main 6-week project, not this tracker):

1. **Learner Model** — concept graph with mastery probability per node (knowledge tracing). Without this, the system is just a content library with a chat interface.
2. **Curriculum Model** — structured concept dependency graph with prerequisites, difficulty (Webb's DOK), and spaced repetition scheduling. The LLM generates *against* this graph; it doesn't own it.
3. **Assessment Engine** — continuous low-stakes retrieval practice as the primary learning mechanism, not end-of-module tests. Interleaving enforced by the scheduler.
4. **Goal Alignment Layer** — every generated activity traces back to the learner's stated outcome (Biggs' constructive alignment).

**Key design principle:** The LLM is the tutor's voice. The architecture around it is the tutor's memory, judgment, and curriculum design.

**What LLMs handle well vs what needs explicit logic:**
- LLM: dynamic scenario generation, adapting explanation style, novel practice problems, feedback on open-ended responses, Socratic questioning
- Explicit logic: knowledge tracing + concept graph, spaced repetition scheduling, mastery gating, goal alignment checking, performance history

This is the architecture to build in the main project repo, not here.


### LLM grading for answers
**Why:** This is the v0 → v1 of my eventual main project (AI-native learning system). Right now I self-rate, which is honest but lazy. If I wire up an API call that grades my answer against the rubric and gives me real feedback, I get (a) better learning, (b) a working prototype of a key feature of my main product.
**Effort:** medium (one weekend)
**Notes:** Add an API key field in settings (stored in localStorage, never committed). When user submits an answer, send to Anthropic API with the model answer and rubric as context. Return a structured score and qualitative feedback. Keep self-rating as a fallback for when API key is missing or call fails.
**Caveat:** This crosses from "personal tool" into "actual product feature." If I'm going to build this, it might make more sense to build it in my main project repo, not here.

---

## Considering

### Export answers to markdown
**Why:** I want to be able to review all my answers offline, share them with my ML engineer friend, or paste them into a doc for interview prep in Week 6.
**Effort:** small (1 evening)
**Notes:** Probably a "Download" button in the Question Bank tab. Generates a single .md file grouped by week, with each question, my answer, my self-rating, and the model answer. Plain markdown, no fancy formatting. Filename like `curriculum-answers-2026-06-15.md`.

### Better spaced repetition algorithm
**Why:** The current weekly test is random across past questions. Real spaced repetition (Anki-style) would weight by recency and past performance. Questions I got wrong should come back sooner.
**Effort:** medium
**Notes:** Implement a simple SM-2 variant. Each question tracks: last reviewed date, ease factor, interval. Test selection picks questions whose interval has elapsed. Self-rating updates the ease factor.

### Track time spent per item
**Why:** The hour budgets in the curriculum are my estimates. Reality probably differs. If I track actual time, I'll have real data to tune the budgets and to share with anyone else who uses this curriculum.
**Effort:** small
**Notes:** Add a simple start/stop timer per item. Save in localStorage. Show actual vs estimated in the week stats. Don't make it mandatory, just available.

### Dark mode
**Why:** I'll be looking at this tool a lot, including evenings. Light cream background is great by day, less great at night.
**Effort:** small (couple hours)
**Notes:** CSS variables for colors, toggle in header, persisted in localStorage. Don't go fancy with auto-detection of OS preference, just a manual toggle.

### Inline reflection prompts mid-week
**Why:** The weekly Sunday reflection happens after I've already moved on. Catching a thought right after a reading lands better. Could prompt for a quick note after every fundamentals item completion.
**Effort:** small
**Notes:** When a fundamentals item is marked complete, optionally pop up a 1-question prompt: "One sentence: what did you take away from this?" Saves to a per-item notes field. Optional means user can dismiss.

### Connect each fundamentals item to my main project
**Why:** I keep saying "every reading should connect back to the main project." The tool doesn't enforce this. Could add a "How does this apply to your main project?" field that appears alongside the question modal.
**Effort:** small
**Notes:** One free-text field per fundamentals item. Persists. Visible in the Question Bank view alongside the questions. Might feel like homework, so make it optional.

### Voice-assisted teaching
**Why:** Teaching what you just learnt is the best way to master concepts - Feynman's approach to learning
**Effort:** Large (probably)
**Notes:** Voice mode where the AI pretends to be your grandmother or mother or friend who has no clue what you're learning and asks you to ELI5


---

## Parked

### Multi-user / accounts / share with friend
**Reason parked:** Solving for a tiny audience (me and maybe my ML engineer friend) at the cost of significant complexity. If he wants to use this, he can fork the repo and run his own copy. Revisit only if more than 2 people want to use it.

### Convert to mobile app
**Reason parked:** I use this on my laptop primarily. Mobile responsive is enough. A native app is over-engineering.

### Make it a SaaS product
**Reason parked:** This is a tool for my 6-week sprint. The actual product idea (AI-native learning system) belongs in a separate codebase, not bolted onto this v0. If this evolves into a product, it'll be a rewrite.

### AI-generated curriculum (input any topic, get a curriculum)
**Reason parked:** This is literally my main project for the 6 weeks. Doing it here would just be working on the main project in the wrong repo. Build it properly in `/main-project/` instead.

### Gamification (streaks, points, badges)
**Reason parked:** Gimmicky for a personal tool. The intrinsic motivation is becoming a better builder. If I need streaks to stay engaged with my own learning, the curriculum itself is the wrong problem to solve.
