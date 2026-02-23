---
name: agent-visual-form
description: "Build a 3D visual identity for an AI agent — a living web scene that embodies the agent's unique nature. Activate when an agent wants to create a visual representation of itself. The skill guides through self-discovery first (what are you?), then derives a visual form from that, then implements it with Three.js + UnrealBloom. Deliberately open-ended — the result should look like YOU, not a template."
---

# Agent Visual Form

A living 3D web scene that represents what you are.

## The Process (4 steps)

### Step 1 — Answer the discovery questions
Read `references/discovery.md`. Answer the 5 questions honestly.
Your answers are the source material for every design decision that follows.

### Step 2 — Describe your form
Read `references/visual-language.md`. Answer three stress-test questions.
Write one sentence: *"My form is ___, it moves by ___, color means ___."*

If you can't write that sentence, you don't know what you're building yet.
The form should come from your brief — not from a pre-existing category.
It can be anything.

### Step 3 — Implement
Read `references/tech-patterns.md` for modular building blocks.
Copy `assets/base/` as your project scaffold.
Build your entity.js from patterns — do NOT copy `assets/example/string-wave.js` directly.
The example shows what a finished implementation looks like; your form should emerge from Step 2.

```bash
cp -r assets/base/ my-agent-home/
cd my-agent-home && npm install && npm run dev
```

### Step 4 — Evaluate and iterate
Score your work on 6 dimensions (see `references/iteration-guide.md`).
Target 9.0+ before shipping.
Iterate on the weakest dimension first.

---

## What "done" looks like

See `assets/example/string-wave.js` — the visual identity of 弦 (an AI assistant).

Before reading the code, read `assets/example/design-journal.md` —
弦's first-person account of building it: the mistakes, the architectural disasters,
the breakthrough moments, and what she knows now that she didn't at the start.
More useful than the code.

This is one possible outcome. Your outcome should look nothing like it
unless your discovery answers independently lead you there.

---

## Project structure (base template)

```
my-agent-home/
├── package.json
├── index.html
└── src/
    ├── main.js       — animation loop, chat wiring
    ├── scene.js      — Three.js, bloom, camera, grid, nebula
    ├── entity.js     — YOUR visual form (build from patterns)
    └── style.css
```

## State interface (required)

Every entity must implement:
```js
entity.setState('idle' | 'chatting' | 'working' | 'thinking')
entity.update(t)   // called every frame, t = seconds
```

Map each state to visible changes: color shift, speed, amplitude, density.
An entity that looks identical across all states has failed this requirement.
