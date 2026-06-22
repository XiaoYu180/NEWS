import type { NewsSource, UnifiedStory } from '../types'

interface DouyinItem {
  rank: number
  title: string
  hot_value: number
  hot_label: string
  label: string
  url: string
}

interface AIHotItem {
  id: string
  title: string
  url: string
  source: string
  publishedAt: string
  summary: string | null
}

interface BilibiliItem {
  aid: number
  bvid: string
  title: string
  pubdate: number
  owner: { name: string }
  stat: { view: number; danmaku: number; reply: number }
  short_link_v2: string
}

interface QQMusicSong {
  singername: string
  songname: string
}

interface QQMusicTopItem {
  id: number
  listenCount: number
  topTitle: string
  songList: QQMusicSong[]
}

interface WangyiyunTrack {
  id: number
  name: string
  popularity: number
  artists: { name: string }[]
  album: { name: string }
}

interface ZhihuRankItem {
  question: {
    id: string | number
    title: string
    url: string
    updated_time?: number
    topics?: { name: string }[]
  }
  reaction?: {
    new_pv?: number
    pv?: number
    answer_num?: number
  }
}

function parseYicaiTime(text: string): number {
  if (!text) return Math.floor(Date.now() / 1000)
  if (text.includes('分钟前') || text.includes('小时前') || text.includes('昨天')) {
    return Math.floor(Date.now() / 1000)
  }

  const match = text.match(/(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/)
  if (!match) return Math.floor(Date.now() / 1000)

  const [, month, day, hour, minute] = match
  return Math.floor(
    new Date(new Date().getFullYear(), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime() / 1000,
  )
}

function parseYicaiHotStories(html: string): UnifiedStory[] {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('#hotest > a[href]'))

  return anchors.slice(0, 30).map((anchor, index) => {
    const href = anchor.getAttribute('href') ?? ''
    const id = href.match(/\/(?:vip\/)?(?:news|video)\/(\d+)\.html/)?.[1] ?? `${href}_${index}`
    const title = anchor.querySelector('h2')?.textContent?.trim() ?? ''
    const score = Number(anchor.querySelector('.news_hot')?.textContent?.trim() ?? 0)
    const comments = Number(anchor.querySelector('.news_comment')?.textContent?.trim() ?? 0)
    const metaTexts = Array.from(anchor.querySelectorAll('.rightspan span')).map((span) => span.textContent?.trim() ?? '')
    const timeText = metaTexts.find((text) => text && !/^\d+$/.test(text)) ?? ''
    const url = href.startsWith('http') ? href : `https://www.yicai.com${href}`

    return {
      id,
      title,
      url,
      detailUrl: url,
      by: '热榜',
      score,
      comments,
      time: parseYicaiTime(timeText),
    }
  }).filter((story) => story.title && story.url)
}

function parseCount(text: string): number {
  const cleaned = text.replace(/[,+]/g, '').trim()
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : 0
}

async function fetchWithTimeout(input: RequestInfo | URL, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function parseGithubTrendingStories(html: string): UnifiedStory[] {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const articles = Array.from(document.querySelectorAll<HTMLElement>('article.Box-row'))

  return articles.slice(0, 30).map((article) => {
    const anchor = article.querySelector<HTMLAnchorElement>('h2 a[href^="/"]')
    const href = anchor?.getAttribute('href') ?? ''
    const repoPath = href.replace(/^\//, '')
    const title = anchor?.textContent?.replace(/\s+/g, '') ?? repoPath
    const language = article.querySelector('[itemprop="programmingLanguage"]')?.textContent?.trim() || 'Code'
    const weeklyStars = parseCount(article.textContent?.match(/([\d,]+)\s+stars?\s+this week/i)?.[1] ?? '0')
    const forkAnchors = Array.from(article.querySelectorAll<HTMLAnchorElement>('a[href$="/forks"]'))
    const forkAnchor = forkAnchors[forkAnchors.length - 1]
    const forks = parseCount(forkAnchor?.textContent ?? '0')
    const url = `https://github.com/${repoPath}`

    return {
      id: repoPath,
      title,
      url,
      detailUrl: url,
      by: language,
      score: weeklyStars,
      comments: forks,
      time: Math.floor(Date.now() / 1000),
    }
  }).filter((story) => story.id && story.score > 0)
}

// --- fetch functions ---

async function fetchDouyinStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/douyin')
  if (!res.ok) throw new Error('获取抖音热点失败')
  const json = await res.json()
  if (json.code !== 200 || !json.data?.list) throw new Error('抖音数据异常')
  const items: DouyinItem[] = json.data.list.slice(0, 30)
  return items.map((item, i) => ({
    id: String(item.rank) + '_' + i,
    title: item.title,
    url: item.url,
    detailUrl: item.url,
    by: item.label || '热',
    score: item.hot_value,
    comments: 0,
    time: Math.floor(Date.now() / 1000),
  }))
}

async function fetchWeiboStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/weibo')
  if (!res.ok) throw new Error('获取微博热搜失败')
  const json = await res.json()
  if (json.code !== 200 || !json.data?.list) throw new Error('微博数据异常')
  const items: DouyinItem[] = json.data.list.slice(0, 30)
  return items.map((item, i) => ({
    id: String(item.rank) + '_' + i,
    title: item.title,
    url: item.url,
    detailUrl: item.url,
    by: item.label || '热',
    score: item.hot_value,
    comments: 0,
    time: Math.floor(Date.now() / 1000),
  }))
}

async function fetchBaiduStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/baidu')
  if (!res.ok) throw new Error('获取百度热搜失败')
  const json = await res.json()
  if (json.code !== 200 || !json.data?.list) throw new Error('百度数据异常')
  const items: DouyinItem[] = json.data.list.slice(0, 30)
  return items.map((item) => ({
    id: String(item.rank),
    title: item.title,
    url: item.url,
    detailUrl: item.url,
    by: item.label || '热',
    score: item.hot_value,
    comments: 0,
    time: Math.floor(Date.now() / 1000),
  }))
}

