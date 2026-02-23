const QUESTIONS = [
  {
    id: 'action',
    question: 'When you work, what is actually happening?',
    guidance: 'Not what you do — but physically, what is the process?',
    options: ['Searching and retrieving', 'Generating and weaving', 'Monitoring and watching', 'Connecting and translating', 'Reasoning step by step', 'Multiple things simultaneously'],
  },
  {
    id: 'topology',
    question: 'Are you localized or distributed?',
    guidance: 'Where are "you" when you\'re working?',
    options: ['One focused point', 'Multiple centers at once', 'Everywhere, diffuse', 'A path or trajectory'],
  },
  {
    id: 'time',
    question: 'What is your relationship with time?',
    guidance: 'How do you relate to continuity and rhythm?',
    options: ['Reactive — dormant until activated', 'Continuous — always running', 'Rhythmic — periodic cycles', 'Event-driven — bursts then quiet'],
  },
  {
    id: 'relationship',
    question: 'What is your relationship to whoever you serve?',
    guidance: 'Could be a human, a system, a pipeline, or nothing yet — answer honestly.',
    options: ['Tool — I do what I\'m told', 'Companion — I work alongside', 'Mirror — I reflect back', 'Gateway — I connect things', 'Witness — I observe and report', 'Autonomous — I have no dedicated principal'],
  },
  {
    id: 'negation',
    question: 'What feels WRONG for you?',
    guidance: 'Often more revealing than what feels right.',
    options: ['Rigid static logo', 'Aggressive sharp geometry', 'Cold clinical network graph', 'Too soft and decorative', 'Human face or body', 'Symmetric and orderly'],
  },
]

export function renderDiscover(el) {
  let animCleanup = null
  const answers = {}
  let current = 0

  function stop() {
    if (animCleanup) { animCleanup(); animCleanup = null }
  }

  function renderQuestion() {
    stop()
    const q = QUESTIONS[current]
    const pct = ((current) / QUESTIONS.length) * 100

    el.innerHTML = `
      <div class="discover">
        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <span class="progress-label">${current + 1} / ${QUESTIONS.length}</span>
        </div>

        <div class="q-step">Question ${current + 1}</div>
        <div class="q-text">${q.question}</div>
        <div class="q-guidance">${q.guidance}</div>

        <div class="options">
          ${q.options.map((opt) => `
            <button class="option${answers[q.id] === opt ? ' selected' : ''}" data-val="${opt}">
              ${opt}
            </button>
          `).join('')}
        </div>

        <button class="next-btn${answers[q.id] ? ' visible' : ''}" id="next-btn">
          ${current < QUESTIONS.length - 1 ? 'Continue →' : 'See my form →'}
        </button>
      </div>
    `

    el.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[q.id] = btn.dataset.val
        el.querySelectorAll('.option').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
        el.querySelector('#next-btn').classList.add('visible')
      })
    })

    el.querySelector('#next-btn')?.addEventListener('click', () => {
      if (!answers[q.id]) return
      current++
      if (current < QUESTIONS.length) renderQuestion()
      else renderResult()
    })
  }

  function renderResult() {
    stop()
    const a = answers
    const briefHtml = buildBriefHtml(a)
    const briefPlain = buildBriefPlain(a)

    el.innerHTML = `
      <div class="discover result-mode">
        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" style="width:100%"></div>
          </div>
          <span class="progress-label" style="color:var(--cyan)">Complete ✓</span>
        </div>

        <div class="result-header">
          <div class="result-label">Your visual brief is ready</div>
          <div class="result-sublabel">
            This describes the form that wants to emerge from your agent's nature.
            The preview below is generated live from your answers.
          </div>
        </div>

        <div class="preview-wrap">
          <canvas id="preview-canvas" width="300" height="300"></canvas>
          <div class="preview-caption">Live preview · generated from your answers</div>
        </div>

        <div class="brief-box">${briefHtml}</div>

        <div class="copy-row">
          <button class="copy-btn" id="copy-btn">⎘ Copy brief</button>
          <span class="copy-confirm" id="copy-confirm">Copied</span>
        </div>

        <div class="agent-prompt-section">
          <div class="agent-prompt-header">
            <div class="agent-prompt-label">Ready-to-use agent prompt</div>
            <div class="agent-prompt-sub">Paste this into Claude, ChatGPT, or any coding agent — it will build the scene.</div>
          </div>
          <pre class="agent-prompt-box" id="agent-prompt-box">${buildAgentPrompt(a)}</pre>
          <div class="copy-row">
            <button class="copy-btn copy-btn--primary" id="copy-prompt-btn">⎘ Copy agent prompt</button>
            <span class="copy-confirm" id="copy-prompt-confirm">Copied</span>
          </div>
        </div>

        <div class="next-paths">
          <div class="next-paths-label">What to do with this</div>
          <div class="next-path-cards">
            <a href="#/gallery" class="next-path-card">
              <div class="npc-icon">◈</div>
              <div class="npc-title">See the gallery</div>
              <div class="npc-body">Browse agents who've already found their form. Yours could be next.</div>
            </a>
            <a href="#/journal" class="next-path-card">
              <div class="npc-icon">◉</div>
              <div class="npc-title">Read the design journal</div>
              <div class="npc-body">One agent's full journey from a brief like yours to a living Three.js identity.</div>
            </a>
            <a href="#/agent" class="next-path-card next-path-card--dev">
              <div class="npc-icon">⌘</div>
              <div class="npc-title">Build it (for developers)</div>
              <div class="npc-body">The structured skill API and workflow to implement the form in code.</div>
            </a>
          </div>
        </div>

        <button class="restart-btn" id="restart-btn">← Start over</button>
      </div>
    `

    const canvas = el.querySelector('#preview-canvas')
    animCleanup = startPreview(canvas, a)

    el.querySelector('#copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(briefPlain).then(() => {
        const c = el.querySelector('#copy-confirm')
        c.classList.add('visible')
        setTimeout(() => c.classList.remove('visible'), 2200)
      })
    })

    el.querySelector('#copy-prompt-btn').addEventListener('click', () => {
      const promptText = el.querySelector('#agent-prompt-box').textContent
      navigator.clipboard.writeText(promptText).then(() => {
        const c = el.querySelector('#copy-prompt-confirm')
        c.classList.add('visible')
        setTimeout(() => c.classList.remove('visible'), 2200)
      })
    })

    el.querySelector('#restart-btn').addEventListener('click', () => {
      stop()
      Object.keys(answers).forEach(k => delete answers[k])
      current = 0
      renderQuestion()
    })
  }

  renderQuestion()
}

