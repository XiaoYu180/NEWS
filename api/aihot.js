export default async function handler(req, res) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const rawSubpath = Array.isArray(req.query.__path) ? req.query.__path[0] : req.query.__path
    const subpath = String(rawSubpath || 'api/public/items').replace(/^\/+/, '')
    const params = new URLSearchParams(req.query)
    params.delete('__path')
    const qs = params.toString()
    const upstreamUrl = `https://aihot.virxact.com/${subpath}${qs ? '?' + qs : ''}`

    const r = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json,text/plain,*/*',
        Referer: 'https://aihot.virxact.com/',
      },
    })

    const contentType = r.headers.get('content-type') || 'application/json; charset=utf-8'
    const body = await r.text()
    res.setHeader('Content-Type', contentType)
    res.status(r.status).send(body)
  } catch (error) {
    res.status(error?.name === 'AbortError' ? 504 : 502).json({
      code: -1,
      message: 'proxy error',
      error: error?.message || String(error),
    })
  } finally {
    clearTimeout(timeoutId)
  }
}
