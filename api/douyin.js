export default async function handler(req, res) {
  try {
    const r = await fetch('https://api.xunjinlu.fun/api/rebang/douyin.php')
    const data = await r.json()
    res.status(200).json(data)
  } catch {
    res.status(502).json({ code: -1, message: 'proxy error' })
  }
}