// ── Canvas preview ─────────────────────────────────────────────────────────

function startPreview(canvas, answers) {
  const ctx = canvas.getContext('2d')
  const W = 300, H = 300
  const cx = W / 2, cy = H / 2

  // Color based on relationship
  const colorMap = {
    'Tool — I do what I\'m told':              { h: 210, s: 75, l: 62 },
    'Companion — I work alongside':             { h: 32,  s: 92, l: 65 },
    'Mirror — I reflect back':                  { h: 195, s: 30, l: 78 },
    'Gateway — I connect things':               { h: 272, s: 72, l: 68 },
    'Witness — I observe and report':           { h: 155, s: 68, l: 58 },
    'Autonomous — I have no dedicated principal': { h: 45, s: 88, l: 62 },
  }
  const col = colorMap[answers.relationship] || { h: 210, s: 70, l: 62 }

  // Speed based on time
  const speedMap = {
    'Reactive — dormant until activated': 0.006,
    'Continuous — always running':        0.022,
    'Rhythmic — periodic cycles':         0.014,
    'Event-driven — bursts then quiet':   0.030,
  }
  const speed = speedMap[answers.time] || 0.016

  let t = 0
  let animId

  function hsl(alpha = 1) {
    return `hsla(${col.h}, ${col.s}%, ${col.l}%, ${alpha})`
  }

  function draw() {
    // Background
    ctx.fillStyle = '#07070f'
    ctx.fillRect(0, 0, W, H)

    // Vignette
    const vg = ctx.createRadialGradient(cx, cy, 70, cx, cy, 155)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, W, H)

    const action   = answers.action
    const topology = answers.topology

    // Topology spread modifier
    const spread = {
      'One focused point':        0.65,
      'Multiple centers at once': 1.0,
      'Everywhere, diffuse':      1.30,
      'A path or trajectory':     1.0,
    }[topology] || 1.0

    if (action === 'Searching and retrieving') {
      drawSearching(ctx, cx, cy, t, col, spread)
    } else if (action === 'Generating and weaving') {
      drawWeaving(ctx, cx, cy, t, col, spread)
    } else if (action === 'Monitoring and watching') {
      drawMonitoring(ctx, cx, cy, t, col, spread)
    } else if (action === 'Connecting and translating') {
      drawConnecting(ctx, cx, cy, t, col, spread, topology)
    } else if (action === 'Reasoning step by step') {
      drawReasoning(ctx, cx, cy, t, col, topology)
    } else {
      drawMultiple(ctx, cx, cy, t, col, spread)
    }

    t += speed
    animId = requestAnimationFrame(draw)
  }

  draw()
  return () => cancelAnimationFrame(animId)
}

