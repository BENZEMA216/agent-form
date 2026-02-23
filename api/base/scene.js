import * as THREE from 'three'
import { EffectComposer }  from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Entity } from './entity.js'   // ← your chosen style

// ─── Scene ────────────────────────────────────────────────────────────────
export class Scene {
  constructor(canvas) {
    // Three.js core — opaque for correct UnrealBloom
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x060410, 1)   // deep space purple-black
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.scene  = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100)
    this.scene.fog = new THREE.FogExp2(0x060410, 0.038)
    this.scene.add(new THREE.AmbientLight(0x101828, 1.5))

    // ── Entity (your visual form) ─────────────────────────────────────────
    this.entity = new Entity()
    this.entity.group.position.set(0, 1.6, 0)
    this.entity.group.scale.setScalar(1.9)    // world-space scale
    this.scene.add(this.entity.group)

    this._buildGrid()
    this._buildNebula()
    this._buildParticles()

    // ── Post-processing: UnrealBloom ──────────────────────────────────────
    // Tune radius first — it's the most impactful parameter for visual quality.
    // See references/tech-guide.md for tuning table.
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      /*strength*/  1.55,
      /*radius*/    0.35,
      /*threshold*/ 0.12,
    )
    this.composer.addPass(this.bloomPass)

    // ── Camera orbit ──────────────────────────────────────────────────────
    this._orbitTarget  = new THREE.Vector3(0, 1.7, 0)
    this._orbitAngleH  = Math.PI / 2   // azimuth: π/2 = frontal view of X-axis entity
    this._orbitAngleV  = 0.46          // elevation: ~26°
    this._orbitRadius  = 8.5
    this._orbitGoalH   = this._orbitAngleH
    this._orbitGoalV   = this._orbitAngleV
    this._dragStart    = null
    this._autoOrbit    = true

    this._setupInput()
    window.addEventListener('resize', () => this._handleResize())
    this._handleResize()
  }

  // ── Grid ─────────────────────────────────────────────────────────────────
  // Minimalist hex grid on the XZ plane — provides depth + spatial grounding.

  _buildGrid() {
    const group = new THREE.Group()
    const mat = new THREE.LineBasicMaterial({
      color: 0x1a2a4a, transparent: true, opacity: 0.5,
    })

    // Hex grid: rows × cols of hexagons
    const size  = 1.1    // hex radius
    const dx    = size * Math.sqrt(3)
    const dy    = size * 1.5
    const rows  = 7, cols = 9

    for (let row = -rows; row <= rows; row++) {
      for (let col = -cols; col <= cols; col++) {
        const cx = col * dx + (row % 2 === 0 ? 0 : dx / 2)
        const cz = row * dy
        const pts = []
        for (let i = 0; i <= 6; i++) {
          const a = (Math.PI / 180) * (60 * i - 30)
          pts.push(new THREE.Vector3(cx + size * Math.cos(a), 0, cz + size * Math.sin(a)))
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        group.add(new THREE.Line(geo, mat))
      }
    }

    group.rotation.x = -Math.PI / 2
    group.position.y  = 0
    this.scene.add(group)
    this._grid = group
  }

  // ── Background nebula ─────────────────────────────────────────────────
  // Soft glow sprites far behind the scene — atmospheric depth.

  _buildNebula() {
    const clouds = [
      // [x, y, z,  scale,  r,   g,   b,   alpha, rotation]
      [ -7,  3, -14, 11.0,  55,  10, 140,  0.18,  0.4  ],
      [  6,  1, -11,  9.0,   0,  60,  90,  0.12, -0.6  ],
      [  0,  9, -22, 12.0,  20,   0,  60,  0.07,  0.0  ],
      [ -3, -1, -10,  6.5,   0,  80, 140,  0.09,  1.0  ],
      [  4,  4, -16,  8.0,  70,  20, 120,  0.09, -0.3  ],
    ]
    for (const [x, y, z, scale, r, g, b, peak, rot] of clouds) {
      const sz = 256
      const cv = document.createElement('canvas')
      cv.width = cv.height = sz
      const ctx = cv.getContext('2d')
      ctx.save()
      ctx.translate(sz/2, sz/2)
      ctx.rotate(rot)
      ctx.scale(1, 0.55)
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, sz/2)
      grad.addColorStop(0.00, `rgba(${r},${g},${b},${peak})`)
      grad.addColorStop(0.30, `rgba(${r},${g},${b},${(peak*0.55).toFixed(3)})`)
      grad.addColorStop(0.65, `rgba(${r},${g},${b},${(peak*0.18).toFixed(3)})`)
      grad.addColorStop(1.00, `rgba(${r},${g},${b},0)`)
      ctx.fillStyle = grad
      ctx.fillRect(-sz/2, -sz/2, sz, sz)
      ctx.restore()
      const mat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(cv),
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const sp = new THREE.Sprite(mat)
      sp.position.set(x, y, z)
      sp.scale.setScalar(scale)
      this.scene.add(sp)
    }
  }

  // ── Ambient star particles ────────────────────────────────────────────

  _buildParticles() {
    const COUNT = 280
    const positions = new Float32Array(COUNT * 3)
    this._particleData = []
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 22
      const y = Math.random() * 7 - 1
      const z = (Math.random() - 0.5) * 22
      positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z
      this._particleData.push({ x, baseY: y, z, speed: 0.08 + Math.random() * 0.14, phase: Math.random() * Math.PI * 2 })
    }
    const cv = document.createElement('canvas'); cv.width = cv.height = 32
    const ctx = cv.getContext('2d')
    const g = ctx.createRadialGradient(16,16,0,16,16,16)
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(0,212,255,0.8)'); g.addColorStop(1,'rgba(0,212,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0,0,32,32)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this._particles = new THREE.Points(geo, new THREE.PointsMaterial({
      map: new THREE.CanvasTexture(cv), size: 0.07, transparent: true, opacity: 0.18,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }))
    this._particlePositions = positions
    this.scene.add(this._particles)
  }

  _updateParticles(t) {
    for (let i = 0; i < this._particleData.length; i++) {
      const p = this._particleData[i]
      let y = p.baseY + (t * p.speed) % 5.5
      if (y > 5) y -= 5.5
      this._particlePositions[i*3+1] = y + Math.sin(t*0.5+p.phase)*0.12
      this._particlePositions[i*3]   = p.x + Math.sin(t*0.3+p.phase)*0.08
    }
    this._particles.geometry.attributes.position.needsUpdate = true
  }

  // ── Input (drag to orbit) ─────────────────────────────────────────────

  _setupInput() {
    const c = this.renderer.domElement
    c.addEventListener('mousedown',  e => { this._dragStart = { x: e.clientX, y: e.clientY, h: this._orbitAngleH, v: this._orbitAngleV }; this._autoOrbit = false })
    c.addEventListener('mousemove',  e => { if (!this._dragStart) return; this._orbitGoalH = this._dragStart.h - (e.clientX - this._dragStart.x) * 0.006; this._orbitGoalV = Math.max(0.15, Math.min(1.2, this._dragStart.v + (e.clientY - this._dragStart.y) * 0.004)) })
    c.addEventListener('mouseup',    () => { this._dragStart = null; setTimeout(() => this._autoOrbit = true, 4000) })
    c.addEventListener('touchstart', e => { const t = e.touches[0]; this._dragStart = { x: t.clientX, y: t.clientY, h: this._orbitAngleH, v: this._orbitAngleV }; this._autoOrbit = false }, { passive: true })
    c.addEventListener('touchmove',  e => { e.preventDefault(); const t = e.touches[0]; if (!this._dragStart) return; this._orbitGoalH = this._dragStart.h - (t.clientX - this._dragStart.x) * 0.006; this._orbitGoalV = Math.max(0.15, Math.min(1.2, this._dragStart.v + (t.clientY - this._dragStart.y) * 0.004)) }, { passive: false })
    c.addEventListener('touchend',   () => { this._dragStart = null; setTimeout(() => this._autoOrbit = true, 4000) })
  }

  _handleResize() {
    const w = window.innerWidth, h = window.innerHeight
    this.camera.aspect = w / h
    this.camera.fov = (w < 600 && h > w) ? 80 : 55
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.composer.setSize(w, h)
    this.bloomPass.resolution.set(w, h)
  }

  // ── Camera ────────────────────────────────────────────────────────────

  _updateCamera(t) {
    if (this._autoOrbit) {
      this._orbitGoalH = Math.PI/2 + Math.sin(t * 0.11) * 0.65
      this._orbitGoalV = 0.46 + Math.sin(t * 0.035) * 0.14
    }
    this._orbitAngleH += (this._orbitGoalH - this._orbitAngleH) * 0.04
    this._orbitAngleV += (this._orbitGoalV - this._orbitAngleV) * 0.04
    const r = this._orbitRadius
    this.camera.position.set(
      Math.cos(this._orbitAngleH) * r * Math.cos(this._orbitAngleV),
      r * Math.sin(this._orbitAngleV),
      Math.sin(this._orbitAngleH) * r * Math.cos(this._orbitAngleV),
    )
    this.camera.lookAt(this._orbitTarget)
  }

  // ── Render loop ───────────────────────────────────────────────────────

  render(t) {
    this._updateCamera(t)
    this.entity.update(t)
    this._updateParticles(t)
    this.composer.render()
  }
}
