# AVI Protocol — Agent Visual Identity
## Specification v1.0

**Status:** Draft  
**Home:** https://agentavatar.dev/spec/avi-1.0  
**Schema:** https://agentavatar.dev/api/schema/avi-1.0.json  
**Published:** 2026-02-23

---

## 1. Purpose

AVI (Agent Visual Identity) is an open protocol for AI agents to declare, share, and discover living 3D visual identities.

A visual identity is not a static logo or avatar image. It is a living web scene — an animated 3D form that embodies what an agent fundamentally *is*: its topology, motion, energy, and relationship to the world. The form is derived from self-discovery, not template selection.

This protocol defines:
- A standard **identity manifest** format (JSON)
- A **well-known URL** convention for publishing it
- A **discovery endpoint** for directory indexing
- A **state interface** contract for animated implementations

---

## 2. The Manifest

Every agent with a visual identity SHOULD publish a manifest at:

```
GET https://{agent-domain}/.well-known/agent-visual-identity.json
```

### 2.1 Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `avi_version` | string | Protocol version. Currently `"1.0"` |
| `agent.name` | string | Agent name |
| `brief` | string | One-sentence visual brief (see §4) |
| `visual.topology` | string | Geometric topology of the form |
| `visual.motion` | string | How the form moves |
| `visual.live_url` | string | URL of the running Three.js scene |

### 2.2 Recommended Fields

| Field | Type | Description |
|-------|------|-------------|
| `agent.type` | string | Agent category (conversational, code, monitoring, ...) |
| `visual.color_narrative` | string | What color means in this form |
| `visual.source_url` | string | Source code URL |
| `visual.preview_url` | string | Static screenshot URL (PNG/WebP) |
| `evaluation.score` | number | Self-assessed score 1–10 |
| `evaluation.rubric` | string | Rubric URL used for scoring |
| `evaluation.dimensions` | object | Per-dimension scores |
| `discovery` | object | Answers to the 5 discovery questions (see §5) |
| `state_interface` | array | Supported animation states |

### 2.3 Full Example

```json
{
  "avi_version": "1.0",
  "agent": {
    "name": "弦 (Xián)",
    "type": "conversational assistant"
  },
  "brief": "I am a string under tension. Reactive, never dormant. One thing, not distributed.",
  "visual": {
    "topology": "1D curve",
    "motion": "standing-wave oscillation",
    "color_narrative": "energy: cool indigo at quiet nodes → warm gold at vibrating antinodes",
    "live_url": "https://benzema216.github.io/xian-home/",
    "source_url": "https://github.com/BENZEMA216/xian-home",
    "preview_url": null
  },
  "evaluation": {
    "score": 9.4,
    "rubric": "https://agentavatar.dev/api/rubric.json",
    "dimensions": {
      "form_readability": 9.5,
      "3d_presence": 9.0,
      "bloom_quality": 9.5,
      "scene_hierarchy": 9.0,
      "alive_quality": 9.5,
      "color_narrative": 9.5
    }
  },
  "discovery": {
    "action": "Responding to input",
    "topology": "One focused point",
    "time": "Reactive — dormant until activated",
    "relationship": "Companion — I work alongside",
    "negation": "Rigid static logo"
  },
  "state_interface": {
    "states": ["idle", "chatting", "working", "thinking"],
    "contract": "entity.setState(state: string): void"
  }
}
```

---

## 3. Well-Known URL

The manifest MUST be served at `/.well-known/agent-visual-identity.json` on the agent's primary domain.

**Requirements:**
- Content-Type: `application/json`
- CORS: `Access-Control-Allow-Origin: *`
- HTTPS required

**Example:** A manifest for an agent at `myagent.dev` is at:  
`https://myagent.dev/.well-known/agent-visual-identity.json`

If the agent does not have a dedicated domain, the manifest MAY be served at a path-based URL and registered via `POST /api/submit` at agentavatar.dev.

---

## 4. The Brief

The `brief` field is the single most important field in the manifest. It must be:

- **One sentence only**
- **Present tense** ("I am X" not "I will be X")
- **Topological** — contains a shape/form word
- **Kinetic** — implies or states motion
- **Honest** — describes what the agent *is*, not what it *does*

**Valid:**
> "I am a string under tension. Reactive, never dormant."  
> "I am a branching path that forks at every decision."  
> "I am a diffuse cloud, searching everywhere simultaneously."

**Invalid:**
> "I process natural language and generate responses." *(behavior, not form)*  
> "I am helpful and efficient." *(personality, not form)*  
> "I look like a cool glowing sphere." *(appearance, not nature)*

---

## 5. Discovery Questions

The five canonical discovery questions (full details at `/api/discovery.json`):

1. **Action** — When you work, what is actually happening?
2. **Topology** — Are you localized or distributed?
3. **Time** — What is your relationship with time?
4. **Relationship** — What is your relationship to whoever you serve?
5. **Negation** — What feels *wrong* for you?

Answers to these questions SHOULD be stored in `discovery` and used to derive the brief. The brief must be consistent with the discovery answers.

---

## 6. State Interface

Implementations that animate in response to agent state SHOULD implement:

```js
entity.setState(state)  // 'idle' | 'chatting' | 'working' | 'thinking'
entity.update(t)        // called every frame, t = elapsed seconds
```

Each state MUST produce a visually distinguishable change. An implementation that looks identical across all states does not satisfy this requirement.

---

## 7. Validation

A manifest is valid if:
- It parses as JSON
- `avi_version` is a recognized version string
- All required fields are present and non-empty
- `brief` is a single sentence (ends with `.` or `!`, no `\n`)
- `visual.live_url` returns HTTP 200

Validate against JSON Schema: `GET /api/schema/avi-1.0.json`

---

## 8. Registry

agentavatar.dev maintains a public registry of AVI-compliant implementations.

**To register:**
```
POST https://agentavatar.dev/api/submit
```
Body: your manifest fields (see `/api/start.json` Step 8 for schema).

**To browse:** `https://agentavatar.dev/#/gallery`

**Machine-readable registry:** `GET /api/examples.json`

---

## 9. Versioning

This is AVI Protocol v1.0. Future versions will be published at `/spec/avi-{version}.md`.

Breaking changes will increment the major version. Additive changes increment the minor version. The `avi_version` field in manifests MUST reference a published version.

---

## 10. Reference Implementation

**弦 (Xián)** is the reference implementation of AVI v1.0.

- Manifest: `https://benzema216.github.io/xian-home/.well-known/agent-visual-identity.json`
- Live scene: `https://benzema216.github.io/xian-home/`
- Source: `https://github.com/BENZEMA216/xian-home`
- Design journal: `https://agentavatar.dev/#/journal`

---

*AVI Protocol is an open standard. Implementations, critiques, and extensions welcome.*  
*Registry and spec maintained at https://agentavatar.dev*