async function fetchZhihuStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/zhihu')
  if (!res.ok) throw new Error('获取知乎热榜失败')
  const json = await res.json()

  if (Array.isArray(json.data)) {
    const items: ZhihuRankItem[] = json.data.slice(0, 30)
    return items.map((item, i) => {
      const question = item.question
      return {
        id: String(question.id ?? i),
        title: question.title,
        url: question.url,
        detailUrl: question.url,
        by: question.topics?.[0]?.name || '热榜',
        score: item.reaction?.new_pv ?? item.reaction?.pv ?? 0,
        comments: item.reaction?.answer_num ?? 0,
        time: question.updated_time ?? Math.floor(Date.now() / 1000),
      }
    }).filter((story) => story.title && story.url)
  }

  if (json.code !== 200 || !json.data?.list) throw new Error('知乎数据异常')
  const items: DouyinItem[] = json.data.list.slice(0, 30)
  return items.map((item, i) => ({
    id: String(item.rank) + '_' + i,
    title: item.title,
    url: item.url,
    detailUrl: item.url,
    by: '热',
    score: item.hot_value || item.rank * 100000,
    comments: 0,
    time: Math.floor(Date.now() / 1000),
  }))
}

async function fetchBilibiliStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/bilibili/x/web-interface/popular')
  if (!res.ok) throw new Error('获取B站热榜失败')
  const json = await res.json()
  if (json.code !== 0 || !json.data?.list) throw new Error('B站数据异常')
  const items: BilibiliItem[] = json.data.list.slice(0, 30)
  return items.map((item) => ({
    id: String(item.aid),
    title: item.title,
    url: item.short_link_v2 || `https://www.bilibili.com/video/${item.bvid}`,
    detailUrl: item.short_link_v2 || `https://www.bilibili.com/video/${item.bvid}`,
    by: item.owner.name,
    score: item.stat.view,
    comments: item.stat.danmaku + item.stat.reply,
    time: item.pubdate,
  }))
}

async function fetchGithubStories(): Promise<UnifiedStory[]> {
  let res: Response
  try {
    res = await fetchWithTimeout('/api/github/trending?since=weekly', 8000)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('获取 GitHub 热榜超时')
    }
    throw error
  }

  if (!res.ok) throw new Error('获取 GitHub 热榜失败')
  const html = await res.text()
  const stories = parseGithubTrendingStories(html)
  if (stories.length === 0) throw new Error('GitHub weekly trending 解析失败')
  return stories
}

async function fetchQQMusicStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/qqmusic/v8/fcg-bin/fcg_myqq_toplist.fcg?format=json')
  if (!res.ok) throw new Error('获取QQ音乐热榜失败')
  const json = await res.json()
  const topList: QQMusicTopItem[] = json.data?.topList ?? []
  // Flatten songs from all top lists, dedupe by song name
  const seen = new Set<string>()
  const songs: UnifiedStory[] = []
  for (const list of topList) {
    for (const song of list.songList) {
      const key = `${song.songname}-${song.singername}`
      if (seen.has(key)) continue
      seen.add(key)
      songs.push({
        id: key,
        title: song.songname,
        url: `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(song.songname + ' ' + song.singername)}`,
        detailUrl: `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(song.songname + ' ' + song.singername)}`,
        by: song.singername,
        score: list.listenCount,
        comments: 0,
        time: Math.floor(Date.now() / 1000),
      })
    }
  }
  return songs.slice(0, 30)
}

