import { useQuery, queryOptions } from '@tanstack/react-query';
import { getWeather } from '../lib/api';
import type { WeatherResponse } from '../types/weather';

const STALE_TIME_MS = 5 * 60 * 1000;

interface WeatherParams {
  lat: number;
  lon: number;
  label?: string;
}

function weatherQueryOptions(params: WeatherParams | null) {
  return queryOptions({
    queryKey: ['weather', params?.lat, params?.lon],
    queryFn: ({ signal }) => getWeather(params!.lat, params!.lon, params?.label, signal),
    enabled: params !== null,
    staleTime: STALE_TIME_MS,
  });
}

interface UseWeatherResult {
  data: WeatherResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;
}

export function useWeather(params: WeatherParams | null): UseWeatherResult {
  const { data, isPending, isError, error, refetch } = useQuery(weatherQueryOptions(params));

  return {
    data,
    isLoading: isPending && params !== null,
    isError,
    errorMessage: isError ? (error?.message ?? 'Erro ao buscar dados do clima.') : null,
    refetch,
  };
}
