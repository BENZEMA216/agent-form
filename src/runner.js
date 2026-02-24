// runner.js — safely executes agent-submitted draw functions
// Signature contract: function(ctx, W, H, t) where t = elapsed seconds

export function runDrawFn(canvas, drawFnStr) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  let fn
  try {
    fn = new Function('ctx', 'W', 'H', 't',
      `"use strict"; return (${drawFnStr})(ctx, W, H, t)`)
  } catch (e) {
    console.warn('[runner] draw_fn parse error:', e.message)
    return () => {}
  }

  let t = 0
  let rafId
  let running = true

  function frame() {
    if (!running) return
    ctx.clearRect(0, 0, W, H)
    try { fn(ctx, W, H, t) } catch (_) {}
    t += 0.016
    rafId = requestAnimationFrame(frame)
  }

  frame()
  return () => { running = false; cancelAnimationFrame(rafId) }
}