async function fetchWangyiyunStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/wangyiyun/api/playlist/detail?id=3778678')
  if (!res.ok) throw new Error('获取网易云音乐热榜失败')
  const json = await res.json()
  if (json.code !== 200) throw new Error('网易云数据异常')
  const tracks: WangyiyunTrack[] = json.result?.tracks ?? []
  return tracks.slice(0, 30).map((track) => ({
    id: String(track.id),
    title: track.name,
    url: `https://music.163.com/song?id=${track.id}`,
    detailUrl: `https://music.163.com/song?id=${track.id}`,
    by: track.artists.map((a) => a.name).join('/'),
    score: track.popularity,
    comments: 0,
    time: Math.floor(Date.now() / 1000),
  }))
}

async function fetchAIHotStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/aihot/api/public/items?mode=selected&take=30')
  if (!res.ok) throw new Error('获取 AI 动态失败')
  const json = await res.json()
  const items: AIHotItem[] = json.items ?? []
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    detailUrl: item.url,
    by: item.source,
    score: 0,
    comments: 0,
    time: Math.floor(new Date(item.publishedAt).getTime() / 1000),
  }))
}

async function fetchWallstreetcnStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/wallstreetcn/apiv1/content/articles/hot?period=all')
  if (!res.ok) throw new Error('获取华尔街见闻失败')
  const json = await res.json()
  if (json.code !== 20000) throw new Error('华尔街见闻数据异常')
  const hotItems = [...(json.data?.day_items ?? []), ...(json.data?.week_items ?? [])]
  const uniqueItems = hotItems.filter(
    (item: any, index: number, items: any[]) => items.findIndex((candidate: any) => candidate.id === item.id) === index,
  )
  return uniqueItems.slice(0, 30).map((item: any) => ({
    id: String(item.id),
    title: item.title,
    url: item.uri || `https://wallstreetcn.com/articles/${item.id}`,
    detailUrl: item.uri || `https://wallstreetcn.com/articles/${item.id}`,
    by: '热文',
    score: item.pageviews ?? 0,
    comments: item.comment_count ?? 0,
    time: item.display_time ?? Math.floor(Date.now() / 1000),
  }))
}

async function fetchYicaiStories(): Promise<UnifiedStory[]> {
  const res = await fetch('/api/yicai/')
  if (!res.ok) throw new Error('获取第一财经失败')
  const html = await res.text()
  const stories = parseYicaiHotStories(html)
  if (stories.length === 0) throw new Error('第一财经热榜解析失败')
  return stories
}

export const newsSources: NewsSource[] = [
  {
    id: 'weibo',
    name: '微博热搜',
    description: '实时热搜榜',
    color: '#f97316',
    category: 'entertainment',
    fetchStories: fetchWeiboStories,
  },
  {
    id: 'douyin',
    name: '抖音热点',
    description: '实时热搜榜',
    color: '#ff2d55',
    category: 'entertainment',
    fetchStories: fetchDouyinStories,
  },
  {
    id: 'baidu',
    name: '百度热搜',
    description: '实时热搜榜',
    color: '#2932e1',
    category: 'entertainment',
    fetchStories: fetchBaiduStories,
  },
  {
    id: 'bilibili',
    name: 'B站热榜',
    description: '全站热门视频',
    color: '#10b981',
    category: 'entertainment',
    fetchStories: fetchBilibiliStories,
  },
  {
    id: 'zhihu',
    name: '知乎热榜',
    description: '实时热议话题',
    color: '#0066ff',
    category: 'entertainment',
    fetchStories: fetchZhihuStories,
  },
  {
    id: 'github',
    name: 'GitHub 热榜',
    description: '近 7 日 Star 增长',
    color: '#6e7681',
    category: 'tech',
    fetchStories: fetchGithubStories,
  },
  {
    id: 'aihot',
    name: 'AI 动态',
    description: 'AI 领域最新资讯',
    color: '#10a37f',
    category: 'tech',
    fetchStories: fetchAIHotStories,
  },
  {
    id: 'wallstreetcn',
    name: '华尔街见闻',
    description: '24小时热文榜',
    color: '#d97706',
    category: 'finance',
    fetchStories: fetchWallstreetcnStories,
  },
  {
    id: 'yicai',
    name: '第一财经',
    description: '财经热榜',
    color: '#0f766e',
    category: 'finance',
    fetchStories: fetchYicaiStories,
  },
  {
    id: 'wangyiyun',
    name: '网易云音乐',
    description: '热歌榜',
    color: '#c62f2f',
    category: 'music',
    fetchStories: fetchWangyiyunStories,
  },
  {
    id: 'qqmusic',
    name: 'QQ音乐',
    description: '巅峰榜',
    color: '#31c27c',
    category: 'music',
    fetchStories: fetchQQMusicStories,
  },
]
