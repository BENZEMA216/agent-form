# Tech Patterns: Building Blocks

These are modular code patterns — not complete entities.
Pick the patterns that serve your visual spec, assemble them yourself.

Each pattern is ~20–50 lines. Your entity.js will combine several.

---

## Setup: Scene skeleton (already in assets/base/)

```js
// scene.js provides: renderer, camera, bloom, fog, hex grid, nebula, particles
// Your entity.js only needs to export a class with:
//   constructor() { this.group = new THREE.Group(); ... }
//   setState(state) { ... }
//   update(t) { ... }
```

## Bloom (UnrealBloomPass) — critical settings

```js
const bloom = new UnrealBloomPass(
  new THREE.Vector2(w, h),
  1.55,    // strength  — overall glow intensity
  0.35,    // radius    — spread (keep 0.25–0.45 for crisp glow; 0.60+ = cloud)
  0.12,    // threshold — only pixels above this luminance bloom
)
// Material rule: always MeshBasicMaterial + AdditiveBlending for glow elements
// Never MeshPhongMaterial — lighting breaks bloom
```

---

## Pattern: continuous-curve

A dynamic curve that rebuilds each frame from an array of 3D points.

```js
// Build once
const N = 80
this._pts = Array.from({length:N}, (_,i) => new THREE.Vector3(i/N*4-2, 0, 0))
const mat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, vertexColors: true })
this.tube = new THREE.Mesh(new THREE.TubeGeometry(
  new THREE.CatmullRomCurve3(this._pts), N, 0.013, 7, false
), mat)
this.group.add(this.tube)

// Rebuild each frame after updating this._pts
_rebuildTube() {
  const curve = new THREE.CatmullRomCurve3(this._pts)
  const geo = new THREE.TubeGeometry(curve, this._pts.length+6, 0.013, 7, false)
  this.tube.geometry.dispose()
  this.tube.geometry = geo
}
```

---

## Pattern: amplitude-vertex-color

Drive tube brightness from a per-point amplitude array.
Nodes (low amplitude) → dark indigo. Antinodes (high amplitude) → warm gold.

```js
const darkCol = [0.03, 0.08, 0.35]   // deep indigo
const peakCol = [1.00, 0.95, 0.75]   // warm golden-white

const vpr    = radSegs + 1
const vCount = geo.attributes.position.count
const colors = new Float32Array(vCount * 3)

for (let s = 0; s <= tubeSegs; s++) {
  const ampNorm = Math.min(amps[Math.round(s/tubeSegs*(N-1))] / 0.38, 1.0)
  let [cr, cg, cb] = [
    darkCol[0] + (peakCol[0]-darkCol[0]) * ampNorm,
    darkCol[1] + (peakCol[1]-darkCol[1]) * ampNorm,
    darkCol[2] + (peakCol[2]-darkCol[2]) * ampNorm,
  ]
  // Taper endpoints to zero (prevents bloom spike at tube end)
  const tFrac = s / tubeSegs
  const tap = Math.min(tFrac/0.18, 1.0, (1-tFrac)/0.18)
  if (tap < 0.70) { const d=tap/0.70; cr*=d; cg*=d; cb*=d }

  for (let v = 0; v < vpr; v++) {
    const idx = (s*vpr+v)*3
    colors[idx]=cr; colors[idx+1]=cg; colors[idx+2]=cb
  }
}
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
```

---

## Pattern: standing-wave

Elliptical polarization — the string is never flat.
Detuned harmonics ensure phase never fully cancels.

```js
// Harmonic: [n, weight, phaseOffset, zScale, speedMult]
const harmonics = [
  [1, 1.00, 0,           0.50, 1.000],  // H1 — fundamental
  [3, 0.65, Math.PI/2,   0.46, 0.783],  // H3 — slightly slower
  [5, 0.42, Math.PI/4,   0.42, 1.174],  // H5 — slightly faster
]
const baseSpeed = 0.80, amp = 0.50

for (let i = 0; i < N; i++) {
  const norm = i/(N-1), env = Math.sin(norm*Math.PI)
  let dY=0, dZ=0
  for (const [n,w,ph,zS,sM] of harmonics) {
    const spatial = w * Math.sin(n*Math.PI*norm) * amp * env
    const phase   = t * baseSpeed * sM + ph
    dY += spatial * Math.sin(phase)
    dZ += spatial * Math.cos(phase) * zS
  }
  this._pts[i].set(norm*L - L/2, dY, dZ)
  amps[i] = Math.sqrt(dY*dY + dZ*dZ)
}

// Minimum Y guarantee — never truly flat
const maxY = Math.max(...this._pts.map(p=>Math.abs(p.y)), 0.001)
if (maxY < amp*0.28) {
  const boost = amp*0.28/maxY
  this._pts.forEach(p => p.y *= boost)
}
```

