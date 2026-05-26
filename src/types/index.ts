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

export interface NewsSource {
  id: string
  name: string
  description: string
  color: string
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

export type StoryType = 'top' | 'new' | 'best' | 'show' | 'ask' | 'job'
