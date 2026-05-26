import type { NewsSource, UnifiedStory } from '../types'

interface DouyinItem {
  rank: number
  title: string
  hot_value: number
  hot_label: string
  label: string
  url: string
}

interface GithubRepo {
  id: number
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  owner: { login: string }
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
  const res = await fetch('https://api.github.com/search/repositories?q=stars:%3E1000&sort=stars&order=desc&per_page=30')
  if (!res.ok) throw new Error('获取 GitHub 热榜失败')
  const json = await res.json()
  const items: GithubRepo[] = json.items ?? []
  return items.map((item) => ({
    id: String(item.id),
    title: item.full_name,
    url: item.html_url,
    detailUrl: item.html_url,
    by: item.language || 'Code',
    score: item.stargazers_count,
    comments: item.forks_count,
    time: 0,
  }))
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

export const newsSources: NewsSource[] = [
  {
    id: 'douyin',
    name: '抖音热点',
    description: '实时热搜榜',
    color: '#ff2d55',
    fetchStories: fetchDouyinStories,
  },
  {
    id: 'weibo',
    name: '微博热搜',
    description: '实时热搜榜',
    color: '#f97316',
    fetchStories: fetchWeiboStories,
  },
  {
    id: 'baidu',
    name: '百度热搜',
    description: '实时热搜榜',
    color: '#2932e1',
    fetchStories: fetchBaiduStories,
  },
  {
    id: 'zhihu',
    name: '知乎热榜',
    description: '实时热议话题',
    color: '#0066ff',
    fetchStories: fetchZhihuStories,
  },
  {
    id: 'bilibili',
    name: 'B站热榜',
    description: '全站热门视频',
    color: '#10b981',
    fetchStories: fetchBilibiliStories,
  },
  {
    id: 'wangyiyun',
    name: '网易云音乐',
    description: '热歌榜',
    color: '#c62f2f',
    fetchStories: fetchWangyiyunStories,
  },
  {
    id: 'qqmusic',
    name: 'QQ音乐',
    description: '巅峰榜',
    color: '#31c27c',
    fetchStories: fetchQQMusicStories,
  },
  {
    id: 'github',
    name: 'GitHub 热榜',
    description: '热门开源项目',
    color: '#6e7681',
    fetchStories: fetchGithubStories,
  },
  {
    id: 'aihot',
    name: 'AI 动态',
    description: 'AI 领域最新资讯',
    color: '#10a37f',
    fetchStories: fetchAIHotStories,
  },
]