---

## Pattern: billboard-sprite

Glow halos that always face the camera. No geometry artifacts.

```js
// Create radial gradient texture (once)
const sz=128, cv=document.createElement('canvas'); cv.width=cv.height=sz
const ctx=cv.getContext('2d')
const g=ctx.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2)
g.addColorStop(0.00,'rgba(255,255,255,1.00)')
g.addColorStop(0.08,'rgba(230,248,255,0.92)')
g.addColorStop(0.25,'rgba(0,212,255,0.55)')
g.addColorStop(1.00,'rgba(0,80,180,0.00)')
ctx.fillStyle=g; ctx.fillRect(0,0,sz,sz)
const tex = new THREE.CanvasTexture(cv)

// Instantiate sprites
const sp = new THREE.Sprite(new THREE.SpriteMaterial({
  map: tex, blending: THREE.AdditiveBlending,
  transparent: true, depthWrite: false,
}))
sp.scale.setScalar(0.36)
this.group.add(sp)

// Each frame: set position, scale, color temperature
sp.position.copy(wavePoint)
const warmth = Math.min(localAmp * 2.5, 1.0)
sp.material.color.setRGB(
  0.35 + warmth*0.65,   // cool blue → warm gold
  0.72 + warmth*0.20,
  1.00 - warmth*0.45,
)
sp.material.opacity = envFade * (0.28 + localAmp * 1.2)
```

---

## Pattern: displaced-surface

A 2D grid whose vertices move up/down driven by wave equations.
Height-driven vertex colors: dark valleys → bright ridges.

```js
// Build once
const SEGS=48, SIZE=4
const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGS, SEGS)
geo.rotateX(-Math.PI/2)
const colors = new Float32Array(geo.attributes.position.count*3)
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
this.surface = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
  vertexColors: true, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
}))
this.group.add(this.surface)

// Each frame: compute height per vertex, apply to Y, update colors
const pos = geo.attributes.position, cols = geo.attributes.color
for (let i=0; i < pos.count; i++) {
  const px=pos.getX(i), pz=pos.getZ(i)
  let h=0
  for (const [dx,dz,freq,speed,amp] of waves)
    h += amp * Math.sin(freq*(px*dx+pz*dz) + t*speed)
  const radialFade = Math.max(0, 1 - Math.sqrt((px/(SIZE/2))**2+(pz/(SIZE/2))**2)*0.85)
  pos.setY(i, h * radialFade)
  const n = (h/maxH+1)/2   // normalize to 0–1
  cols.setXYZ(i, darkR+(brightR-darkR)*n, darkG+(brightG-darkG)*n, darkB+(brightB-darkB)*n)
}
pos.needsUpdate=true; cols.needsUpdate=true
```

---

## Pattern: attractor-trajectory

A strange attractor (Thomas system) — bounded, never repeating.

```js
// State: position on attractor
this._pos = new THREE.Vector3(0.1, 0.0, 0.0)
this._trail = []   // last N positions

// Integration step (Thomas attractor, b=0.208186)
_step(b=0.208186, dt=0.04) {
  const {x,y,z}=this._pos
  this._pos.x += (Math.sin(y)-b*x)*dt
  this._pos.y += (Math.sin(z)-b*y)*dt
  this._pos.z += (Math.sin(x)-b*z)*dt
}

// Each frame: step forward, update trail geometry
update(t) {
  for (let i=0; i<stepsPerFrame; i++) {
    this._step()
    this._trail.push(this._pos.clone())
    if (this._trail.length > TRAIL_LEN) this._trail.shift()
  }
  // Update BufferGeometry positions from this._trail
  // Color by velocity: slow=dim/cool, fast=bright/warm
}
```

