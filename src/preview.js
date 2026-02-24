// preview.js — Canvas 2D mini-animations for gallery cards
// Each pattern gets its own draw function. All use Canvas 2D (no WebGL).

const HARMONICS = [
  { amp: 1.00, k: 1, omega: 1.000 },
  { amp: 0.50, k: 2, omega: 2.021 },
  { amp: 0.28, k: 3, omega: 3.055 },
  { amp: 0.14, k: 4, omega: 4.102 },
]

export function startPreview(canvas, patterns) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  const primary = patterns && patterns[0]
  let drawFn
  if (primary === 'standing-wave')      drawFn = drawStandingWave
  else if (primary === 'particle-cloud') drawFn = drawParticleCloud
  else if (primary === 'attractor-trajectory') drawFn = drawAttractor
  else if (primary === 'node-network')  drawFn = drawNodeNetwork
  else                                   drawFn = drawContinuousCurve

  let t = 0
  let rafId
  let running = true

  function frame() {
    if (!running) return
    ctx.clearRect(0, 0, W, H)
    drawFn(ctx, W, H, t)
    t += 0.016
    rafId = requestAnimationFrame(frame)
  }

  frame()
  return () => { running = false; cancelAnimationFrame(rafId) }
}

// ── Standing Wave (弦) ────────────────────────────────────────────────────

function drawStandingWave(ctx, W, H, t) {
  const cy = H / 2
  const L = W * 0.88
  const x0 = (W - L) / 2
  const N = 180

  const pts = []
  for (let i = 0; i <= N; i++) {
    const nx = i / N
    const taper = Math.pow(Math.sin(nx * Math.PI), 0.7)
    let y = 0
    HARMONICS.forEach(h => {
      y += h.amp * Math.sin(h.k * Math.PI * nx * 2) * Math.cos(h.omega * t) * taper
    })
    pts.push({ x: x0 + nx * L, y: cy + y * H * 0.30 })
  }

  // Glow layers
  const glows = [
    { w: 16, a: 0.04 },
    { w: 9,  a: 0.08 },
    { w: 5,  a: 0.13 },
    { w: 2.5,a: 0.22 },
  ]
  glows.forEach(g => {
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    pts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = `rgba(34,211,238,${g.a})`
    ctx.lineWidth = g.w
    ctx.lineJoin = 'round'
    ctx.stroke()
  })

  // Spine — vertex color
  for (let i = 1; i < pts.length; i++) {
    const normAmp = Math.abs(pts[i].y - cy) / (H * 0.30)
    const hue = 228 - normAmp * 183
    ctx.beginPath()
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
    ctx.lineTo(pts[i].x, pts[i].y)
    ctx.strokeStyle = `hsl(${hue},88%,66%)`
    ctx.lineWidth = 1.6
    ctx.stroke()
  }
}

// ── Particle Cloud ────────────────────────────────────────────────────────

