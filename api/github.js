export default async function handler(req, res) {
  try {
    const subpath = req.query.__path || ''
    const params = new URLSearchParams(req.query)
    params.delete('__path')
    const qs = params.toString()

    const r = await fetch(`https://github.com/${subpath}${qs ? '?' + qs : ''}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: req.headers.accept || 'text/html',
        Referer: 'https://github.com/trending',
      },
    })

    const data = await r.text()
    res.setHeader('Content-Type', r.headers.get('content-type') || 'text/html; charset=utf-8')
    res.status(r.status).send(data)
  } catch {
    res.status(502).send('proxy error')
  }
}
