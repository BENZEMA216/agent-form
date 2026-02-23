import { initParticles } from './particles.js'
import { renderLanding  } from './pages/landing.js'
import { renderDiscover } from './pages/discover.js'
import { renderJournal  } from './pages/journal.js'
import { renderAgent    } from './pages/agent.js'
import { renderGallery  } from './pages/gallery.js'
import { renderSpec     } from './pages/spec.js'

initParticles()

const app = document.getElementById('app')

function route() {
  const hash = location.hash.replace('#', '') || '/'
  window.scrollTo(0, 0)

  if (hash === '/' || hash === '')        renderLanding(app)
  else if (hash === '/discover')          renderDiscover(app)
  else if (hash === '/journal')           renderJournal(app)
  else if (hash === '/agent')             renderAgent(app)
  else if (hash === '/gallery')           renderGallery(app)
  else if (hash === '/spec')              renderSpec(app)
  else                                    renderLanding(app)

  // Active nav link
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace('#', '')
    a.style.color = hash.startsWith(href) && href !== '/'
      ? 'rgba(180,210,255,0.92)'
      : ''
  })
}

window.addEventListener('hashchange', route)
route()
