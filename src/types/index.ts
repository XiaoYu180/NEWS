export interface UnifiedStory {
  id: string
  title: string
  url?: string
  detailUrl: string
  by: string
  score: number
  comments: number
  time: number
}

export type CategoryId = 'finance' | 'entertainment' | 'tech' | 'music'

export interface CategoryInfo {
  id: CategoryId
  name: string
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'entertainment', name: '娱乐' },
  { id: 'tech', name: '技术' },
  { id: 'finance', name: '财经' },
  { id: 'music', name: '音乐' },
]

export const CATEGORY_MAP: Record<CategoryId, string> = {
  finance: '财经',
  entertainment: '娱乐',
  tech: '技术',
  music: '音乐',
}

export interface NewsSource {
  id: string
  name: string
  description: string
  color: string
  category: CategoryId
  fetchStories: () => Promise<UnifiedStory[]>
}

// --- HN types (preserved for detail page & search) ---

export interface HNStory {
  id: number
  by: string
  descendants: number
  kids?: number[]
  score: number
  time: number
  title: string
  type: 'story' | 'job' | 'ask' | 'show'
  url?: string
  text?: string
  dead?: boolean
  deleted?: boolean
}

export interface HNComment {
  id: number
  by: string
  kids?: number[]
  parent: number
  text?: string
  time: number
  type: 'comment'
  dead?: boolean
  deleted?: boolean
}

