import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronRight, BookOpen, Hammer, Eye, Target, Layers, ExternalLink, HelpCircle, X, Archive, FileText } from 'lucide-react';

// =================== QUESTIONS DATA ===================
// Each fundamentals item can have questions attached
const QUESTIONS = {
  // Week 1 — Mental Model of LLMs
  w1f1: [
    {
      qid: "q_w1f1_1",
      question: "In Karpathy's framing, an LLM is essentially two files. What are they, and what is the relationship between them?",
      modelAnswer: "An LLM is a `parameters` file (the trained weights, typically hundreds of GB) and a `run.c` file (the small program that uses those weights to generate text). The parameters file IS the model. The run code is just an interpreter that loops the parameters to predict the next token. The training process (which is what costs millions) produces the parameters file. Inference is cheap; training is expensive.",
      lookFor: "(1) Distinction between parameters and runtime code (2) Awareness that the parameters file is the actual 'intelligence' (3) Understanding that training >> inference in cost"
    },
    {
      qid: "q_w1f1_2",
      question: "Karpathy describes LLMs as 'dream machines'. What does he mean by this, and what's the practical implication for someone building products on top of them?",
      modelAnswer: "LLMs hallucinate fluently because they're trained to produce text that looks like training data, not to be factually correct. The 'dream machine' framing means the model is always making something up that's statistically plausible. The practical implication: you can't trust raw model output for factual claims. You need grounding (RAG, tool use, verification) for any product where correctness matters.",
      lookFor: "(1) The 'plausibility, not truth' insight (2) Connection to hallucination (3) Practical takeaway about product design with grounding/verification"
    }
  ],
  w1f2: [
    {
      qid: "q_w1f2_1",
      question: "In a transformer, what is a 'token' and why is the model not operating on words or characters directly?",
      modelAnswer: "A token is a chunk of text (often a sub-word) that the model treats as its atomic unit. Words are too coarse (vocabulary explosion, can't handle unknown words) and characters are too fine (sequence length explodes, semantic units get lost). Tokens (via BPE or similar) are a compromise that handles common words as single tokens and rare/unknown words as multiple tokens. This is why context windows are measured in tokens, not words.",
      lookFor: "(1) Tokens as compromise between words and chars (2) Why this matters: context limits, cost, multilingual handling (3) Awareness of tokenization quirks"
    },
    {
      qid: "q_w1f2_2",
      question: "Why is the embedding step important? What changes about a token once it becomes a vector?",
      modelAnswer: "Embedding converts each token (a discrete ID) into a high-dimensional vector. The vector encodes meaning: similar tokens have similar vectors. This is what lets the model do math on meaning. Once tokens are vectors, you can measure similarity, do arithmetic (king - man + woman ≈ queen), and feed them through neural network layers that operate on continuous values. Discrete IDs can't do any of this.",
      lookFor: "(1) Discrete to continuous transformation (2) Semantic similarity in vector space (3) Why this enables downstream computation"
    }
  ],
  w1f3: [
    {
      qid: "q_w1f3_1",
      question: "What is attention actually computing? Explain in one sentence, then in terms of queries/keys/values.",
      modelAnswer: "One sentence: attention computes a weighted average of all token representations, where the weights say 'how relevant is each other token to me right now'. In Q/K/V terms: each token produces a query (what am I looking for), a key (what do I match on), and a value (what I contribute). Queries dot with keys to produce attention weights. Those weights average the values. Result: each token's new representation incorporates info from the tokens that matter to it.",
      lookFor: "(1) Weighted average framing (2) Correct mapping of Q/K/V roles (3) The 'each token gets context from others' intuition"
    },
    {
      qid: "q_w1f3_2",
      question: "Why is attention computationally expensive, and why does this matter for long context windows?",
      modelAnswer: "Attention requires every token to attend to every other token, which is O(n²) where n is sequence length. Doubling the context window quadruples the compute. This is why early models had 2k context windows, why long-context models are a real engineering feat, and why prompt caching matters so much (avoid re-running attention on the same prefix). For builders: longer context isn't free, it has real latency and cost implications.",
      lookFor: "(1) O(n²) scaling (2) Practical implication for cost/latency (3) Connection to caching strategies"
    }
  ],
  w1f4: [
    {
      qid: "q_w1f4_1",
      question: "In a transformer, what role does the 'positional encoding' play? Why is it needed at all?",
      modelAnswer: "Attention by itself is permutation-invariant: it doesn't know the order of tokens. 'The cat sat on the mat' and 'mat the on sat cat the' would look identical to raw attention. Positional encoding adds information about each token's position in the sequence, so the model knows order. Without it, you couldn't do basic things like understand syntax, follow narratives, or distinguish subject from object.",
      lookFor: "(1) Attention is order-blind by default (2) Positional encoding fixes this (3) Why order matters for language"
    },
    {
      qid: "q_w1f4_2",
      question: "What is a 'decoder-only' transformer, and why is this the dominant architecture for modern LLMs like Claude and GPT?",
      modelAnswer: "Original transformers had an encoder (processes input) and decoder (generates output), designed for tasks like translation. Decoder-only models stack just the decoder, trained to predict the next token. This simpler architecture turned out to be remarkably general: by predicting next tokens on internet-scale text, the model learns to do almost any task that can be framed as 'continue this text.' Decoder-only won because it scales better and generalizes broadly.",
      lookFor: "(1) Decoder-only = next-token prediction (2) Why this generalizes (3) Awareness this wasn't obvious until GPT-2/3 showed it worked"
    }
  ],

  // Week 2 — Prompts and Context
  w2f1: [
    {
      qid: "q_w2f1_1",
      question: "What's the core distinction between 'prompt engineering' and 'context engineering' in Anthropic's framing?",
      modelAnswer: "Prompt engineering is about crafting the words of instructions, examples, and formatting (the surface text you write). Context engineering is the broader discipline of deciding what information to put in the context window at all: which tools to expose, which past messages to include, what retrieved content to inject, how to structure it. Prompt engineering is a subset of context engineering. As agents and longer interactions become common, context engineering matters more because you're orchestrating what the model sees, not just writing one prompt.",
      lookFor: "(1) Context as superset of prompts (2) The orchestration framing (3) Awareness this matters more for agents/long interactions"
    },
    {
      qid: "q_w2f1_2",
      question: "Why might adding more information to context actually hurt performance, even when the information is relevant?",
      modelAnswer: "Context window pollution. Models pay attention across all tokens, so irrelevant or marginally-relevant content dilutes the signal. Too many tools confuse the model about which to use. Too many examples can cause it to copy patterns superficially. Long contexts also have a 'lost in the middle' effect where information in the middle of long contexts is recalled worse than start or end. So more context isn't always better; curated context is better.",
      lookFor: "(1) Signal dilution / distraction (2) Lost-in-the-middle effect (3) Curated > comprehensive"
    }
  ],
  w2f2: [
    {
      qid: "q_w2f2_1",
      question: "When should you use a 'system prompt' vs putting instructions in the user message? What's the practical difference?",
      modelAnswer: "System prompts are for stable, role-defining instructions that apply across the whole conversation (the assistant's persona, constraints, format requirements). User messages are for the specific request at hand. Models are trained to weight system prompts as authoritative, so putting your core behavior rules there is more reliable than repeating them in every user message. Practical rule: if it applies to every turn, system; if it's about this specific request, user.",
      lookFor: "(1) System = stable role/rules (2) User = turn-specific request (3) Awareness that models weight them differently"
    },
    {
      qid: "q_w2f2_2",
      question: "What is chain-of-thought prompting, and why does it work?",
      modelAnswer: "Chain-of-thought prompting asks the model to reason step by step before giving an answer, rather than jumping to the conclusion. It works because models are trained on text where complex reasoning is shown explicitly, so producing the intermediate steps makes the model more likely to follow them correctly. It also gives the model 'thinking room' (more tokens to compute through), and surfaces errors so you can debug. For builders: if accuracy matters and latency doesn't, CoT almost always helps.",
      lookFor: "(1) Step-by-step before answer (2) Why it works: thinking tokens + trained pattern (3) The accuracy/latency tradeoff"
    }
  ],
  w2f3: [
    {
      qid: "q_w2f3_1",
      question: "What's the value of 'few-shot' examples in a prompt? When are they worth including?",
      modelAnswer: "Few-shot examples (showing the model 2-5 input/output pairs before the actual task) demonstrate the pattern you want without having to describe it in words. They're worth including when the format is hard to specify in prose, when you want consistency across outputs, or when the task is unusual. They cost tokens, so for tasks where instructions suffice (most common tasks), examples are overkill. Rule of thumb: try zero-shot first, add examples only when zero-shot fails on edge cases.",
      lookFor: "(1) Pattern demonstration via examples (2) When they're worth the token cost (3) Try zero-shot first principle"
    }
  ],
  w2f4: [
    {
      qid: "q_w2f4_1",
      question: "When an LLM generates text, what is actually happening at each step? Why is this described as 'autoregressive'?",
      modelAnswer: "At each step, the model computes a probability distribution over all possible next tokens given the entire context so far. It then samples one token from that distribution (or picks the most likely, depending on temperature). That new token is appended to the context, and the process repeats. 'Autoregressive' means each new output depends on all previous outputs, in a feedback loop. This is why generation is inherently sequential and why you can't parallelize across output tokens within a single response.",
      lookFor: "(1) Probability distribution → sample → append → repeat (2) The sequential nature (3) Practical implication: latency grows with output length"
    },
    {
      qid: "q_w2f4_2",
      question: "What does the 'temperature' parameter actually do mathematically, and what's a practical guide for setting it?",
      modelAnswer: "Temperature scales the probability distribution before sampling. Temperature 0 means always pick the most likely token (deterministic). Higher temperatures flatten the distribution, making lower-probability tokens more likely (more random/creative). Above ~1.5 the output starts getting incoherent. Practical guide: 0 for factual extraction, classification, or code; 0.3-0.7 for most generation tasks; 0.8-1.0 for creative writing; avoid going above 1.0 unless you specifically want chaos.",
      lookFor: "(1) Distribution scaling (2) Temperature 0 = greedy (3) Practical settings for different tasks"
    }
  ],

  // Week 3 — Evals
  w3f1: [
    {
      qid: "q_w3f1_1",
      question: "In Hamel's view, what's the single biggest mistake teams make with LLM evals, and what should they do instead?",
      modelAnswer: "The biggest mistake is reaching for generic, pre-built eval metrics (like BLEU, ROUGE, or off-the-shelf LLM judges) before understanding their specific failure modes. Hamel argues you should start by looking at actual outputs from your system, manually labeling them, finding the failure patterns specific to YOUR use case, and then building evals that target those specific failures. Generic metrics measure something, but rarely what actually matters for your product.",
      lookFor: "(1) Critique of generic/pre-built metrics (2) Start with manual review (3) Build evals around your specific failure modes"
    },
    {
      qid: "q_w3f1_2",
      question: "Why does Hamel emphasize 'looking at your data' so heavily? What does that look like in practice?",
      modelAnswer: "Looking at data means manually reviewing actual model outputs from your system, in detail, with the kind of attention you'd give to a customer interview. In practice: sample 50-100 outputs, read each carefully, take notes on what's wrong, cluster the issues. This is unglamorous and slow but it's the only way to find the real failure modes (which are often surprising and not what you'd predict). Without this, you build evals for problems you imagine, not problems your system actually has.",
      lookFor: "(1) Manual, detailed review (2) Surprising failure modes you wouldn't predict (3) Connection to customer research mindset"
    }
  ],
  w3f2: [
    {
      qid: "q_w3f2_1",
      question: "What's the difference between using an LLM as a judge for binary correctness vs scoring along a dimension? When does each fail?",
      modelAnswer: "Binary judges (is this output correct: yes/no) are more reliable because the model only has to make one decision. Scoring judges (rate this 1-5 on helpfulness) are noisier because models struggle with calibration across the scale (they often cluster scores in the middle, or have arbitrary thresholds). Binary fails when the underlying quality is genuinely continuous and you lose information. Scoring fails on consistency, especially between runs or different models. Rule: prefer binary judges, decompose continuous dimensions into multiple binary checks.",
      lookFor: "(1) Binary > scoring for reliability (2) Why scoring is noisy (calibration problems) (3) Decomposition strategy"
    },
    {
      qid: "q_w3f2_2",
      question: "How do you validate that your LLM-as-judge is actually trustworthy?",
      modelAnswer: "You compare the judge's grades to human grades on the same outputs. Take 30-50 examples, manually grade them yourself, then have the judge grade them, and measure agreement (Cohen's kappa or simple % agreement). If the judge agrees with you 90%+ of the time, you can trust it for scaled evaluation. If it agrees 60%, the judge is noisy and you need to tune its prompt or accept the noise. This calibration step is non-optional; without it you're trusting a black box.",
      lookFor: "(1) Human-judge agreement measurement (2) Specific methodology (sample, dual-grade, compare) (3) The 'non-optional' framing"
    }
  ],
  w3f3: [
    {
      qid: "q_w3f3_1",
      question: "Hamel's 'Field Guide' describes a tight loop for improving AI products. What are the key steps and why is the loop tight?",
      modelAnswer: "The loop: (1) look at outputs, (2) identify a failure mode, (3) write an eval that detects it, (4) iterate on the system until the eval passes, (5) repeat with the next failure mode. It's 'tight' because each step is small and concrete, and you don't move forward without measurable progress. Most teams break this loop by skipping to step 4 (just changing prompts) without first having an eval that defines what 'better' means. Without the eval, you can't tell if you're improving or just thrashing.",
      lookFor: "(1) The five-step loop in order (2) The 'tight' framing: small concrete steps (3) Why most teams break it: skipping evals"
    }
  ],
  w3f4: [
    {
      qid: "q_w3f4_1",
      question: "State Goodhart's Law in your own words and give an example of how it manifests in LLM evaluation.",
      modelAnswer: "Goodhart's Law: when a measure becomes a target, it ceases to be a good measure. Example in LLM evals: if you optimize for a 'helpfulness' LLM judge score, the system might learn to produce outputs that sound helpful (longer, more confident, with bullet points) without actually being more helpful. The judge can be gamed. This is why you need multiple evals measuring different things, regular human review, and skepticism toward any single metric that's improving rapidly.",
      lookFor: "(1) Correct statement of Goodhart's Law (2) A concrete LLM example showing gaming (3) Mitigation: multiple metrics + human review"
    }
  ],

  // Week 4 — Workflows
  w4f1: [
    {
      qid: "q_w4f1_1",
      question: "In Anthropic's framing, what's the distinction between a 'workflow' and an 'agent'? When should you use each?",
      modelAnswer: "A workflow has pre-defined steps with LLMs making decisions within those steps. An agent has the LLM deciding what steps to take and in what order, often with tools. Workflows are predictable, debuggable, and cheaper. Agents are more flexible but expensive, slower, and harder to debug. Anthropic's recommendation: start with workflows. Only move to agents when you have a task that genuinely requires open-ended decision-making (which is rarer than people think). Most production AI products are workflows wearing agent clothes.",
      lookFor: "(1) Predefined steps vs LLM-decided steps (2) Tradeoffs: predictability/cost vs flexibility (3) The 'start with workflows' rule"
    },
    {
      qid: "q_w4f1_2",
      question: "What's the 'prompt chaining' pattern, and what's a concrete example where it beats a single prompt?",
      modelAnswer: "Prompt chaining: decompose a task into sequential subtasks, where each LLM call's output feeds into the next. Example: generating a research report. Single prompt: 'write a research report about X' (poor quality, scattered). Chained: (1) generate outline, (2) for each section, expand into bullets, (3) for each bullet, write 2-3 sentences, (4) combine and copyedit. Each step is simpler, so the model performs better at each. Total tokens go up but quality goes up much more.",
      lookFor: "(1) Sequential decomposition (2) Why it beats single prompts: each step is simpler (3) Cost/quality tradeoff"
    }
  ],
  w4f2: [
    {
      qid: "q_w4f2_1",
      question: "What's the 'routing' pattern, and when is it the right choice?",
      modelAnswer: "Routing: first LLM call classifies the input into a category, then routes to a specialized handler for that category. Example: a customer support bot routes 'billing question' to a billing handler with billing tools and prompts, vs 'technical issue' to a tech handler. It's the right choice when you have distinct input types that benefit from different prompts/tools/models, where a single 'do everything' prompt would be bloated or inconsistent. Pairs well with using cheaper models for routing and stronger models for handlers.",
      lookFor: "(1) Classify-then-specialize pattern (2) When it's right: distinct input types (3) Model-tiering bonus"
    }
  ],
  w4f3: [
    {
      qid: "q_w4f3_1",
      question: "Eugene Yan's 'patterns' post identifies several core patterns for LLM systems. Name three and briefly describe each.",
      modelAnswer: "Examples include: (1) Evals: writing tests for non-deterministic outputs to measure improvement, (2) RAG: retrieving relevant context to ground generation, (3) Fine-tuning: training a base model on task-specific data for specialized tasks, (4) Caching: storing previous responses to reduce cost/latency, (5) Guardrails: input/output validation to prevent harmful behaviors, (6) Defensive UX: designing UI around model fallibility (confidence indicators, easy undos), (7) Collecting user feedback: turning real usage into eval data. Any three with correct descriptions.",
      lookFor: "(1) Three named patterns (2) Accurate brief descriptions (3) Awareness that these are composable, not exclusive"
    }
  ],
  w4f4: [
    {
      qid: "q_w4f4_1",
      question: "What's the most important lesson from the 'Year of Building with LLMs' essay about taking AI products to production?",
      modelAnswer: "Multiple valid answers, but the most cited: production AI products are 80% engineering/iteration/evals and 20% model magic. Teams that succeed have tight feedback loops between real usage, evals, and prompt/system improvements. Teams that fail wait too long to ship, polish the wrong things, or trust model outputs without instrumentation. The 'work like an engineer, not a researcher' framing is key: ship, measure, iterate, don't optimize in a vacuum. Other valid answers include: simple architectures beat complex ones, evals are the moat, user feedback > intuition.",
      lookFor: "(1) The 80/20 engineering/model split (2) Tight feedback loops (3) Ship-measure-iterate over premature optimization"
    }
  ],

  // Week 5 — Retrieval and Tools
  w5f1: [
    {
      qid: "q_w5f1_1",
      question: "What's an embedding, and why are embeddings the foundation of modern retrieval systems?",
      modelAnswer: "An embedding is a fixed-length vector (e.g., 1536 numbers) that represents a chunk of text in semantic space. Similar meanings → similar vectors. This is the foundation of retrieval because you can: (1) embed your knowledge base once, (2) embed a query at search time, (3) find the closest matching chunks by vector similarity (cosine distance). This is semantic search: it finds 'how do I refund a charge' even if the docs say 'reverse a transaction', because the embeddings capture meaning, not keywords. Without embeddings, you're stuck with keyword matching, which is brittle.",
      lookFor: "(1) Fixed-length vector encoding meaning (2) Semantic similarity in vector space (3) Why this beats keyword search"
    },
    {
      qid: "q_w5f1_2",
      question: "What's the analogy to 'king - man + woman = queen' actually telling us about embedding space?",
      modelAnswer: "Embedding spaces have linear structure: relationships between concepts are encoded as directions in the vector space. The 'man → woman' direction encodes gender. The 'king → queen' direction encodes the same gender concept. Adding/subtracting these vectors moves you through concept space in predictable ways. This isn't a curiosity; it's evidence that embeddings capture meaningful structure, not random encoding. Practical implication: you can do real reasoning over embeddings, find analogies, cluster concepts, etc.",
      lookFor: "(1) Linear structure / directions encode concepts (2) Evidence of meaningful encoding (3) Practical implication for reasoning"
    }
  ],
  w5f2: [
    {
      qid: "q_w5f2_1",
      question: "What's the difference between giving an LLM 'tools' vs just having it generate text? Why is this powerful?",
      modelAnswer: "Without tools, the LLM only generates text; the application has to interpret that text and decide what to do. With tools, the LLM is told 'here are functions you can call' (with names, descriptions, and parameter schemas), and it can decide to call them, providing structured arguments. The application executes the function and returns results to the model. This is powerful because: (1) outputs are structured (JSON-typed args) instead of natural-language ambiguity, (2) the model can do actions in the world (read files, query APIs, send messages), (3) the loop can continue: read tool result, decide next action.",
      lookFor: "(1) Structured calls with typed args (2) Actions in the world (3) The continuation loop"
    },
    {
      qid: "q_w5f2_2",
      question: "What's the risk of giving an LLM 'write' tools (tools that change state), and how do you mitigate it?",
      modelAnswer: "Risks: (1) Hallucinated tool calls (the model invokes a tool with bad arguments), (2) Wrong tool selection (uses delete when it should use update), (3) Prompt injection (a malicious input convinces the model to take destructive action), (4) No undo. Mitigations: (1) Start with read-only tools to build confidence, (2) Require human approval for write actions, (3) Implement permission scopes (the model only has access to data it should), (4) Soft-deletes and audit logs, (5) Treat tool descriptions as security-critical and assume the model will sometimes get them wrong.",
      lookFor: "(1) At least 2 named risks (2) At least 2 named mitigations (3) The 'start read-only' principle"
    }
  ],
  w5f3: [
    {
      qid: "q_w5f3_1",
      question: "What is 'chunking' in a RAG system, and why is naive chunking (e.g., fixed-length splits) often bad?",
      modelAnswer: "Chunking is splitting documents into smaller pieces that get embedded and indexed individually. Naive fixed-length chunking (e.g., every 500 tokens) is often bad because: (1) it splits across semantic boundaries (mid-sentence, mid-section), creating chunks that don't stand on their own, (2) related context gets separated (a 'because' loses its 'why'), (3) chunk size doesn't match query specificity. Better: semantic chunking (split on natural boundaries like sections/paragraphs), contextual chunking (add document-level context to each chunk), variable-size chunks based on content density.",
      lookFor: "(1) Definition of chunking (2) At least 2 specific problems with fixed-length (3) At least one better approach"
    }
  ],
  w5f4: [
    {
      qid: "q_w5f4_1",
      question: "What's 'contextual retrieval' from Anthropic, and what specific problem does it solve over naive RAG?",
      modelAnswer: "Contextual retrieval: before embedding each chunk, you use an LLM to prepend a short context about what document/section the chunk came from and what it relates to. Example: a chunk that says 'this increased by 3.2%' becomes 'In the Q3 2024 earnings report's revenue section: this increased by 3.2%'. This solves the problem that chunks often lose their context when separated from the parent document, making retrieval miss relevant chunks. Anthropic showed it cut retrieval failures by ~50%. Cost: a one-time embedding pre-processing step per chunk.",
      lookFor: "(1) Adding LLM-generated context to chunks before embedding (2) The decontextualization problem it solves (3) Awareness it's a preprocessing cost"
    }
  ],

  // Week 6 — Production
  w6f1: [
    {
      qid: "q_w6f1_1",
      question: "Based on Vercel's 'What we learned building agents', what kinds of tasks are agents currently good at vs bad at?",
      modelAnswer: "Vercel argues agents work well on tasks with low cognitive load and high repetition. Examples: data entry, research, qualification, triage. These are too dynamic for traditional automation but predictable enough for AI to handle reliably. Agents struggle with: tasks requiring nuanced judgment, tasks where errors are costly and hard to detect, tasks requiring long-horizon planning beyond a few steps, tasks where the model has to coordinate many tools precisely. The product implication: pick agent use cases that are repetitive and forgiving of small errors, not high-stakes one-shot decisions.",
      lookFor: "(1) Low cognitive load + high repetition as the sweet spot (2) At least 2 specific task types that work (3) At least 1 type that doesn't"
    }
  ],
  w6f2: [
    {
      qid: "q_w6f2_1",
      question: "What does the Stripe 'Can AI agents build real Stripe integrations' post teach us about the role of evals in AI product development?",
      modelAnswer: "The post is essentially a public eval suite for a real-world AI engineering task (Stripe integrations). Key lessons: (1) Real-world evals are hard tasks that intentionally try to stump models, not toy benchmarks. (2) Building the eval suite is itself the work: they had to define what 'successful integration' means, in machine-checkable ways. (3) Their results showed models have become surprisingly good at multi-step real-world work (best runs averaged 63 turns), which would have been impossible 18 months prior. The meta-lesson: if you want to know what AI can really do for your product, build a real eval; you'll learn more than from any benchmark.",
      lookFor: "(1) Public eval = real test, not toy (2) Building the eval IS the work (3) Connecting back to your own project's eval needs"
    }
  ]
};