---

## Pattern: node-network

Nodes as spheres + glowing halos + arc connections + signal packets.

```js
// Node: sphere + SpriteMaterial glow halo
const node = new THREE.Mesh(
  new THREE.SphereGeometry(r, 14, 14),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
)
const halo = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
}))
halo.scale.setScalar(r*9)
node.add(halo)

// Connection arc: CatmullRomCurve3 with raised midpoint
const mid = pa.clone().add(pb).multiplyScalar(0.5)
mid.y += 0.2 + pa.distanceTo(pb) * 0.18
const curve = new THREE.CatmullRomCurve3([pa, mid, pb])
const line = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),
  new THREE.LineBasicMaterial({ color: 0x0a1a3a, transparent: true, opacity: 0.3 })
)

// Signal packet: sprite traveling along curve
pkt.progress += speed * 0.016
const pos = curve.getPoint(pkt.progress % 1)
pkt.sprite.position.copy(pos)
pkt.sprite.material.opacity = Math.sin(pkt.progress * Math.PI) * 0.8
```

---

## Pattern: particle-cloud

Points-based ambient particles — cheap, scalable.

```js
// Build once
const COUNT=500
const positions = new Float32Array(COUNT*3)
for (let i=0;i<COUNT;i++) {
  positions[i*3]   = (Math.random()-0.5)*4
  positions[i*3+1] = (Math.random()-0.5)*4
  positions[i*3+2] = (Math.random()-0.5)*4
}
const geo = new THREE.BufferGeometry()
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
this.cloud = new THREE.Points(geo, new THREE.PointsMaterial({
  size: 0.05, color: 0x00d4ff, transparent: true, opacity: 0.4,
  blending: THREE.AdditiveBlending, depthWrite: false,
  sizeAttenuation: true,
}))

// Each frame: drift, wrap, or physics-drive positions
```

---

## Pattern: state-color

Smooth color transitions between agent states.

```js
const PALETTES = {
  idle:     { primary: 0x00d4ff, dark: [0.00,0.25,0.45], peak: [0.00,0.85,1.00] },
  chatting: { primary: 0x4aff88, dark: [0.04,0.22,0.10], peak: [0.20,1.00,0.55] },
  working:  { primary: 0xffbb00, dark: [0.28,0.12,0.00], peak: [1.00,0.82,0.20] },
  thinking: { primary: 0xb14eff, dark: [0.18,0.04,0.30], peak: [0.72,0.45,1.00] },
}

setState(state) {
  this.state = state
  this._palette = PALETTES[state] ?? PALETTES.idle
  // Apply primary to point light, status ring, trail particles
  this.light.color.setHex(this._palette.primary)
}

// In _updateWave: use this._palette.dark and this._palette.peak for vertex colors
```

---

## Tube endpoint taper (anti-spike)

Tube geometry endpoints bloom → visible needle tip. Fix:

```js
const TAPER = 0.18   // taper zone = first/last 18% of tube length
const pos = geo.attributes.position, vpr = radSegs+1
for (let s=0; s<=tubeSegs; s++) {
  const t=s/tubeSegs, taper=Math.min(t/TAPER, 1.0, (1-t)/TAPER)
  if (taper>=1) continue
  let cx=0,cy=0,cz=0
  for (let v=0;v<radSegs;v++){cx+=pos.getX(s*vpr+v);cy+=pos.getY(s*vpr+v);cz+=pos.getZ(s*vpr+v)}
  cx/=radSegs;cy/=radSegs;cz/=radSegs
  for (let v=0;v<vpr;v++){const vi=s*vpr+v
    pos.setXYZ(vi,cx+(pos.getX(vi)-cx)*taper,cy+(pos.getY(vi)-cy)*taper,cz+(pos.getZ(vi)-cz)*taper)}
}
```

---

## DO NOT use wide tube geometry for glow

```js
// ❌ BackSide on wide tube → gray triangle artifacts on side faces
new THREE.MeshBasicMaterial({ side: THREE.BackSide })

// ✅ Billboard sprites instead — always face camera, no geometry artifacts
new THREE.SpriteMaterial({ blending: THREE.AdditiveBlending })
```
