export async function fetchStoryIds(type: string): Promise<number[]> {
  const res = await fetch(`https://hacker-news.firebaseio.com/v0/${type}stories.json`)
  if (!res.ok) throw new Error('获取新闻列表失败')
  return res.json()
}

export async function fetchItem<T>(id: number): Promise<T> {
  const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
  if (!res.ok) throw new Error('获取内容失败')
  return res.json()
}

export async function searchStories(query: string, page = 0) {
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&page=${page}&hitsPerPage=30`,
  )
  if (!res.ok) throw new Error('搜索失败')
  return res.json()
}

export function getHostname(url: string | undefined): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return `${seconds}秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}个月前`
  return `${Math.floor(months / 12)}年前`
}
