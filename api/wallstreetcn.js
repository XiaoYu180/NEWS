export default async function handler(req, res) {
  try {
    const subpath = req.query.__path || ''
    const params = new URLSearchParams(req.query)
    params.delete('__path')
    const qs = params.toString()

    const r = await fetch(`https://api.wallstreetcn.com/${subpath}${qs ? '?' + qs : ''}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
        Referer: 'https://wallstreetcn.com/',
      },
    })
    const data = await r.json()
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.status(200).json(data)
  } catch {
    res.status(502).send('proxy error')
  }
}