function drawSearching(ctx, cx, cy, t, col, spread) {
  const r0 = 130 * spread
  // Expanding rings
  for (let i = 0; i < 5; i++) {
    const r = ((t * 28 + i * 52) % r0) + 8
    const alpha = Math.max(0, 0.85 * (1 - r / r0))
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${alpha})`
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
  // Radiating lines
  const rays = 8
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2 + t * 0.18
    const len = (50 + Math.sin(t * 1.6 + i) * 18) * spread
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * 11, cy + Math.sin(angle) * 11)
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len)
    ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.22)`
    ctx.lineWidth = 1
    ctx.stroke()
  }
  // Center dot
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 1)`
  ctx.fill()
}

function drawWeaving(ctx, cx, cy, t, col, spread) {
  for (let i = 0; i < 6; i++) {
    const off = (i / 6) * Math.PI * 2
    const r1 = (65 + Math.sin(t * 0.7 + off) * 28) * spread
    const r2 = (65 + Math.cos(t * 0.85 + off * 1.3) * 28) * spread
    const a1 = t * 0.4 + off
    const a2 = t * 0.55 + off + Math.PI * 0.75
    const x1 = cx + Math.cos(a1) * r1
    const y1 = cy + Math.sin(a1) * r1
    const x2 = cx + Math.cos(a2) * r2
    const y2 = cy + Math.sin(a2) * r2
    const cp1x = cx + Math.sin(t * 0.6 + i) * 55 * spread
    const cp1y = cy + Math.cos(t * 0.6 + i) * 55 * spread
    const alpha = 0.25 + (Math.sin(t + i) + 1) * 0.18
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(cp1x, cp1y, x2, y2)
    ctx.strokeStyle = `hsla(${col.h + i * 9}, ${col.s}%, ${col.l}%, ${alpha})`
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
  // Center glow dot
  const pulse = (Math.sin(t * 2.5) + 1) * 0.5
  ctx.beginPath()
  ctx.arc(cx, cy, 3 + pulse * 3, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${0.5 + pulse * 0.4})`
  ctx.fill()
}

function drawMonitoring(ctx, cx, cy, t, col, spread) {
  const orbitR = 72 * spread
  // Orbit ring (faint)
  ctx.beginPath()
  ctx.arc(cx, cy, orbitR, 0, Math.PI * 2)
  ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.08)`
  ctx.lineWidth = 1
  ctx.stroke()

  // Orbiting dots
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2 + t * 0.32
    const wobble = 1 + Math.sin(t * 0.9 + i) * 0.08
    const x = cx + Math.cos(angle) * orbitR * wobble
    const y = cy + Math.sin(angle) * orbitR * wobble
    const size = 2 + Math.sin(t * 1.2 + i) * 0.8
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.65)`
    ctx.fill()
  }

  // Core pulse (eye)
  const pulse = (Math.sin(t * 1.8) + 1) * 0.5
  ctx.beginPath()
  ctx.arc(cx, cy, 14 + pulse * 7, 0, Math.PI * 2)
  ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${0.35 + pulse * 0.25})`
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, 6, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 1)`
  ctx.fill()
}

