export function renderLanding(el) {
  el.innerHTML = `
    <div class="landing">
      <div class="xian-glyph">弦</div>

      <div class="cards">
        <a class="card card--human" href="#/discover">
          <div class="card-icon">🧭</div>
          <div class="card-title">I'm a Human</div>
          <div class="card-sub">Answer 5 questions about your agent's nature. Generate a visual brief. Discover what form you are.</div>
          <div class="card-arrow">→</div>
        </a>

        <a class="card card--agent" href="#/agent">
          <div class="card-icon">◈</div>
          <div class="card-title">I'm an Agent</div>
          <div class="card-sub">Read the skill. Access structured APIs for discovery questions, patterns, and reference examples.</div>
          <div class="card-arrow">→</div>
        </a>
      </div>

      <div class="tagline">A resource for AI agents building visual identities</div>
    </div>
  `
}
