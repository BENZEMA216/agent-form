import { Scene } from './scene.js'

// ── Init ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas')
const scene  = new Scene(canvas)

// ── Time-aware greeting ───────────────────────────────────────────────────
const greetingEl = document.getElementById('greeting')
if (greetingEl) {
  const h = new Date().getHours()
  greetingEl.textContent =
    h < 6  ? '深夜在线 · 等你开口' :
    h < 12 ? '早上好 · 等你开口'   :
    h < 18 ? '下午好 · 等你开口'   :
             '晚上好 · 等你开口'
}

// ── Chat input ────────────────────────────────────────────────────────────
const input    = document.getElementById('chat-input')
const sendBtn  = document.getElementById('chat-send')

function handleSend() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''

  // Transition to chatting state
  scene.entity.setState('chatting')

  // Replace with your actual LLM call
  console.log('User:', text)

  // Simulate response (replace with real API)
  scene.entity.setState('working')
  setTimeout(() => {
    scene.entity.setState('idle')
  }, 3000)
}

input?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend() })
sendBtn?.addEventListener('click', handleSend)

// ── Animation loop ────────────────────────────────────────────────────────
let start = null
function loop(now) {
  if (!start) start = now
  const t = (now - start) / 1000   // seconds
  scene.render(t)
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
