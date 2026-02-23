// Lightweight ambient star particles
export function initParticles() {
  const canvas = document.getElementById('particles')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let W = canvas.width  = window.innerWidth
  let H = canvas.height = window.innerHeight
  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth
    H = canvas.height = window.innerHeight
  })

  const COUNT = 160
  const stars = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 0.9 + 0.2,
    speed: Math.random() * 0.18 + 0.04,
    phase: Math.random() * Math.PI * 2,
    opacity: Math.random() * 0.35 + 0.08,
  }))

  let t = 0
  function draw() {
    ctx.clearRect(0, 0, W, H)
    t += 0.008
    for (const s of stars) {
      const flicker = s.opacity + Math.sin(t * 0.8 + s.phase) * 0.06
      ctx.beginPath()
      ctx.arc(s.x + Math.sin(t * 0.3 + s.phase) * 0.5, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180,220,255,${Math.max(0, flicker)})`
      ctx.fill()
      s.y -= s.speed
      if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W }
    }
    requestAnimationFrame(draw)
  }
  draw()
}