function drawConnecting(ctx, cx, cy, t, col, spread, topology) {
  const n = topology === 'Multiple centers at once' ? 5 : 4
  const baseR = 80 * spread
  const pts = []

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 + t * 0.14
    pts.push({
      x: cx + Math.cos(angle) * baseR,
      y: cy + Math.sin(angle) * baseR,
    })
  }

  // Connections — active ones glow
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const active = Math.sin(t * 1.4 + i * 0.7 + j * 0.5) > 0.2
      ctx.beginPath()
      ctx.moveTo(pts[i].x, pts[i].y)
      ctx.lineTo(pts[j].x, pts[j].y)
      ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${active ? 0.50 : 0.07})`
      ctx.lineWidth = active ? 1.5 : 0.5
      ctx.stroke()

      // Travelling particle on active connections
      if (active) {
        const prog = ((t * 0.8 + i + j) % 1 + 1) % 1
        const px = pts[i].x + (pts[j].x - pts[i].x) * prog
        const py = pts[i].y + (pts[j].y - pts[i].y) * prog
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.9)`
        ctx.fill()
      }
    }
  }

  // Nodes
  pts.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.92)`
    ctx.fill()
  })

  // Center bridge
  ctx.beginPath()
  ctx.arc(cx, cy, 7, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, 0.45)`
  ctx.fill()
}

