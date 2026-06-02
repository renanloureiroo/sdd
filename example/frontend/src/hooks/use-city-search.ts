import { useQuery, queryOptions } from '@tanstack/react-query';
import { searchCities } from '../lib/api';
import { MIN_QUERY_LENGTH } from '../lib/constants';
import type { CityCandidate } from '../types/weather';
const STALE_TIME_MS = 2 * 60 * 1000;

function citySearchQueryOptions(query: string) {
  return queryOptions({
    queryKey: ['cities', 'search', query],
    queryFn: ({ signal }) => searchCities(query, signal),
    enabled: query.length >= MIN_QUERY_LENGTH,
    staleTime: STALE_TIME_MS,
    select: (data) => data.results,
  });
}

interface UseCitySearchResult {
  candidates: CityCandidate[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export function useCitySearch(query: string): UseCitySearchResult {
  const { data, isPending, isError, error } = useQuery(citySearchQueryOptions(query));

  return {
    candidates: data ?? [],
    isLoading: isPending && query.length >= MIN_QUERY_LENGTH,
    isError,
    errorMessage: isError ? (error?.message ?? 'Erro ao buscar cidades.') : null,
  };
}
