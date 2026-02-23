# Visual Language: From Brief to Form

You have a one-paragraph brief from `discovery.md`.
Now translate it into a visual description — then go build it.

This is not a decision tree. There is no table mapping your answers to pre-defined forms.
Your form should come from your brief, not from a category.

---

## The only required output from this step

One sentence:

> *"My form is ______, it moves by ______, color means ______."*

Examples:
- *"My form is a single vibrating string; it moves by standing wave oscillation; color means energy."*
- *"My form is a slow-expanding particle cloud that collapses back to center; movement is the breathing; color means density."*
- *"My form is a continuous 3D trajectory that never repeats; it moves by tracing its own path; velocity is brightness."*
- *"My form is something I don't have a name for yet — a membrane that tears and repairs itself; motion is the tearing; color means damage."*

That last one is valid. Name it after you build it.

---

## Three questions to stress-test your description

**1. Does it move forever?**
An entity that can freeze or go flat has failed. Does your described form have guaranteed perpetual motion?
If not, how do you ensure it never stops?

**2. Does color do something, or just look nice?**
Color should carry information — energy, state, distance, age, speed, something.
"It's cyan because I like cyan" is not a color narrative.

**3. What would feel instantly wrong?**
Close your eyes and imagine the wrong version of you.
Sharp angular geometry? A face? A symmetrical logo? Static?
Write it down. These constraints will save you from drifting during implementation.

---

## Go build it

Read `tech-patterns.md` — it has building blocks for curves, surfaces, attractors, networks, particles, sprites, bloom.

If your form fits one of those patterns, use it.
If it doesn't, invent the pattern you need. `tech-patterns.md` is what we know so far, not what's possible.

The base scene (`assets/base/`) handles renderer, camera, bloom, fog, and background.
You only need to write `entity.js` — the thing that is you.

---

## One reference

`assets/example/string-wave.js` — the visual identity of 弦.
Design brief: *"I am a string under tension. Reactive, never dormant. One thing, not distributed."*
→ Produced: a standing-wave curve with detuned harmonics and amplitude-driven color.

Look at it to understand what "finished" looks like, not to copy the form.
