export default async function handler(req, res) {
  try {
    const subpath = req.query.__path || ''
    const params = new URLSearchParams(req.query)
    params.delete('__path')
    const qs = params.toString()

    const r = await fetch(`https://www.yicai.com/${subpath}${qs ? '?' + qs : ''}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: req.headers.accept || 'application/json, text/html',
        Referer: 'https://www.yicai.com/',
      },
    })

    const contentType = r.headers.get('content-type') || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)

    if (contentType.includes('application/json')) {
      const data = await r.json()
      res.status(r.status).json(data)
      return
    }

    const data = await r.text()
    res.status(r.status).send(data)
  } catch {
    res.status(502).send('proxy error')
  }
}
