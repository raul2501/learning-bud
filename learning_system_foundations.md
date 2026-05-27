# LLM-Based Learning System: Theoretical Foundations + Architecture Implications

---

## Theoretical Foundations

### 1. Cognitive Load Theory — Sweller (1988)
Working memory is limited. Learning design must minimize extraneous load and maximize germane load. The system cannot introduce multiple new concepts simultaneously.

### 2. Spaced Repetition — Ebbinghaus (1885), Wozniak/SuperMemo
The forgetting curve is real and well-replicated. Concepts need revisiting at expanding intervals. Not just a flashcard feature — a core scheduling principle governing when any concept resurfaces in the curriculum.

### 3. Retrieval Practice / Testing Effect — Roediger & Karpicke (2006)
Being tested improves long-term retention more than re-studying. Testing is the primary learning mechanism, not just assessment. The system should test constantly, not only at module checkpoints.

### 4. Desirable Difficulties — Bjork (1994)
Interleaving topics, varying practice conditions, and reducing feedback frequency improves long-term retention even though it feels worse in the moment. The system will face pressure to feel smooth. Resist it.

### 5. Zone of Proximal Development — Vygotsky
Tasks just beyond current ability drive learning. Too far beyond causes disengagement. The curriculum generator needs a live model of the learner's current level to pitch every task correctly.

### 6. Constructive Alignment — Biggs (1996)
Learning outcomes, teaching activities, and assessments must all point at the same goal. If the stated goal is "land a PM job" but the system only generates content quizzes, it is misaligned. Every activity must trace back to the learner's stated goal.

---

## Supporting Frameworks

**Mastery Learning — Bloom (1968):** Don't advance until demonstrated competence at current level. The pedagogical core of Duolingo, Khan Academy, Carnegie Learning.

**Self-Determination Theory — Deci & Ryan (1985):** Motivation requires autonomy, competence, and relatedness. UX and framing matter as much as pedagogy.

**Knowledge Tracing — Corbett & Anderson (1994); Deep KT — Piech et al. (2015):** Models the probability a learner knows a concept based on performance history. The engine behind truly adaptive systems. The LLM generates content; knowledge tracing tells it what to generate next.

**Bloom's 2 Sigma Problem — Bloom (1984):** One-on-one human tutoring produces a 2 standard deviation improvement over classroom instruction. This is the benchmark an LLM tutoring system is trying to approximate.

**Fink's Taxonomy — Fink (2003):** The ultimate success criterion is whether learning changed how the student works. Not "can they answer questions about RAG" but "do they make better product decisions because of this?"

---

## Bloom's + Webb's DOK: Applied to AI/PM Learning

| AI Concept | Target Level | DOK | Right Activity |
|---|---|---|---|
| Transformers, tokens, embeddings | Understand + Apply | 2 | Explainer + recall quiz |
| RAG, fine-tuning, prompt engineering | Apply + Analyze | 2-3 | Build something small |
| Evals, benchmarks | Analyze + Evaluate | 3 | Design a real eval |
| Model selection, cost/latency tradeoffs | Evaluate | 3 | Make a real decision and defend it |

---

## Architecture Implications

### 1. Learner Model
Tracks what the learner knows, how they perform, and what their goal is. The core state object. Without it the system is a content library with a chat interface.

- Concept graph with mastery probability per node (knowledge tracing)
- Performance history: correct/incorrect, time-to-answer, confidence signals
- Goal state: job target, project milestone, or mastery level
- Learning style signals derived from behavior, not self-report

### 2. Curriculum Model
A structured graph of concepts with prerequisites, difficulty mappings, and spaced repetition scheduling. The LLM generates content against this graph — it does not own the graph.

- Concept dependency graph (must know X before Y)
- Difficulty tagged to Webb's DOK levels
- Spaced repetition scheduler (SM-2 algorithm or similar)
- Constructive alignment check: every node traces to a goal

### 3. Assessment Engine
Continuous low-stakes retrieval practice, not end-of-module tests. This is the primary learning mechanism, not a measurement layer on top of learning.

- Scenario-based MCQs for Apply/Analyze (DOK 2-3)
- Short structured responses for Evaluate (DOK 3)
- Performance-based tasks for mastery: build an eval, make and defend a decision
- Interleaving enforced by the scheduler, not left to the learner

### 4. Goal Alignment Layer
Every activity generated maps back to the learner's stated outcome. Biggs' constructive alignment operationalized as a system constraint.

- Each activity tagged with the goal it serves
- Periodic realignment prompts
- Output format matched to job artifact type, not generic essays

---

## What the LLM Is and Is Not Good At

| LLM handles well | Needs explicit logic outside LLM |
|---|---|
| Dynamic scenario generation | Knowledge tracing + concept graph |
| Adapting explanation style | Spaced repetition scheduling |
| Generating novel practice problems | Mastery gating |
| Feedback on open-ended responses | Goal alignment checking |
| Socratic questioning | Performance history + state persistence |

**The LLM is the tutor's voice. The architecture around it is the tutor's memory, judgment, and curriculum design.**

---

## Key Reference
*Make It Stick* — Brown, Roediger, McDaniel (2014). Best single read for practitioner grounding: covers retrieval practice, spaced repetition, interleaving, and desirable difficulties in accessible form.
