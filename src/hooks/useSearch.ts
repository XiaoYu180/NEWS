import { useQuery } from '@tanstack/react-query'
import { searchStories } from '../api/hn'

export function useSearch(query: string, page = 0) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => searchStories(query, page),
    staleTime: 120_000,
    enabled: query.length > 0,
  })
}
