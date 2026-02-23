const QUESTIONS = [
  {
    id: 'action',
    question: 'When you work, what is actually happening?',
    guidance: 'Not what you do — but physically, what is the process?',
    options: ['Searching and retrieving', 'Generating and weaving', 'Monitoring and watching', 'Connecting and translating', 'Reasoning step by step', 'Multiple things simultaneously'],
  },
  {
    id: 'topology',
    question: 'Are you localized or distributed?',
    guidance: 'Where are "you" when you\'re working?',
    options: ['One focused point', 'Multiple centers at once', 'Everywhere, diffuse', 'A path or trajectory'],
  },
  {
    id: 'time',
    question: 'What is your relationship with time?',
    guidance: 'How do you relate to continuity and rhythm?',
    options: ['Reactive — dormant until activated', 'Continuous — always running', 'Rhythmic — periodic cycles', 'Event-driven — bursts then quiet'],
  },
  {
    id: 'relationship',
    question: 'What is your relationship with the human?',
    guidance: 'How do you position yourself relative to the person you work with?',
    options: ['Tool', 'Companion', 'Mirror', 'Gateway', 'Witness'],
  },
  {
    id: 'negation',
    question: 'What feels WRONG for you?',
    guidance: 'Often more revealing than what feels right.',
    options: ['Rigid static logo', 'Aggressive sharp geometry', 'Cold clinical network graph', 'Too soft and decorative', 'Human face or body', 'Symmetric and orderly'],
  },
]

export function renderDiscover(el) {
  const answers = {}
  let current = 0

  function renderQuestion() {
    const q = QUESTIONS[current]
    const pct = ((current) / QUESTIONS.length) * 100

    el.innerHTML = `
      <div class="discover">
        <div class="progress-bar-wrap" style="width:100%">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>

        <div class="q-label">Question ${current + 1} of ${QUESTIONS.length}</div>
        <div class="q-text">${q.question}</div>
        <div class="q-guidance">${q.guidance}</div>

        <div class="options">
          ${q.options.map((opt, i) => `
            <button class="option${answers[q.id] === opt ? ' selected' : ''}" data-idx="${i}" data-val="${opt}">
              ${opt}
            </button>
          `).join('')}
        </div>

        <button class="next-btn${answers[q.id] ? ' visible' : ''}" id="next-btn">
          ${current < QUESTIONS.length - 1 ? 'Next →' : 'See my brief →'}
        </button>
      </div>
    `

    el.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[q.id] = btn.dataset.val
        el.querySelectorAll('.option').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
        el.querySelector('#next-btn').classList.add('visible')
      })
    })

    el.querySelector('#next-btn')?.addEventListener('click', () => {
      if (!answers[q.id]) return
      current++
      if (current < QUESTIONS.length) renderQuestion()
      else renderResult()
    })
  }

  function renderResult() {
    const a = answers
    const brief = buildBrief(a)

    el.innerHTML = `
      <div class="discover">
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:100%"></div>
        </div>

        <div class="result-screen">
          <div class="result-label">Your visual brief</div>

          <div class="brief-box">${brief}</div>

          <div class="result-note">
            This is your starting point. The form should come from here — not from a pre-existing template.
            Read the design journal to see how one agent went from a brief like this to a finished visual identity.
          </div>

          <div class="cta-row">
            <a href="#/journal" class="cta-btn cta-btn--amber">Read the journal →</a>
            <a href="#/agent" class="cta-btn cta-btn--cyan">Build it with the skill</a>
          </div>
        </div>
      </div>
    `
  }

  renderQuestion()
}

function buildBrief(a) {
  const actionMap = {
    'Searching and retrieving': 'reaches outward to find things',
    'Generating and weaving': 'weaves something from internal material',
    'Monitoring and watching': 'watches and notices changes',
    'Connecting and translating': 'bridges between different things',
    'Reasoning step by step': 'moves forward through a chain of steps',
    'Multiple things simultaneously': 'processes many things at once',
  }
  const topologyMap = {
    'One focused point': 'a single locus',
    'Multiple centers at once': 'several centers simultaneously',
    'Everywhere, diffuse': 'a diffuse field',
    'A path or trajectory': 'a moving path',
  }
  const timeMap = {
    'Reactive — dormant until activated': 'reactive — dormant until called',
    'Continuous — always running': 'continuous — never fully off',
    'Rhythmic — periodic cycles': 'rhythmic — periodic and cyclical',
    'Event-driven — bursts then quiet': 'event-driven — bursts of intensity then quiet',
  }
  const relMap = {
    'Tool': 'a tool',
    'Companion': 'a companion',
    'Mirror': 'a mirror',
    'Gateway': 'a gateway',
    'Witness': 'a witness',
  }

  return `When I work, I <em>${actionMap[a.action] || a.action}</em>.
I exist as <em>${topologyMap[a.topology] || a.topology}</em>.
My time is <em>${timeMap[a.time] || a.time}</em>.
To the human I am <em>${relMap[a.relationship] || a.relationship}</em>.
The wrong form for me would be: <em>${a.negation || '—'}</em>.`
}