function drawParticleCloud(ctx, W, H, t) {
  const N = 55
  // Simulate "result found" signal at irregular intervals
  const signalPhase = (Math.sin(t * 0.4) + 1) / 2  // 0..1
  const signalOn = signalPhase > 0.7

  for (let i = 0; i < N; i++) {
    const s = i * 2.399   // golden angle offset
    let px, py

    if (signalOn && i < 12) {
      // Cluster toward center
      const cx = W * 0.5 + Math.cos(s) * W * 0.12
      const cy = H * 0.5 + Math.sin(s) * H * 0.12
      const lerpT = (signalPhase - 0.7) / 0.3
      const ox = (Math.sin(s * 7.3 + t * 0.08) * 0.5 + 0.5) * W
      const oy = (Math.cos(s * 5.1 + t * 0.07) * 0.5 + 0.5) * H
      px = ox + (cx - ox) * lerpT
      py = oy + (cy - oy) * lerpT
    } else {
      px = (Math.sin(s * 7.3 + t * 0.08) * 0.5 + 0.5) * W
      py = (Math.cos(s * 5.1 + t * 0.07) * 0.5 + 0.5) * H
    }

    const phase = (Math.sin(s * 3.7 + t * 0.5) + 1) / 2
    const bright = signalOn && i < 12
      ? 0.55 + phase * 0.45
      : 0.08 + phase * 0.18
    const r = signalOn && i < 12 ? 2.5 + phase * 2 : 1.2 + phase
    const hue = signalOn && i < 12 ? 40 + phase * 20 : 185

    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue},80%,65%,${bright})`
    ctx.fill()
  }
}

// ── Strange Attractor (Thomas) ────────────────────────────────────────────

function drawAttractor(ctx, W, H, t) {
  const b = 0.208
  const dt = 0.06
  // Starting point drifts over time for endless variation
  let x = Math.sin(t * 0.07) * 0.5
  let y = Math.cos(t * 0.05) * 0.3
  let z = 0.1

  // Warm up
  for (let i = 0; i < 400; i++) {
    const dx = Math.sin(y) - b * x
    const dy = Math.sin(z) - b * y
    const dz = Math.sin(x) - b * z
    x += dx * dt; y += dy * dt; z += dz * dt
  }

  // Collect trace
  const trace = []
  for (let i = 0; i < 280; i++) {
    const dx = Math.sin(y) - b * x
    const dy = Math.sin(z) - b * y
    const dz = Math.sin(x) - b * z
    x += dx * dt; y += dy * dt; z += dz * dt

    trace.push({
      x: (x / 4.2 + 0.5) * W,
      y: (y / 4.2 + 0.5) * H,
    })
  }

  // Fading trail
  for (let i = 1; i < trace.length; i++) {
    const alpha = (i / trace.length) * 0.55
    const hue = 185 + (i / trace.length) * 55  // cyan → amber
    ctx.beginPath()
    ctx.moveTo(trace[i - 1].x, trace[i - 1].y)
    ctx.lineTo(trace[i].x, trace[i].y)
    ctx.strokeStyle = `hsla(${hue},80%,65%,${alpha})`
    ctx.lineWidth = 0.9
    ctx.stroke()
  }

  // Leading point glow
  const lp = trace[trace.length - 1]
  ctx.beginPath()
  ctx.arc(lp.x, lp.y, 6, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(251,191,36,0.15)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(lp.x, lp.y, 2.5, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(251,191,36,0.95)'
  ctx.fill()
}

// ── Node Network / Chain Trace ─────────────────────────────────────────────

function drawNodeNetwork(ctx, W, H, t) {
  const N = 7
  const nodes = Array.from({ length: N }, (_, i) => {
    const p = i / (N - 1)
    return {
      x: W * 0.08 + p * W * 0.84 + Math.sin(p * Math.PI * 1.7 + 1.2) * W * 0.04,
      y: H * 0.5  + Math.sin(p * Math.PI + 0.3) * H * 0.28,
    }
  })

  const activeIdx = Math.floor(t * 0.8) % N
  const pulse = 0.5 + 0.5 * Math.sin(t * 7)

  // Connections
  for (let i = 0; i < N - 1; i++) {
    const past = i < activeIdx
    ctx.beginPath()
    ctx.moveTo(nodes[i].x, nodes[i].y)
    ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y)
    ctx.strokeStyle = past
      ? 'rgba(34,211,238,0.22)'
      : 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Nodes
  nodes.forEach((n, i) => {
    const isActive = i === activeIdx
    const isPast   = i < activeIdx

    if (isActive) {
      ctx.beginPath()
      ctx.arc(n.x, n.y, 13 + pulse * 5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(251,191,36,0.10)'
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(n.x, n.y, isActive ? 4.5 : isPast ? 3 : 2, 0, Math.PI * 2)
    ctx.fillStyle = isActive
      ? `rgba(251,191,36,${0.7 + pulse * 0.3})`
      : isPast
        ? 'rgba(34,211,238,0.55)'
        : 'rgba(255,255,255,0.12)'
    ctx.fill()
  })
}

// ── Generic Continuous Curve ──────────────────────────────────────────────

function drawContinuousCurve(ctx, W, H, t) {
  const N = 120
  ctx.beginPath()
  for (let i = 0; i <= N; i++) {
    const nx = i / N
    const x = nx * W
    const y = H / 2
      + Math.sin(nx * Math.PI * 2.5 + t) * H * 0.22
      + Math.sin(nx * Math.PI * 5.1 + t * 1.4) * H * 0.08

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = 'rgba(34,211,238,0.55)'
  ctx.lineWidth = 1.5
  ctx.lineJoin = 'round'
  ctx.stroke()
}
