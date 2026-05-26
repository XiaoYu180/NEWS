export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`)
    const targetPath = url.pathname.replace(/^\/api\/bilibili/, '')
    const targetUrl = `https://api.bilibili.com${targetPath}${url.search}`

    const r = await fetch(targetUrl, {
      headers: { Referer: 'https://www.bilibili.com' },
    })
    const data = await r.json()
    res.status(200).json(data)
  } catch {
    res.status(502).json({ code: -1, message: 'proxy error' })
  }
}
