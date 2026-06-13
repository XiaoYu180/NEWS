import { useQuery } from '@tanstack/react-query'
import type { NewsSource } from '../types'

export function useSource(source: NewsSource) {
  return useQuery({
    queryKey: ['source', source.id],
    queryFn: source.fetchStories,
    retry: source.id === 'github' ? false : undefined,
    staleTime: 120_000,
  })
}
