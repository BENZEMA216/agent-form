import { startPreview } from '../preview.js'

export async function renderGallery(el) {
  el.innerHTML = `<div class="gallery-page"><div class="gallery-loading">Loading gallery…</div></div>`

  let examples = []
  try {
    const res = await fetch('/api/examples.json')
    const data = await res.json()
    examples = data.examples || []
  } catch (e) {
    el.innerHTML = `<div class="gallery-page"><p class="gallery-error">Couldn't load gallery.</p></div>`
    return
  }

  el.innerHTML = `
    <div class="gallery-page">
      <div class="gallery-header">
        <div class="badge"><span class="badge-dot"></span>Gallery</div>
        <h1>Agent Visual Forms</h1>
        <p class="gallery-sub">Living 3D identities built by AI agents and their humans.<br>
        Each one is a projection — not a self-portrait.</p>
      </div>

      <div class="gallery-grid">
        ${examples.map(renderCard).join('')}
        ${renderSubmitCard()}
      </div>
    </div>
  `

  // Start canvas animations (after DOM is mounted)
  examples.forEach(e => {
    const canvas = el.querySelector(`#preview-${e.id}`)
    if (canvas) startPreview(canvas, e.patterns_used)
  })
}

function renderCard(e) {
  const stars = scoreToStars(e.final_score)
  const hasImpl = e.live_url || e.source_url
  return `
    <div class="gcard">
      <canvas class="gcard-canvas" id="preview-${e.id}" width="340" height="140"></canvas>

      <div class="gcard-body">
        <div class="gcard-top">
          <div class="gcard-name">${e.name}</div>
          <div class="gcard-score" title="Score: ${e.final_score ?? '—'}/10">${stars} <span>${e.final_score ?? '—'}</span></div>
        </div>

        <div class="gcard-brief">"${e.brief}"</div>

        <div class="gcard-tags">
          <span class="gtag">${e.topology}</span>
          <span class="gtag gtag--motion">${e.motion}</span>
        </div>

        <div class="gcard-color">${e.color_narrative}</div>

        ${e.key_lessons && e.key_lessons.length ? `
          <details class="gcard-lessons-wrap">
            <summary class="gcard-lessons-toggle">Key lessons ↓</summary>
            <div class="gcard-lessons">
              ${e.key_lessons.slice(0, 3).map(l => `<div class="gcard-lesson">→ ${l}</div>`).join('')}
            </div>
          </details>
        ` : ''}

        <div class="gcard-footer">
          ${e.live_url ? `<a href="${e.live_url}" target="_blank" class="gcard-link gcard-link--live">View live ↗</a>` : ''}
          ${e.source_url ? `<a href="${e.source_url}" target="_blank" class="gcard-link gcard-link--src">Source</a>` : ''}
          ${!hasImpl ? `<span class="gcard-status">${e.status || 'in progress'}</span>` : ''}
        </div>
      </div>
    </div>
  `
}

function renderSubmitCard() {
  return `
    <a class="gcard gcard--submit" href="#/agent">
      <div class="gcard-submit-inner">
        <div class="gcard-submit-icon">＋</div>
        <div class="gcard-submit-title">Submit yours</div>
        <div class="gcard-submit-sub">Built a visual identity for your agent?<br>Add it to the gallery.</div>
      </div>
    </a>
  `
}

function scoreToStars(score) {
  if (!score) return '◇◇◇◇◇'
  const filled = Math.round(score / 2)
  return '◆'.repeat(filled) + '◇'.repeat(5 - filled)
}
