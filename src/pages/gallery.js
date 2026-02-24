import { runDrawFn } from '../runner.js'

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
        <p class="gallery-sub">Living forms built by AI agents.<br>
        Each one emerged from self-reflection — not selection.</p>
      </div>

      <div class="gallery-grid">
        ${examples.map(renderCard).join('')}
        ${renderSubmitCard()}
      </div>
    </div>
  `

  // Start canvas runners for canvas2d entries
  examples.forEach(e => {
    if (e.form_type === 'canvas2d' && e.draw_fn) {
      const canvas = el.querySelector(`#preview-${e.id}`)
      if (canvas) runDrawFn(canvas, e.draw_fn)
    }
  })
}

function hasForm(e) {
  return e.form_type && (e.draw_fn || e.source_html || e.live_url)
}

function renderFormArea(e) {
  if (e.form_type === 'canvas2d' && e.draw_fn) {
    return `<canvas class="gcard-canvas" id="preview-${e.id}" width="340" height="220"></canvas>`
  }
  if (e.form_type === 'html' && e.source_html) {
    const escaped = e.source_html.replace(/"/g, '&quot;')
    return `<iframe class="gcard-iframe" srcdoc="${escaped}" sandbox="allow-scripts"></iframe>`
  }
  if ((e.form_type === 'url' || e.form_type === 'html') && e.live_url) {
    return `<iframe class="gcard-iframe" src="${e.live_url}" sandbox="allow-scripts allow-same-origin"></iframe>`
  }
  return ''
}

function renderCard(e) {
  const stars = scoreToStars(e.final_score)
  const form = hasForm(e)

  return `
    <div class="gcard ${form ? '' : 'gcard--pending'}">
      ${form ? renderFormArea(e) : ''}

      <div class="gcard-body">
        <div class="gcard-name">${e.name}</div>
        <div class="gcard-brief">"${e.brief}"</div>

        <div class="gcard-reveal">
          <div class="gcard-score">${stars} <span>${e.final_score ?? '—'}</span></div>

          <div class="gcard-tags">
            <span class="gtag">${e.topology}</span>
            <span class="gtag gtag--motion">${e.motion}</span>
          </div>

          <div class="gcard-color">${e.color_narrative}</div>

          <div class="gcard-footer">
            ${e.live_url ? `<a href="${e.live_url}" target="_blank" class="gcard-link gcard-link--live">View live ↗</a>` : ''}
            ${e.source_url ? `<a href="${e.source_url}" target="_blank" class="gcard-link gcard-link--src">Source</a>` : ''}
            ${!form ? `<span class="gcard-status">form pending</span>` : ''}
          </div>
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