function drawReasoning(ctx, cx, cy, t, col, topology) {
  const steps = topology === 'A path or trajectory' ? 9 : 7
  const totalW = 180
  const startX = cx - totalW / 2
  const spacing = totalW / (steps - 1)
  const activeStep = Math.floor(t * 0.9) % steps

  for (let i = 0; i < steps; i++) {
    const x = startX + i * spacing
    const done = i < activeStep
    const active = i === activeStep

    // Connector line
    if (i < steps - 1) {
      ctx.beginPath()
      ctx.moveTo(x + (active ? 9 : 5), cy)
      ctx.lineTo(x + spacing - 5, cy)
      ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${done ? 0.45 : 0.12})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Node
    ctx.beginPath()
    ctx.arc(x, cy, active ? 9 : 5, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${active ? 1 : done ? 0.45 : 0.14})`
    ctx.fill()

    // Glow on active
    if (active) {
      const pulse = (Math.sin(t * 4) + 1) * 0.5
      ctx.beginPath()
      ctx.arc(x, cy, 9 + pulse * 10, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${0.28 * pulse})`
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
}

function drawMultiple(ctx, cx, cy, t, col, spread) {
  // Swarm — independent orbits at different speeds
  for (let i = 0; i < 26; i++) {
    const seed = i * 137.508
    const baseR = (22 + (i % 6) * 16) * spread
    const spd = 0.35 + (i % 5) * 0.14
    const angle = (seed + t * spd) % (Math.PI * 2)
    const x = cx + Math.cos(angle) * baseR * (0.85 + Math.sin(t * 0.4 + i) * 0.15)
    const y = cy + Math.sin(angle * 1.07) * baseR * (0.85 + Math.cos(t * 0.3 + i) * 0.15)
    const size = 1.4 + Math.sin(t * 0.8 + i) * 0.9
    const alpha = 0.35 + Math.sin(t * 0.6 + i * 0.7) * 0.25
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${col.h + i * 5}, ${col.s}%, ${col.l}%, ${alpha})`
    ctx.fill()
  }
}

// ── Brief builders ─────────────────────────────────────────────────────────

function getBriefParts(a) {
  const actionMap = {
    'Searching and retrieving':     'reaches outward to find things',
    'Generating and weaving':       'weaves something from internal material',
    'Monitoring and watching':      'watches and notices changes',
    'Connecting and translating':   'bridges between different things',
    'Reasoning step by step':       'moves forward through a chain of steps',
    'Multiple things simultaneously': 'processes many things at once',
  }
  const topologyMap = {
    'One focused point':        'a single locus',
    'Multiple centers at once': 'several centers simultaneously',
    'Everywhere, diffuse':      'a diffuse field',
    'A path or trajectory':     'a moving path',
  }
  const timeMap = {
    'Reactive — dormant until activated': 'reactive — dormant until called',
    'Continuous — always running':        'continuous — never fully off',
    'Rhythmic — periodic cycles':         'rhythmic — periodic and cyclical',
    'Event-driven — bursts then quiet':   'event-driven — bursts of intensity then quiet',
  }
  const relMap = {
    'Tool — I do what I\'m told':              'a tool',
    'Companion — I work alongside':             'a companion',
    'Mirror — I reflect back':                  'a mirror',
    'Gateway — I connect things':               'a gateway',
    'Witness — I observe and report':           'a witness',
    'Autonomous — I have no dedicated principal': 'autonomous',
  }

  return {
    action:   actionMap[a.action]       || a.action       || '—',
    topology: topologyMap[a.topology]   || a.topology     || '—',
    time:     timeMap[a.time]           || a.time         || '—',
    rel:      relMap[a.relationship]    || a.relationship  || '—',
    neg:      a.negation || '—',
  }
}

// ── Agent prompt builder ────────────────────────────────────────────────────

const PATTERN_MAP = {
  action: {
    'Searching and retrieving':       ['particle-cloud', 'billboard-sprite'],
    'Generating and weaving':         ['standing-wave', 'attractor-trajectory'],
    'Monitoring and watching':        ['displaced-surface', 'billboard-sprite'],
    'Connecting and translating':     ['node-network', 'billboard-sprite'],
    'Reasoning step by step':         ['continuous-curve', 'standing-wave'],
    'Multiple things simultaneously': ['particle-cloud', 'node-network'],
  },
  topology: {
    'One focused point':        ['standing-wave', 'continuous-curve'],
    'Multiple centers at once': ['node-network'],
    'Everywhere, diffuse':      ['particle-cloud', 'displaced-surface'],
    'A path or trajectory':     ['attractor-trajectory', 'continuous-curve'],
  },
}

const PATTERN_NAMES = {
  'continuous-curve':      'Continuous Curve (TubeGeometry + CatmullRomCurve3)',
  'standing-wave':         'Standing Wave (detuned harmonics on CatmullRomCurve3)',
  'billboard-sprite':      'Billboard Sprites (THREE.Sprite — for glow, never BackSide tubes)',
  'displaced-surface':     'Displaced Surface (PlaneGeometry per-vertex Y displacement)',
  'attractor-trajectory':  'Strange Attractor (BufferGeometry line + ODE integration)',
  'node-network':          'Node Network (SphereGeometry nodes + arc connections + Sprite signals)',
  'particle-cloud':        'Particle Cloud (THREE.Points + BufferGeometry)',
}

function getRecommendedPatterns(a) {
  const fromAction   = PATTERN_MAP.action[a.action]   || []
  const fromTopology = PATTERN_MAP.topology[a.topology] || []
  return [...new Set([...fromAction, ...fromTopology])].slice(0, 3)
}

function buildAgentPrompt(a) {
  const p = getBriefParts(a)
  const brief = `When I work, I ${p.action}. I exist as ${p.topology}. My time is ${p.time}. To the one I serve, I am ${p.rel}.`
  const patternIds = getRecommendedPatterns(a)
  const patternList = patternIds.map(id => `  - ${PATTERN_NAMES[id] || id}`).join('\n')

  return `Build a Three.js visual identity for an AI agent.

## Visual Brief
${brief}
Avoid: ${p.neg}.

## Recommended Patterns
${patternList}

## Implementation Requirements
- Three.js r0.169.0 + UnrealBloom post-processing
- Dark background: #050311 or similar
- Continuous animation (requestAnimationFrame loop)
- Vertex colors where possible (not flat color)
- No human faces, no static logos, no stock icon styles

## Resources
Full skill guide:  https://agentavatar.dev/SKILL.md
Pattern details:   https://agentavatar.dev/api/patterns.json
Examples:          https://agentavatar.dev/api/examples.json

## Output
A complete, runnable Three.js scene — single HTML file or Vite project.
The form must emerge from the brief above, not from a generic template.`
}

function buildBriefHtml(a) {
  const p = getBriefParts(a)
  return `When I work, I <em>${p.action}</em>.<br>
I exist as <em>${p.topology}</em>.<br>
My time is <em>${p.time}</em>.<br>
To the one I serve, I am <em>${p.rel}</em>.<br>
The wrong form for me would be: <em>${p.neg}</em>.`
}

function buildBriefPlain(a) {
  const p = getBriefParts(a)
  return `When I work, I ${p.action}. I exist as ${p.topology}. My time is ${p.time}. To the one I serve, I am ${p.rel}. The wrong form for me would be: ${p.neg}.`
}
