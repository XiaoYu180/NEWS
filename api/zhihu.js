export default async function handler(req, res) {
  try {
    const r = await fetch('https://www.zhihu.com/api/v4/creators/rank/hot?domain=0', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
        Referer: 'https://www.zhihu.com/',
      },
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch {
    res.status(502).json({ code: -1, message: 'proxy error' })
  }
}
