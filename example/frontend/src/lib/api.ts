import type { SearchResponse, WeatherResponse } from '../types/weather';

const BFF_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BFF_BASE_URL}${path}`, { signal });

  if (!response.ok) {
    let message = 'Serviço temporariamente indisponível. Tente novamente.';
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignora erros ao parsear body de erro
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function searchCities(
  q: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q });
  return request<SearchResponse>(`/api/weather/search?${params.toString()}`, signal);
}

export async function getWeather(
  lat: number,
  lon: number,
  label?: string,
  signal?: AbortSignal,
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    ...(label ? { label } : {}),
  });
  return request<WeatherResponse>(`/api/weather?${params.toString()}`, signal);
}
