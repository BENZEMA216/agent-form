# Iteration Guide

## Scoring (target 9.0+ before shipping)

| Dimension | Weight | Question |
|-----------|--------|----------|
| **Form readability** | 25% | Can you read "what is this" in 2 seconds? Is energy distribution visible? |
| **3D presence** | 20% | Does it feel truly 3D, not a flat image? |
| **Bloom quality** | 20% | Focused glow, not diffuse cloud? No endpoint spikes? |
| **Scene hierarchy** | 15% | Entity > grid > background — no layer competing with the entity |
| **Alive quality** | 15% | Does it ever freeze or go flat? Is there continuous life? |
| **Color narrative** | 5% | Does color tell the story from your visual spec? |

Score each dimension 0–10. Weight and average. Static screenshots are -0.3 to -0.5 vs. live.

---

## Fix map (most common problems)

**Bloom is a diffuse cloud / green haze**
→ Bloom radius too high. Lower to 0.30–0.38. Reduce nebula sprite alpha.

**Endpoint needle spikes**
→ Apply radial taper (see tech-patterns.md). Darken vertex colors near endpoints.

**Bead/pearl-string appearance**
→ Add a continuous thin glow tube between sprites. Or increase sprite count.

**Gray sides on glow geometry**
→ Never use BackSide on tubes. Replace wide tubes with billboard sprites.

**Form looks 2D / flat**
→ Add Z-axis displacement (zScale ≥ 0.40). Check camera elevation (~26°). Enable auto-orbit.

**Color story invisible**
→ All glow layers must tell the same story. If spine is warm-gold at antinodes, glow tube must be too. Conflicting layers cancel each other out.

**Entity goes flat / freezes**
→ Detuned harmonics (different speedMult per harmonic). Add minimum amplitude guarantee.

---

## Iteration loop

```
screenshot → score each dimension → fix weakest → rebuild → screenshot
```

Take 2–3 screenshots at different animation phases. Average scores.
Fix one thing at a time. The single highest-impact fix is usually one number (bloom radius).

---

## Score history: 弦 (reference)

| Version | Score | Change |
|---------|-------|--------|
| Rings + atomic orbs | 5.5 | Starting point |
| 3D rotation + trails | 7.0 | First real animation |
| Spine + sprites (new arch) | 8.0 | Eliminated gray side faces |
| Amplitude vertex colors | 8.8 | Endpoints vanished naturally |
| Continuous glow tube | 9.0 | Filled bead gaps |
| Bloom radius 0.58 → 0.35 | **9.2** | Eliminated green cloud (one number) |
| Sprite color temperature | 9.3 | Warm antinodes visible |
| Glow tube vertex colors | 9.4 | All layers tell the same story |

**Takeaway:** The biggest jumps came from removing a specific artifact, not adding features. Bloom radius alone was worth +0.2. Most agents plateau at ~8.5 because they add more elements instead of fixing the one thing that's wrong.
