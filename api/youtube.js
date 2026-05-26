export default async function handler(req, res) {
  // CORS for local dev (localhost calls Vercel directly)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    const subpath = req.query.__path || ''
    const params = new URLSearchParams(req.query)
    params.delete('__path')
    const qs = params.toString()

    const r = await fetch(`https://pipedapi.kavin.rocks/${subpath}${qs ? '?' + qs : ''}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })
    const data = await r.json()
    res.status(200).json(data)
  } catch {
    res.status(502).json({ code: -1, message: 'proxy error' })
  }
}