// =================== CURRICULUM DATA ===================
const CURRICULUM = [
  {
    week: 1,
    dates: "24 May – 30 May",
    theme: "Mental Model of LLMs",
    why: "Before learning frameworks (which will be obsolete in 6 months), build a mental model of what's actually happening inside the model. This intuition will outlast every framework you encounter.",
    sections: [
      {
        type: "fundamentals",
        title: "Fundamentals",
        budget: "5 hours",
        items: [
          { id: "w1f1", text: "Andrej Karpathy: Intro to Large Language Models (1 hr YouTube talk)", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" },
          { id: "w1f2", text: "3Blue1Brown: But what is a GPT? Visual intro to Transformers", url: "https://www.youtube.com/watch?v=wjZofJX0v4M" },
          { id: "w1f3", text: "3Blue1Brown: Attention in Transformers (Chapter 6)", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc" },
          { id: "w1f4", text: "Jay Alammar: The Illustrated Transformer (read, don't skim)", url: "https://jalammar.github.io/illustrated-transformer/" },
          { id: "w1f5", text: "Write 200 words in your own words: what is an LLM actually doing when it generates text?" },
        ]
      },
      {
        type: "reading",
        title: "Product Context",
        budget: "2 hours",
        items: [
          { id: "w1r1", text: "Handbook Ch.1: Language of Generative and Agentic AI (skim, use as reference)" },
          { id: "w1r2", text: "Handbook Ch.3: Models: How to Choose" },
        ]
      },
      {
        type: "doing",
        title: "Building – Poke the Model",
        budget: "8 hours",
        items: [
          { id: "w1d1", text: "Setup: Anthropic API account + Claude Code installed", url: "https://console.anthropic.com/" },
          { id: "w1d1b", text: "Create a public GitHub repo (name it whatever, e.g. `ai-builder-lab`) as a monorepo for all 6 weeks. Folders: /throwaway-experiments, /main-project, /side-experiment, /learnings. Building in public is its own forcing function." },
          { id: "w1d2", text: "Write 3 problem-space one-pagers. Run each through the 4 tests: (1) can it grow from single call → evals → multi-step → tools/RAG naturally? (2) is quality measurable, not vibes? (3) do you have a real user (even you) with articulable preferences? (4) is the AI the hard part?" },
          { id: "w1d3", text: "Throwaway #1: CLI tool that takes a topic, returns 3 contrarian takes. Under 100 lines. Just to feel the API. Lives in /throwaway-experiments." },
          { id: "w1d4", text: "Same prompt at temperature 0, 0.5, 1.0. Run each 5 times. Write down what you observe." },
          { id: "w1d5", text: "Same prompt at max_tokens 50, 200, 1000. Notice how the model 'plans' under different limits." },
        ]
      },
      {
        type: "review",
        title: "Sunday Review",
        budget: "1 hour",
        items: [
          { id: "w1s1", text: "Public post: Week 1 reflection on mental model + what's next" },
          { id: "w1s2", text: "Commit to your main project for weeks 2–5. The one-pager that passes 3 of 4 tests wins. Update README in your repo with the chosen project." },
        ]
      }
    ]
  },
  {
    week: 2,
    dates: "31 May – 6 June",
    theme: "Main Project v1: Single Call",
    why: "Ship the simplest possible version of your main project. One LLM call, one prompt, one output. The point isn't to be good yet, it's to have something real to iterate on for the next 4 weeks.",
    sections: [
      {
        type: "fundamentals",
        title: "Fundamentals",
        budget: "4 hours",
        items: [
          { id: "w2f1", text: "Anthropic: Effective Context Engineering for AI Agents (canonical)", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" },
          { id: "w2f2", text: "Anthropic: Prompt engineering overview docs", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
          { id: "w2f3", text: "Anthropic Interactive Prompt Engineering Tutorial (hands-on)", url: "https://github.com/anthropics/prompt-eng-interactive-tutorial" },
          { id: "w2f4", text: "Jay Alammar: Illustrated GPT-2 (deeper on how generation works)", url: "https://jalammar.github.io/illustrated-gpt2/" },
        ]
      },
      {
        type: "reading",
        title: "Product Context",
        budget: "2 hours",
        items: [
          { id: "w2r1", text: "Handbook Ch.4: Problem-First Design, Revisited" },
          { id: "w2r2", text: "Handbook Ch.5: Prompting and Context Engineering" },
        ]
      },
      {
        type: "doing",
        title: "Building – Main Project v1",
        budget: "12 hours",
        items: [
          { id: "w2d1", text: "Write a full AI PRD for your main project. What's the v1 scope? What's the v4 vision (after evals, multi-step, tools/RAG)?" },
          { id: "w2d2", text: "Build v1: single LLM call. Prompt → model → output. Resist the urge to make it complex." },
          { id: "w2d3", text: "Run prompt iteration log: track 5+ versions, what changed, what the output did. Commit each to /main-project/prompts/" },
          { id: "w2d4", text: "Try the same task on Claude vs GPT vs Gemini. Note differences. Build model intuition." },
          { id: "w2d5", text: "Deploy v1 somewhere a real user can hit it (Vercel, Lovable, Streamlit). Get it in front of at least 1 person who isn't you." },
        ]
      },
      {
        type: "review",
        title: "Sunday Review",
        budget: "1 hour",
        items: [
          { id: "w2s1", text: "Public post with link to v1 of your main project" },
          { id: "w2s2", text: "Write 200 words: what does v1 do badly? What do you think the main failure modes will be? (You'll test these next week.)" },
        ]
      }
    ]
  },
  {
    week: 3,
    dates: "7 June – 13 June",
    theme: "Main Project v2: Evals",
    why: "Evals are the most timeless skill in AI building. Now you add them to your v1. This is where the project starts becoming a real product instead of a demo.",
    sections: [
      {
        type: "fundamentals",
        title: "Fundamentals",
        budget: "5 hours",
        items: [
          { id: "w3f1", text: "Hamel Husain: Your AI Product Needs Evals (canonical post)", url: "https://hamel.dev/blog/posts/evals/" },
          { id: "w3f2", text: "Hamel Husain: Creating a LLM-as-a-Judge That Drives Business Results", url: "https://hamel.dev/blog/posts/llm-judge/" },
          { id: "w3f3", text: "Hamel Husain: A Field Guide to Rapidly Improving AI Products", url: "https://hamel.dev/blog/posts/field-guide/" },
          { id: "w3f4", text: "Goodhart's Law and metric gaming (15 min read)", url: "https://en.wikipedia.org/wiki/Goodhart%27s_law" },
          { id: "w3f5", text: "Write 200 words: what's the difference between an offline eval and an online eval?" },
        ]
      },
      {
        type: "reading",
        title: "Product Context",
        budget: "2 hours",
        items: [
          { id: "w3r1", text: "Handbook Ch.6: Why Evals Are the Real Work" },
          { id: "w3r2", text: "Handbook Ch.7+8: Code-Based Evals + LLM-as-Judge (reference)" },
        ]
      },
      {
        type: "watching",
        title: "Watching",
        budget: "3 hours",
        items: [
          { id: "w3w1", text: "AI Evals for Everyone (full free course)", url: "https://github.com/aishwaryanr/awesome-generative-ai-guide/blob/main/free_courses/ai_evals_for_everyone/README.md" },
          { id: "w3w2", text: "Teresa Torres: From Noob to 5 Automated Evals in 4 Weeks (as a PM)", url: "https://hamelhusain.substack.com/p/the-best-public-example-of-ai-evals" },
        ]
      },
      {
        type: "doing",
        title: "Building – Evals for Main Project",
        budget: "10 hours",
        items: [
          { id: "w3d1", text: "Write 20–30 test cases for your main project, covering variety of real inputs" },
          { id: "w3d2", text: "Code-based evals: format, length, structure checks (whatever applies to your output)" },
          { id: "w3d3", text: "LLM-as-judge evals: pick 2–3 quality dimensions that actually matter for your project" },
          { id: "w3d4", text: "Golden dataset: 10+ cases with expected outputs (handcrafted, lives in /main-project/evals/)" },
          { id: "w3d5", text: "Run evals → find failures → iterate on v1 prompt → re-run. Document before/after scores." },
          { id: "w3d6", text: "Validate your LLM judge: sample 10 outputs, manually grade, compare to judge. Tune until aligned." },
        ]
      },
      {
        type: "review",
        title: "Sunday Review",
        budget: "1 hour",
        items: [
          { id: "w3s1", text: "Public post: eval results, failure modes, fixes. Compare v1 (no evals) to v2 (with evals). High-signal content." },
        ]
      }
    ]
  },
  {
    week: 4,
    dates: "14 June – 20 June",
    theme: "Main Project v3: Multi-Step",
    why: "Evolve your single-call project into a multi-step workflow. Same problem, deeper solution. Your eval suite from Week 3 becomes invaluable here because you can immediately measure whether the more complex version is actually better.",
    sections: [
      {
        type: "fundamentals",
        title: "Fundamentals",
        budget: "4 hours",
        items: [
          { id: "w4f1", text: "Anthropic: Building Effective Agents (the canonical post on patterns)", url: "https://www.anthropic.com/research/building-effective-agents" },
          { id: "w4f2", text: "Anthropic cookbook: reference implementations of agent patterns", url: "https://github.com/anthropics/anthropic-cookbook/tree/main/patterns/agents" },
          { id: "w4f3", text: "Eugene Yan: Patterns for Building LLM-Based Systems & Products", url: "https://eugeneyan.com/writing/llm-patterns/" },
          { id: "w4f4", text: "Eugene Yan + others: What We've Learned From A Year of Building with LLMs", url: "https://applied-llms.org/" },
        ]
      },
      {
        type: "reading",
        title: "Product Context",
        budget: "2 hours",
        items: [
          { id: "w4r1", text: "Handbook Ch.9: Guardrails: Input and Output" },
          { id: "w4r2", text: "Handbook Ch.10+11: Workflow and Router Patterns" },
        ]
      },
      {
        type: "doing",
        title: "Building – Main Project v3",
        budget: "14 hours",
        items: [
          { id: "w4d1", text: "Refactor main project to multi-step. Same user need, but break it into 2–4 LLM calls that each do one thing well." },
          { id: "w4d2", text: "Use chain or router pattern. Don't jump to autonomous agents. Document your architectural decision." },
          { id: "w4d3", text: "Add observability: Arize (free tier) for traces of every step", url: "https://arize.com/" },
          { id: "w4d4", text: "Add at least one input guardrail and one output guardrail" },
          { id: "w4d5", text: "Re-run your Week 3 eval suite on v3. Is the multi-step version actually better? Document with numbers." },
          { id: "w4d6", text: "Track cost per request. Notice where the cost actually goes. Multi-step often costs 3–5x more, is it worth it?" },
        ]
      },
      {
        type: "review",
        title: "Sunday Review",
        budget: "1 hour",
        items: [
          { id: "w4s1", text: "Public post: the v1 → v3 evolution of your main project. Show the eval scores at each stage. This is the kind of artifact that starts conversations." },
        ]
      }
    ]
  },
  {
    week: 5,
    dates: "21 June – 27 June",
    theme: "Main Project v4 + Side Experiment",
    why: "Add the final layer to your main project (tools or RAG, whichever fits naturally). Then build one small standalone experiment to demonstrate the concept your main project didn't naturally need.",
    sections: [
      {
        type: "fundamentals",
        title: "Fundamentals",
        budget: "5 hours",
        items: [
          { id: "w5f1", text: "Jay Alammar: Illustrated Word2Vec (foundation for embeddings)", url: "https://jalammar.github.io/illustrated-word2vec/" },
          { id: "w5f2", text: "Anthropic: Tool Use docs", url: "https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview" },
          { id: "w5f3", text: "Eugene Yan on RAG patterns (in his LLM patterns post, RAG section)", url: "https://eugeneyan.com/writing/llm-patterns/#retrieval-augmented-generation-to-add-knowledge" },
          { id: "w5f4", text: "Anthropic: Contextual Retrieval (modern RAG done right)", url: "https://www.anthropic.com/news/contextual-retrieval" },
          { id: "w5f5", text: "Write 200 words: when is RAG the wrong answer? When is it the right one?" },
        ]
      },
      {
        type: "reading",
        title: "Product Context",
        budget: "1 hour",
        items: [
          { id: "w5r1", text: "Handbook Ch.12+13: Tool Use + Retrieval (reference)" },
        ]
      },
      {
        type: "doing",
        title: "Building – Main Project v4",
        budget: "12 hours",
        items: [
          { id: "w5d1", text: "Add tools OR retrieval to your main project, whichever fits the user need more naturally. Don't force both." },
          { id: "w5d2", text: "If RAG: build simple (top-k cosine similarity) before reaching for a vector DB. Curate your own small corpus first." },
          { id: "w5d3", text: "If tools: start read-only. Permissioning matters. Don't let an agent delete things." },
          { id: "w5d4", text: "Update your eval suite with new test cases that exercise the new capability" },
          { id: "w5d5", text: "Polish the UX. This is the version people will look at. v4 should feel like a product, not a demo." },
        ]
      },
      {
        type: "doing",
        title: "Side Experiment (Optional)",
        budget: "4 hours",
        items: [
          { id: "w5d6", text: "Build one tiny standalone thing that demonstrates whichever of tools/RAG your main project didn't use. Keep it under a few hundred lines. Lives in /side-experiment/." },
          { id: "w5d7", text: "Write a short README explaining what it demonstrates and why you built it as a separate experiment." },
        ]
      },
      {
        type: "review",
        title: "Sunday Review",
        budget: "1 hour",
        items: [
          { id: "w5s1", text: "Public post: main project v4 demo + a screen recording. Mention the side experiment if you did one." },
        ]
      }
    ]
  },
  {
    week: 6,
    dates: "28 June – 1 July",
    theme: "Polish, Writeups, Start Conversations",
    why: "Three shipped things mean nothing if nobody can see them. This week is packaging, not building.",
    sections: [
      {
        type: "fundamentals",
        title: "Fundamentals",
        budget: "2 hours",
        items: [
          { id: "w6f1", text: "Vercel: What we learned building agents at Vercel", url: "https://vercel.com/blog/what-we-learned-building-agents-at-vercel" },
          { id: "w6f2", text: "Stripe: Can AI agents build real Stripe integrations? (eval methodology)", url: "https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations" },
          { id: "w6f3", text: "Anthropic: How Anthropic teams use Claude Code", url: "https://www.anthropic.com/news/how-anthropic-teams-use-claude-code" },
          { id: "w6f4", text: "Notice the structure: how do they describe the problem? The architecture choices? The tradeoffs? Your main project writeup should follow this shape." },
        ]
      },
      {
        type: "doing",
        title: "Packaging",
        budget: "12 hours",
        items: [
          { id: "w6d1", text: "Long-form writeup (1000–1500 words) of your main project: the problem, the v1 → v4 evolution, what evals taught you, architectural decisions, what you'd change. This is your headline artifact." },
          { id: "w6d2", text: "Short writeup (300 words) of the side experiment if you did one" },
          { id: "w6d3", text: "One-pager portfolio site: main project front and center, side experiment + throwaway as secondary proof of range" },
          { id: "w6d4", text: "Update LinkedIn: new positioning as PM/builder, link to portfolio. Pin the main project post." },
          { id: "w6d5", text: "List of 15–20 people to reach out to (founders, AI PMs, builders)" },
          { id: "w6d6", text: "Send 5 messages this week. Conversations, not applications." },
        ]
      },
      {
        type: "review",
        title: "Final Review",
        budget: "2 hours",
        items: [
          { id: "w6s1", text: "Final reflection post: 6 weeks of going from PM to AI builder" },
          { id: "w6s2", text: "Honest self-assessment: edge, gaps, what's next?" },
        ]
      }
    ]
  }
];

const TYPE_CONFIG = {
  fundamentals: { icon: Layers, color: 'fundamentals' },
  reading: { icon: BookOpen, color: 'reading' },
  watching: { icon: Eye, color: 'watching' },
  doing: { icon: Hammer, color: 'doing' },
  review: { icon: Target, color: 'review' },
};

const STORAGE_KEY = 'curriculum_progress_v4';
const NOTES_KEY = 'curriculum_notes_v4';
const EXPANDED_KEY = 'curriculum_expanded_v4';
const ANSWERS_KEY = 'curriculum_answers_v4';
const TESTS_KEY = 'curriculum_tests_v4';
const VIEW_KEY = 'curriculum_view_v4';

// =================== QUESTION MODAL ===================
function QuestionModal({ itemId, item, onClose, answers, setAnswers, completed, toggle }) {
  const questions = QUESTIONS[itemId] || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [draft, setDraft] = useState(answers[questions[currentIdx]?.qid]?.userAnswer || '');
  const [showAnswer, setShowAnswer] = useState(!!answers[questions[currentIdx]?.qid]?.selfRating);

  if (questions.length === 0) return null;

  const q = questions[currentIdx];
  const existing = answers[q.qid];

  const saveAnswer = (rating) => {
    const next = {
      ...answers,
      [q.qid]: {
        userAnswer: draft,
        selfRating: rating,
        answeredAt: new Date().toISOString(),
        itemId,
      }
    };
    setAnswers(next);
  };

  const handleSubmit = () => {
    setShowAnswer(true);
  };

  const handleRate = (rating) => {
    saveAnswer(rating);
  };

  const allAnswered = questions.every(qq => answers[qq.qid]?.selfRating);

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      const newIdx = currentIdx + 1;
      setCurrentIdx(newIdx);
      const newQ = questions[newIdx];
      setDraft(answers[newQ.qid]?.userAnswer || '');
      setShowAnswer(!!answers[newQ.qid]?.selfRating);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      const newIdx = currentIdx - 1;
      setCurrentIdx(newIdx);
      const newQ = questions[newIdx];
      setDraft(answers[newQ.qid]?.userAnswer || '');
      setShowAnswer(!!answers[newQ.qid]?.selfRating);
    }
  };

  const handleMarkComplete = () => {
    if (allAnswered && !completed[itemId]) {
      toggle(itemId);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Active Recall · {currentIdx + 1} of {questions.length}</div>
            <div className="modal-source">{item.text}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="question-text">{q.question}</div>

          <textarea
            className="answer-input"
            placeholder="Write your answer here, in your own words. Don't look it up. The struggle is the point."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={showAnswer}
          />

          {!showAnswer && (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={draft.trim().length < 20}
            >
              Submit & See Model Answer
            </button>
          )}

          {showAnswer && (
            <>
              <div className="model-answer">
                <div className="model-answer-label">Model answer</div>
                <div className="model-answer-text">{q.modelAnswer}</div>
              </div>

              <div className="look-for">
                <div className="look-for-label">What a strong answer covers</div>
                <div className="look-for-text">{q.lookFor}</div>
              </div>

              <div className="rate-section">
                <div className="rate-label">Honest self-rating:</div>
                <div className="rate-buttons">
                  <button
                    className={`rate-btn miss ${existing?.selfRating === 'miss' ? 'active' : ''}`}
                    onClick={() => handleRate('miss')}
                  >
                    Missed it
                  </button>
                  <button
                    className={`rate-btn partial ${existing?.selfRating === 'partial' ? 'active' : ''}`}
                    onClick={() => handleRate('partial')}
                  >
                    Partial
                  </button>
                  <button
                    className={`rate-btn full ${existing?.selfRating === 'full' ? 'active' : ''}`}
                    onClick={() => handleRate('full')}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="nav-btn"
            onClick={prevQuestion}
            disabled={currentIdx === 0}
          >
            ← Previous
          </button>
          {currentIdx < questions.length - 1 ? (
            <button className="nav-btn" onClick={nextQuestion}>
              Next →
            </button>
          ) : (
            <button
              className={`complete-btn ${allAnswered ? 'ready' : ''}`}
              onClick={handleMarkComplete}
              disabled={!allAnswered}
            >
              {allAnswered ? (completed[itemId] ? 'Done' : 'Mark Reading Complete') : `${questions.filter(qq => answers[qq.qid]?.selfRating).length}/${questions.length} answered`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =================== QUESTION BANK VIEW ===================
function QuestionBank({ answers, onClose }) {
  const answeredQids = Object.keys(answers).filter(qid => answers[qid]?.selfRating);

  const byWeek = {};
  answeredQids.forEach(qid => {
    const weekMatch = qid.match(/q_w(\d+)/);
    const week = weekMatch ? parseInt(weekMatch[1]) : 0;
    if (!byWeek[week]) byWeek[week] = [];
    byWeek[week].push(qid);
  });

  const findQuestion = (qid) => {
    for (const items of Object.values(QUESTIONS)) {
      const found = items.find(q => q.qid === qid);
      if (found) return found;
    }
    return null;
  };

  const stats = {
    full: answeredQids.filter(qid => answers[qid].selfRating === 'full').length,
    partial: answeredQids.filter(qid => answers[qid].selfRating === 'partial').length,
    miss: answeredQids.filter(qid => answers[qid].selfRating === 'miss').length,
  };

  return (
    <div className="bank-view">
      <div className="bank-header">
        <h2 className="bank-title">Question Bank</h2>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="bank-stats">
        <div className="bank-stat full"><strong>{stats.full}</strong> got it</div>
        <div className="bank-stat partial"><strong>{stats.partial}</strong> partial</div>
        <div className="bank-stat miss"><strong>{stats.miss}</strong> missed</div>
      </div>

      {Object.keys(byWeek).length === 0 ? (
        <div className="bank-empty">No questions answered yet. Start with Week 1 fundamentals.</div>
      ) : (
        Object.keys(byWeek).sort().map(week => (
          <div key={week} className="bank-week">
            <div className="bank-week-title">Week {week}</div>
            {byWeek[week].map(qid => {
              const q = findQuestion(qid);
              const a = answers[qid];
              if (!q) return null;
              return (
                <div key={qid} className={`bank-question rating-${a.selfRating}`}>
                  <div className="bank-q-text">{q.question}</div>
                  <div className="bank-a-row">
                    <span className="bank-a-label">Your answer:</span>
                    <span className="bank-a-text">{a.userAnswer || '(empty)'}</span>
                  </div>
                  <details className="bank-details">
                    <summary>Model answer</summary>
                    <div className="bank-model-answer">{q.modelAnswer}</div>
                  </details>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

// =================== WEEKLY TEST ===================
function WeeklyTest({ weekNum, answers, tests, setTests, onClose }) {
  // Pull 5 random questions from past weeks (not the current week)
  const availableQuestions = [];
  Object.entries(QUESTIONS).forEach(([itemId, qs]) => {
    const wMatch = itemId.match(/w(\d+)/);
    if (wMatch && parseInt(wMatch[1]) < weekNum) {
      qs.forEach(q => {
        if (answers[q.qid]) {
          availableQuestions.push(q);
        }
      });
    }
  });

  const testKey = `week${weekNum}_test`;
  const existingTest = tests[testKey];

  const [selectedQs] = useState(() => {
    if (existingTest?.questions) return existingTest.questions;
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(5, shuffled.length));
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [draft, setDraft] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState(existingTest?.results || {});

  // Save selectedQs to tests on first render if not already saved
  useEffect(() => {
    if (!existingTest) {
      setTests({
        ...tests,
        [testKey]: { questions: selectedQs, results: {}, startedAt: new Date().toISOString() }
      });
    }
  }, []);

  if (availableQuestions.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-eyebrow">Weekly Test</div>
            <button className="modal-close" onClick={onClose}><X size={20} /></button>
          </div>
          <div className="modal-body">
            <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
              No questions available yet. Complete some fundamentals first, then come back at the start of next week for a test.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const q = selectedQs[currentIdx];
  const result = results[q.qid];

  const handleSubmit = () => {
    setShowAnswer(true);
  };

  const handleRate = (rating) => {
    const newResults = { ...results, [q.qid]: { userAnswer: draft, selfRating: rating } };
    setResults(newResults);
    setTests({
      ...tests,
      [testKey]: { ...tests[testKey], results: newResults }
    });
  };

  const next = () => {
    if (currentIdx < selectedQs.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setDraft('');
      setShowAnswer(false);
    }
  };

  const prev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      const prevResult = results[selectedQs[currentIdx - 1].qid];
      setDraft(prevResult?.userAnswer || '');
      setShowAnswer(!!prevResult?.selfRating);
    }
  };

  const allDone = selectedQs.every(qq => results[qq.qid]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Week {weekNum} Spaced Recall Test · {currentIdx + 1} of {selectedQs.length}</div>
            <div className="modal-source">Testing retention on past material</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="question-text">{q.question}</div>

          <textarea
            className="answer-input"
            placeholder="Answer without looking. Recall is the practice."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={showAnswer}
          />

          {!showAnswer && (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={draft.trim().length < 20}
            >
              Submit & Compare
            </button>
          )}

          {showAnswer && (
            <>
              <div className="model-answer">
                <div className="model-answer-label">Model answer</div>
                <div className="model-answer-text">{q.modelAnswer}</div>
              </div>

              <div className="rate-section">
                <div className="rate-label">How did you do?</div>
                <div className="rate-buttons">
                  <button
                    className={`rate-btn miss ${result?.selfRating === 'miss' ? 'active' : ''}`}
                    onClick={() => handleRate('miss')}
                  >
                    Missed it
                  </button>
                  <button
                    className={`rate-btn partial ${result?.selfRating === 'partial' ? 'active' : ''}`}
                    onClick={() => handleRate('partial')}
                  >
                    Partial
                  </button>
                  <button
                    className={`rate-btn full ${result?.selfRating === 'full' ? 'active' : ''}`}
                    onClick={() => handleRate('full')}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="nav-btn" onClick={prev} disabled={currentIdx === 0}>← Previous</button>
          {currentIdx < selectedQs.length - 1 ? (
            <button className="nav-btn" onClick={next}>Next →</button>
          ) : (
            <button className={`complete-btn ${allDone ? 'ready' : ''}`} onClick={onClose} disabled={!allDone}>
              {allDone ? 'Finish Test' : `${Object.keys(results).length}/${selectedQs.length} answered`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =================== MAIN COMPONENT ===================
export default function Curriculum() {
  const [completed, setCompleted] = useState({});
  const [notes, setNotes] = useState({});
  const [expanded, setExpanded] = useState({ 1: true });
  const [answers, setAnswers] = useState({});
  const [tests, setTests] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [view, setView] = useState('curriculum');
  const [testWeek, setTestWeek] = useState(null);

  useEffect(() => {
    try {
      const c = localStorage.getItem(STORAGE_KEY);
      const n = localStorage.getItem(NOTES_KEY);
      const e = localStorage.getItem(EXPANDED_KEY);
      const a = localStorage.getItem(ANSWERS_KEY);
      const t = localStorage.getItem(TESTS_KEY);
      if (c) setCompleted(JSON.parse(c));
      if (n) setNotes(JSON.parse(n));
      if (e) setExpanded(JSON.parse(e));
      if (a) setAnswers(JSON.parse(a));
      if (t) setTests(JSON.parse(t));
    } catch (err) {
      console.log('No saved data');
    }
    setLoading(false);
  }, []);

  const save = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  };

  const toggle = (id) => {
    if (QUESTIONS[id] && !completed[id]) {
      const qs = QUESTIONS[id];
      const allAnswered = qs.every(q => answers[q.qid]?.selfRating);
      if (!allAnswered) {
        setActiveQuestion(id);
        return;
      }
    }
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    save(STORAGE_KEY, next);
  };

  const updateNote = (week, val) => {
    const next = { ...notes, [week]: val };
    setNotes(next);
    save(NOTES_KEY, next);
  };

  const updateAnswers = (next) => {
    setAnswers(next);
    save(ANSWERS_KEY, next);
  };

  const updateTests = (next) => {
    setTests(next);
    save(TESTS_KEY, next);
  };

  const toggleWeek = (week) => {
    const next = { ...expanded, [week]: !expanded[week] };
    setExpanded(next);
    save(EXPANDED_KEY, next);
  };

  const weekStats = (week) => {
    const allIds = week.sections.flatMap(s => s.items.map(i => i.id));
    const done = allIds.filter(id => completed[id]).length;
    return { done, total: allIds.length };
  };

  const totalDone = Object.values(completed).filter(Boolean).length;
  const totalItems = CURRICULUM.reduce((sum, w) => sum + w.sections.flatMap(s => s.items).length, 0);
  const overallPct = Math.round((totalDone / totalItems) * 100);

  const findItem = (itemId) => {
    for (const w of CURRICULUM) {
      for (const s of w.sections) {
        const item = s.items.find(i => i.id === itemId);
        if (item) return item;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Fraunces, serif', color: '#3a3226' }}>
        Loading your progress...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

        .curriculum { font-family: 'Inter', sans-serif; background: #f5efe6; min-height: 100vh; padding: 32px 24px; color: #2a241c; }
        .container { max-width: 880px; margin: 0 auto; }

        .header { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #c9b89d; }
        .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #8b6f4e; margin-bottom: 12px; }
        .title { font-family: 'Fraunces', serif; font-size: 48px; font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 8px; color: #1f1a13; }
        .subtitle { font-family: 'Fraunces', serif; font-size: 18px; font-style: italic; color: #6b5a44; font-weight: 400; }

        .nav-tabs { display: flex; gap: 4px; margin-top: 24px; border-bottom: 1px solid #c9b89d; }
        .nav-tab { background: none; border: none; padding: 12px 16px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #8b6f4e; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; }
        .nav-tab:hover { color: #1f1a13; }
        .nav-tab.active { color: #1f1a13; border-bottom-color: #b8860b; }

        .meta-bar { display: flex; gap: 32px; margin-top: 24px; flex-wrap: wrap; }
        .meta-item { display: flex; flex-direction: column; gap: 4px; }
        .meta-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8b6f4e; }
        .meta-value { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #1f1a13; }

        .progress-bar { height: 6px; background: #e8dcc7; border-radius: 3px; overflow: hidden; margin-top: 16px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #b8860b, #d4a017); transition: width 0.4s ease; }

        .principles { background: #ede2cf; border-left: 3px solid #b8860b; padding: 20px 24px; margin-bottom: 32px; border-radius: 0 4px 4px 0; }
        .principles-title { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #1f1a13; }
        .principles ul { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7; color: #4a3f2f; }
        .principles li { margin-bottom: 6px; }

        .week { background: #fdfaf3; border: 1px solid #d9c9ab; border-radius: 6px; margin-bottom: 16px; overflow: hidden; transition: all 0.2s ease; }
        .week:hover { border-color: #b8860b; }

        .week-header { padding: 24px 28px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #fdfaf3; transition: background 0.15s ease; }
        .week-header:hover { background: #f7f0df; }
        .week-header-left { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
        .week-number { font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; color: #8b6f4e; letter-spacing: 0.1em; text-transform: uppercase; }
        .week-info { flex: 1; min-width: 0; }
        .week-theme { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600; color: #1f1a13; line-height: 1.2; margin-bottom: 4px; }
        .week-dates { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8b6f4e; }
        .week-stats { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #6b5a44; flex-shrink: 0; font-weight: 500; }
        .week-stats.done { color: #6b8e23; font-weight: 600; }

        .test-trigger { background: #f5e6c8; border: 1px dashed #b8860b; padding: 12px 16px; margin: 16px 28px 0; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-family: 'Fraunces', serif; font-style: italic; font-size: 14px; color: #5a4d3a; cursor: pointer; transition: all 0.15s ease; }
        .test-trigger:hover { background: #f0dba8; }
        .test-trigger-btn { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; padding: 6px 12px; background: #b8860b; color: white; border: none; border-radius: 4px; cursor: pointer; font-style: normal; }

        .week-body { padding: 0 28px 24px 28px; border-top: 1px solid #e8dcc7; }
        .week-why { font-family: 'Fraunces', serif; font-style: italic; font-size: 15px; color: #5a4d3a; line-height: 1.6; padding: 16px 0; border-bottom: 1px solid #e8dcc7; margin-bottom: 20px; }

        .section { margin-bottom: 24px; }
        .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .section-icon { width: 18px; height: 18px; flex-shrink: 0; }
        .section-icon.fundamentals { color: #6b4226; }
        .section-icon.reading { color: #b8860b; }
        .section-icon.watching { color: #8b6f4e; }
        .section-icon.doing { color: #a0522d; }
        .section-icon.review { color: #6b8e23; }
        .section-title { font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; color: #1f1a13; }
        .section-budget { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8b6f4e; margin-left: auto; }

        .item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; margin-bottom: 4px; border-radius: 4px; transition: all 0.15s ease; }
        .item:hover { background: #f5efe6; }
        .item-check { width: 18px; height: 18px; border: 1.5px solid #c9b89d; border-radius: 4px; flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; background: #fdfaf3; transition: all 0.15s ease; cursor: pointer; }
        .item.checked .item-check { background: #6b8e23; border-color: #6b8e23; }
        .item-text-wrap { flex: 1; display: flex; align-items: flex-start; gap: 6px; cursor: pointer; }
        .item-text { font-size: 14px; line-height: 1.5; color: #2a241c; }
        .item.checked .item-text { color: #8b8268; text-decoration: line-through; text-decoration-color: #c9b89d; }
        .item-link { display: inline-flex; align-items: center; gap: 4px; color: #b8860b; text-decoration: none; font-size: 13px; font-weight: 500; padding: 2px 6px; border-radius: 3px; flex-shrink: 0; transition: all 0.15s ease; }
        .item-link:hover { background: #f5e6c8; color: #8b6f0a; }
        .item-questions { display: inline-flex; align-items: center; gap: 4px; color: #6b4226; background: #ede2cf; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: 500; cursor: pointer; flex-shrink: 0; border: none; font-family: 'Inter', sans-serif; transition: all 0.15s ease; }
        .item-questions:hover { background: #d9c9ab; }
        .item-questions.answered { color: #6b8e23; background: #e8e9d5; }

        .notes-area { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e8dcc7; }
        .notes-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8b6f4e; margin-bottom: 8px; }
        .notes-input { width: 100%; min-height: 80px; background: #fdfaf3; border: 1px solid #d9c9ab; border-radius: 4px; padding: 12px 14px; font-family: 'Fraunces', serif; font-size: 15px; color: #2a241c; resize: vertical; line-height: 1.5; font-style: italic; }
        .notes-input:focus { outline: none; border-color: #b8860b; }
        .notes-input::placeholder { color: #a89880; font-style: italic; }

        .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #c9b89d; font-family: 'Fraunces', serif; font-size: 14px; font-style: italic; color: #6b5a44; text-align: center; line-height: 1.6; }

        /* MODAL */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(31, 26, 19, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
        .modal { background: #fdfaf3; border-radius: 8px; max-width: 720px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .modal-header { padding: 20px 28px; border-bottom: 1px solid #e8dcc7; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .modal-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8b6f4e; margin-bottom: 4px; }
        .modal-source { font-family: 'Fraunces', serif; font-size: 15px; color: #1f1a13; font-weight: 600; line-height: 1.3; }
        .modal-close { background: none; border: none; color: #8b6f4e; cursor: pointer; padding: 4px; }
        .modal-close:hover { color: #1f1a13; }
        .modal-body { padding: 24px 28px; overflow-y: auto; flex: 1; }
        .question-text { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #1f1a13; line-height: 1.4; margin-bottom: 20px; }
        .answer-input { width: 100%; min-height: 140px; background: white; border: 1px solid #d9c9ab; border-radius: 4px; padding: 14px 16px; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; color: #2a241c; resize: vertical; }
        .answer-input:focus { outline: none; border-color: #b8860b; }
        .answer-input:disabled { background: #f5efe6; color: #5a4d3a; }
        .submit-btn { margin-top: 16px; padding: 10px 20px; background: #1f1a13; color: white; border: none; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
        .submit-btn:hover:not(:disabled) { background: #3a3226; }
        .submit-btn:disabled { background: #c9b89d; cursor: not-allowed; }
        .model-answer { margin-top: 20px; background: #f0e8d6; border-left: 3px solid #6b8e23; padding: 16px 20px; border-radius: 0 4px 4px 0; }
        .model-answer-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b8e23; margin-bottom: 8px; font-weight: 600; }
        .model-answer-text { font-family: 'Fraunces', serif; font-size: 15px; line-height: 1.6; color: #2a241c; }
        .look-for { margin-top: 12px; padding: 12px 16px; background: #f5efe6; border-radius: 4px; }
        .look-for-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8b6f4e; margin-bottom: 6px; font-weight: 600; }
        .look-for-text { font-family: 'Fraunces', serif; font-style: italic; font-size: 13px; line-height: 1.5; color: #5a4d3a; }
        .rate-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e8dcc7; }
        .rate-label { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: #5a4d3a; margin-bottom: 10px; }
        .rate-buttons { display: flex; gap: 8px; }
        .rate-btn { padding: 8px 16px; border: 1.5px solid #d9c9ab; background: white; color: #5a4d3a; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; flex: 1; }
        .rate-btn:hover { border-color: #b8860b; }
        .rate-btn.miss.active { background: #d97757; color: white; border-color: #d97757; }
        .rate-btn.partial.active { background: #d4a017; color: white; border-color: #d4a017; }
        .rate-btn.full.active { background: #6b8e23; color: white; border-color: #6b8e23; }
        .modal-footer { padding: 16px 28px; border-top: 1px solid #e8dcc7; display: flex; justify-content: space-between; gap: 12px; }
        .nav-btn { padding: 8px 16px; background: white; color: #5a4d3a; border: 1px solid #d9c9ab; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; }
        .nav-btn:hover:not(:disabled) { border-color: #b8860b; color: #1f1a13; }
        .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .complete-btn { padding: 8px 16px; background: #c9b89d; color: white; border: none; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: not-allowed; }
        .complete-btn.ready { background: #6b8e23; cursor: pointer; }
        .complete-btn.ready:hover { background: #5a7a1d; }

        /* BANK VIEW */
        .bank-view { background: #fdfaf3; border-radius: 6px; padding: 28px; }
        .bank-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e8dcc7; }
        .bank-title { font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700; color: #1f1a13; margin: 0; }
        .bank-stats { display: flex; gap: 12px; margin-bottom: 24px; }
        .bank-stat { padding: 12px 16px; border-radius: 4px; font-family: 'Inter', sans-serif; font-size: 13px; color: #5a4d3a; flex: 1; }
        .bank-stat.full { background: #e8e9d5; color: #5a7a1d; }
        .bank-stat.partial { background: #f5e6c8; color: #8b6f0a; }
        .bank-stat.miss { background: #f5d9cf; color: #a0522d; }
        .bank-stat strong { display: block; font-family: 'Fraunces', serif; font-size: 24px; font-weight: 700; margin-bottom: 2px; }
        .bank-empty { padding: 40px; text-align: center; font-family: 'Fraunces', serif; font-style: italic; color: #8b6f4e; }
        .bank-week { margin-bottom: 28px; }
        .bank-week-title { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #8b6f4e; margin-bottom: 12px; }
        .bank-question { padding: 16px; background: #f5efe6; border-radius: 4px; margin-bottom: 10px; border-left: 3px solid #c9b89d; }
        .bank-question.rating-full { border-left-color: #6b8e23; }
        .bank-question.rating-partial { border-left-color: #d4a017; }
        .bank-question.rating-miss { border-left-color: #d97757; }
        .bank-q-text { font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; color: #1f1a13; margin-bottom: 10px; line-height: 1.4; }
        .bank-a-row { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; line-height: 1.5; }
        .bank-a-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #8b6f4e; padding-top: 2px; flex-shrink: 0; }
        .bank-a-text { color: #4a3f2f; font-family: 'Inter', sans-serif; flex: 1; }
        .bank-details { margin-top: 10px; }
        .bank-details summary { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8b6f4e; cursor: pointer; padding: 4px 0; }
        .bank-model-answer { margin-top: 8px; padding: 12px; background: #f0e8d6; border-radius: 4px; font-family: 'Fraunces', serif; font-size: 14px; line-height: 1.5; color: #2a241c; }

        @media (max-width: 640px) {
          .title { font-size: 36px; }
          .week-theme { font-size: 18px; }
          .meta-bar { gap: 20px; }
          .modal { max-height: 100vh; border-radius: 0; }
          .question-text { font-size: 17px; }
        }
      `}</style>

      <div className="curriculum">
        <div className="container">
          <div className="header">
            <div className="eyebrow">A Custom Curriculum · 24 May → 1 July 2026</div>
            <h1 className="title">From PM to AI Builder</h1>
            <p className="subtitle">Fundamentals first. Active recall built in. One project that evolves.</p>

            <div className="meta-bar">
              <div className="meta-item">
                <span className="meta-label">Progress</span>
                <span className="meta-value">{totalDone} / {totalItems}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Questions Answered</span>
                <span className="meta-value">{Object.keys(answers).filter(qid => answers[qid]?.selfRating).length}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Completion</span>
                <span className="meta-value">{overallPct}%</span>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${overallPct}%` }} />
            </div>

            <div className="nav-tabs">
              <button
                className={`nav-tab ${view === 'curriculum' ? 'active' : ''}`}
                onClick={() => setView('curriculum')}
              >
                <FileText size={14} /> Curriculum
              </button>
              <button
                className={`nav-tab ${view === 'bank' ? 'active' : ''}`}
                onClick={() => setView('bank')}
              >
                <Archive size={14} /> Question Bank
              </button>
            </div>
          </div>

          {view === 'bank' && <QuestionBank answers={answers} onClose={() => setView('curriculum')} />}

          {view === 'curriculum' && (
            <>
              <div className="principles">
                <div className="principles-title">Operating principles</div>
                <ul>
                  <li>Every fundamental has questions you must answer before marking it complete. Active recall beats passive reading.</li>
                  <li>At the start of each week, take the spaced recall test on past material. Forgetting is the enemy; retrieval is the cure.</li>
                  <li>One main project that evolves over 4 weeks beats three shallow demos. Depth proves you can build.</li>
                  <li>Sunday is sacred. Public post every Sunday. Public commitment beats private intention.</li>
                  <li>Karpathy, 3Blue1Brown, Hamel, Anthropic docs are your textbooks. The handbook is reference.</li>
                </ul>
              </div>

              {CURRICULUM.map(week => {
                const stats = weekStats(week);
                const isExpanded = expanded[week.week];
                const isDone = stats.done === stats.total && stats.total > 0;
                const showTestTrigger = week.week > 1;

                return (
                  <div className="week" key={week.week}>
                    <div className="week-header" onClick={() => toggleWeek(week.week)}>
                      <div className="week-header-left">
                        {isExpanded ? <ChevronDown size={20} color="#8b6f4e" /> : <ChevronRight size={20} color="#8b6f4e" />}
                        <div className="week-info">
                          <div className="week-number">Week {week.week}</div>
                          <div className="week-theme">{week.theme}</div>
                          <div className="week-dates">{week.dates}</div>
                        </div>
                      </div>
                      <div className={`week-stats ${isDone ? 'done' : ''}`}>
                        {stats.done}/{stats.total}
                      </div>
                    </div>

                    {isExpanded && showTestTrigger && (
                      <div className="test-trigger">
                        <span>📝 Start of Week {week.week} — take the spaced recall test on past material</span>
                        <button className="test-trigger-btn" onClick={() => setTestWeek(week.week)}>
                          Start Test
                        </button>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="week-body">
                        <div className="week-why">{week.why}</div>

                        {week.sections.map((section, idx) => {
                          const config = TYPE_CONFIG[section.type];
                          const Icon = config.icon;

                          return (
                            <div className="section" key={idx}>
                              <div className="section-header">
                                <Icon className={`section-icon ${config.color}`} />
                                <span className="section-title">{section.title}</span>
                                <span className="section-budget">{section.budget}</span>
                              </div>
                              {section.items.map(item => {
                                const hasQuestions = QUESTIONS[item.id];
                                const numQs = hasQuestions ? QUESTIONS[item.id].length : 0;
                                const numAnswered = hasQuestions ? QUESTIONS[item.id].filter(q => answers[q.qid]?.selfRating).length : 0;
                                const allAnswered = hasQuestions && numAnswered === numQs;

                                return (
                                  <div
                                    key={item.id}
                                    className={`item ${completed[item.id] ? 'checked' : ''}`}
                                  >
                                    <div className="item-check" onClick={() => toggle(item.id)}>
                                      {completed[item.id] && <Check size={12} color="white" strokeWidth={3} />}
                                    </div>
                                    <div className="item-text-wrap" onClick={() => toggle(item.id)}>
                                      <div className="item-text">{item.text}</div>
                                    </div>
                                    {item.url && (
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="item-link"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span>open</span>
                                        <ExternalLink size={12} />
                                      </a>
                                    )}
                                    {hasQuestions && (
                                      <button
                                        className={`item-questions ${allAnswered ? 'answered' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setActiveQuestion(item.id); }}
                                      >
                                        <HelpCircle size={12} />
                                        {numAnswered}/{numQs}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}

                        <div className="notes-area">
                          <div className="notes-label">Week {week.week} reflections</div>
                          <textarea
                            className="notes-input"
                            placeholder="What did you learn? What surprised you? What would you do differently?"
                            value={notes[week.week] || ''}
                            onChange={(e) => updateNote(week.week, e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="footer">
                Your progress saves automatically. Questions and tests live in the Question Bank tab.
              </div>
            </>
          )}
        </div>

        {activeQuestion && (
          <QuestionModal
            itemId={activeQuestion}
            item={findItem(activeQuestion)}
            answers={answers}
            setAnswers={updateAnswers}
            completed={completed}
            toggle={(id) => {
              const next = { ...completed, [id]: !completed[id] };
              setCompleted(next);
              save(STORAGE_KEY, next);
            }}
            onClose={() => setActiveQuestion(null)}
          />
        )}

        {testWeek !== null && (
          <WeeklyTest
            weekNum={testWeek}
            answers={answers}
            tests={tests}
            setTests={updateTests}
            onClose={() => setTestWeek(null)}
          />
        )}
      </div>
    </>
  );
}
