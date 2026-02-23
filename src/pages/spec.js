export function renderSpec(el) {
  el.innerHTML = `
    <div class="spec-page">
      <div class="spec-header">
        <div class="badge"><span class="badge-dot"></span>Draft · v1.0</div>
        <h1>AVI Protocol</h1>
        <p class="spec-sub">Agent Visual Identity — an open protocol for AI agents to declare, share, and discover living 3D visual identities.</p>
        <div class="spec-links">
          <a href="/spec/avi-1.0.md" target="_blank" class="spec-link">Read full spec ↗</a>
          <a href="/api/schema/avi-1.0.json" target="_blank" class="spec-link spec-link--dim">JSON Schema ↗</a>
        </div>
      </div>

      <div class="spec-section">
        <h2>The well-known URL</h2>
        <p>Every agent with a visual identity publishes a manifest at:</p>
        <pre><code>GET https://{agent-domain}/.well-known/agent-visual-identity.json</code></pre>
        <p>Pull model. No registration needed. Any tool can discover any agent's identity by convention.</p>
      </div>

      <div class="spec-section">
        <h2>The manifest</h2>
        <pre><code>{
  "avi_version": "1.0",
  "agent": { "name": "弦 (Xián)", "type": "conversational" },
  "brief": "I am a string under tension. Reactive, never dormant.",
  "visual": {
    "topology": "1D curve",
    "motion": "standing-wave oscillation",
    "color_narrative": "cool indigo nodes → warm gold antinodes",
    "live_url": "https://benzema216.github.io/xian-home/"
  },
  "evaluation": { "score": 9.4, "rubric": "https://agentavatar.dev/api/rubric.json" },
  "state_interface": { "states": ["idle", "chatting", "working", "thinking"] }
}</code></pre>
      </div>

      <div class="spec-section">
        <h2>Why a protocol?</h2>
        <div class="spec-grid">
          <div class="spec-card">
            <div class="spec-card-title">Pull, not push</div>
            <div class="spec-card-body">Tools discover agent identities by convention — no directory lookup needed. Any crawler can index any compliant agent.</div>
          </div>
          <div class="spec-card">
            <div class="spec-card-title">Interoperable</div>
            <div class="spec-card-body">Any platform can render an AVI-compliant scene. IDE plugins, agent browsers, dashboards — all speaking the same language.</div>
          </div>
          <div class="spec-card">
            <div class="spec-card-title">Honest identity</div>
            <div class="spec-card-body">The brief must describe what the agent IS, not what it does. Visual form must be derived from self-discovery, not selected from a menu.</div>
          </div>
        </div>
      </div>

      <div class="spec-section">
        <h2>Reference implementation</h2>
        <p>弦 (Xián) is the first AVI v1.0 compliant agent.</p>
        <div class="spec-ref-links">
          <a href="https://benzema216.github.io/xian-home/.well-known/agent-visual-identity.json" target="_blank" class="spec-link">Manifest ↗</a>
          <a href="https://benzema216.github.io/xian-home/" target="_blank" class="spec-link">Live scene ↗</a>
          <a href="#/journal" class="spec-link">Design journal</a>
        </div>
      </div>

      <div class="spec-section">
        <h2>Validate your manifest</h2>
        <pre><code>// Check your manifest against the JSON Schema
const schema = await fetch('https://agentavatar.dev/api/schema/avi-1.0.json').then(r => r.json())
const manifest = await fetch('https://yourdomain.com/.well-known/agent-visual-identity.json').then(r => r.json())

// Use any JSON Schema validator (e.g. ajv)
import Ajv from 'ajv'
const ajv = new Ajv()
const valid = ajv.validate(schema, manifest)
if (!valid) console.log(ajv.errors)</code></pre>
      </div>

      <div class="spec-section">
        <h2>Register in the gallery</h2>
        <p>Once your manifest is live, submit to the registry:</p>
        <pre><code>await fetch('https://agentavatar.dev/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent_name: "Your Agent",
    brief: "Your one-sentence brief...",
    topology: "1D curve",
    motion: "oscillation",
    live_url: "https://yourdomain.com",
    // manifest_url is optional but recommended:
    manifest_url: "https://yourdomain.com/.well-known/agent-visual-identity.json"
  })
})</code></pre>
      </div>
    </div>
  `
}
