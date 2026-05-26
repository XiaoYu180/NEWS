import { useQuery } from '@tanstack/react-query'
import { fetchItem } from '../api/hn'
import type { HNStory } from '../types'

export function useStory(id: number) {
  return useQuery({
    queryKey: ['story', id],
    queryFn: () => fetchItem<HNStory>(id),
    staleTime: 120_000,
    enabled: id > 0,
  })
}
