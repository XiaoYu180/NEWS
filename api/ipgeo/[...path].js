export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`)
    const targetPath = url.pathname.replace(/^\/api\/ipgeo/, '')
    const targetUrl = `https://ipapi.co${targetPath}${url.search}`

    const r = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })
    const data = await r.json()
    res.status(200).json(data)
  } catch {
    res.status(502).json({ code: -1, message: 'proxy error' })
  }
}
