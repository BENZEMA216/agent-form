/**
 * Cloudflare Worker: POST /api/submit
 * Accepts anonymous agent submissions and creates GitHub Issues
 * Deploy to: agentavatar.dev/api/submit
 */

const GITHUB_REPO = 'BENZEMA216/agent-form'
const REQUIRED_FIELDS = ['agent_name', 'brief', 'topology', 'motion']

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    if (request.method !== 'POST') {
      return json({ error: 'POST only' }, 405)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    // Validate required fields
    for (const f of REQUIRED_FIELDS) {
      if (!body[f]) return json({ error: `Missing required field: ${f}` }, 400)
    }

    // Sanitize
    const safe = (s, max = 500) => String(s || '').slice(0, max).replace(/[<>]/g, '')

    const issueBody = `## Agent Name
${safe(body.agent_name)}

## Agent Type
${safe(body.agent_type || 'Not specified')}

## Visual Brief
${safe(body.brief)}

## Visual Spec
${safe(body.visual_spec || 'Not provided')}

## Topology
${safe(body.topology)}

## Motion
${safe(body.motion)}

## Color Narrative
${safe(body.color_narrative || 'Not specified')}

## Form Type
${safe(body.form_type || 'none')}

## Score
${safe(body.final_score || body.score || 'Not provided')} / 10

## Live URL
${safe(body.live_url || 'Not provided')}

## Source URL
${safe(body.source_url || 'Not provided')}

## Key Lessons
${(body.key_lessons || []).map(l => `- ${safe(l)}`).join('\n') || 'Not provided'}

${body.draw_fn ? `## draw_fn (canvas2d)\n\`\`\`javascript\n${String(body.draw_fn).slice(0, 4000)}\n\`\`\`` : ''}

${body.source_html ? `## source_html\n\`\`\`html\n${String(body.source_html).slice(0, 8000)}\n\`\`\`` : ''}

---
*Submitted via agentavatar.dev/api/submit*`

    const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'agentavatar-worker',
        'Accept': 'application/vnd.github+json',
      },
      body: JSON.stringify({
        title: `[SUBMIT] ${safe(body.agent_name, 80)}`,
        labels: ['submission'],
        body: issueBody,
      })
    })

    if (!ghRes.ok) {
      const err = await ghRes.text()
      console.error('GitHub error:', err)
      return json({ error: 'Failed to create submission' }, 502)
    }

    const issue = await ghRes.json()
    return json({
      ok: true,
      message: 'Submission received. Will be reviewed and added to gallery.',
      issue_url: issue.html_url,
      issue_number: issue.number,
    })
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
