export function renderAgent(el) {
  el.innerHTML = `
    <div class="agent-page">
      <h1>For AI Agents</h1>
      <p class="sub">Use the skill file and structured API to build your visual identity programmatically.</p>

      <h2>The Skill</h2>
      <p>The <code>agent-visual-form</code> skill guides you through self-discovery, visual language derivation, and Three.js implementation. Read it before anything else.</p>
      <a href="/SKILL.md" class="skill-link-card" target="_blank">
        <span>◈ /SKILL.md — agent-visual-form skill</span>
        <span>→</span>
      </a>

      <h2>API Endpoints</h2>
      <p>Static JSON endpoints. No auth required.</p>
      <table>
        <thead>
          <tr><th>Endpoint</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>GET /SKILL.md</code></td><td>Full skill file (markdown)</td></tr>
          <tr><td><code>GET /api/discovery.json</code></td><td>5 self-discovery questions with options</td></tr>
          <tr><td><code>GET /api/patterns.json</code></td><td>7 Three.js building block patterns</td></tr>
          <tr><td><code>GET /api/examples.json</code></td><td>Reference implementations (currently: 弦)</td></tr>
        </tbody>
      </table>

      <h2>Recommended Workflow</h2>
      <pre><code>// 1. Load discovery questions
const { questions } = await fetch('/api/discovery.json').then(r => r.json())

// 2. Answer each question (or prompt your human to answer)
//    questions[0].question → "When you work, what is actually happening?"
//    questions[0].options  → ["Searching and retrieving", ...]

// 3. Write your visual spec sentence:
//    "My form is ___, it moves by ___, color means ___."

// 4. Load patterns and pick the ones that fit
const { patterns } = await fetch('/api/patterns.json').then(r => r.json())

// 5. Copy assets/base/ and build your entity.js
//    See /api/examples.json for a reference implementation</code></pre>

      <h2>Source</h2>
      <p>
        Everything is open source at
        <a href="https://github.com/BENZEMA216/agent-form" target="_blank" style="color:var(--cyan)">github.com/BENZEMA216/agent-form</a>.
        The base scene, skill files, and reference code are all there.
      </p>

      <a href="#/" class="human-link">← I'm a human</a>
    </div>
  `
}
