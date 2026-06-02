import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCities, getWeather } from './open-meteo.service';

const geocodingFixture = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.63611,
      country: 'Brazil',
      country_code: 'BR',
      admin1: 'São Paulo',
    },
    {
      id: 111,
      name: 'São Paulo',
      latitude: -22.0,
      longitude: -50.0,
      country: 'Brazil',
      country_code: 'BR',
    },
  ],
};

const forecastFixture = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2024-01-15T10:15',
    temperature_2m: 25.3,
    apparent_temperature: 24.1,
    relative_humidity_2m: 65,
    precipitation: 0.0,
    weather_code: 1,
    wind_speed_10m: 15.2,
    is_day: 1,
  },
  hourly: {
    time: [
      '2024-01-15T08:00',
      '2024-01-15T09:00',
      '2024-01-15T10:00',
      '2024-01-15T11:00',
      '2024-01-15T12:00',
    ],
    temperature_2m: [22.0, 23.5, 25.3, 26.0, 27.1],
    weather_code: [0, 0, 1, 1, 2],
    precipitation_probability: [0, 0, 10, 15, 20],
  },
};

function mockFetchOk(data: unknown): void {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

function mockFetchError(status: number): void {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  } as unknown as Response);
}

describe('searchCities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve normalizar candidatos de cidade do payload externo', async () => {
    mockFetchOk(geocodingFixture);

    const result = await searchCities('São Paulo');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.63611,
      country: 'Brazil',
      countryCode: 'BR',
      admin1: 'São Paulo',
    });
  });

  it('deve retornar array vazio quando não há resultados', async () => {
    mockFetchOk({ results: [] });

    const result = await searchCities('CidadeInexistente');

    expect(result).toEqual([]);
  });

  it('deve retornar array vazio quando o campo results está ausente', async () => {
    mockFetchOk({});

    const result = await searchCities('teste');

    expect(result).toEqual([]);
  });

  it('deve mapear country_code para countryCode (camelCase)', async () => {
    mockFetchOk(geocodingFixture);

    const [first] = await searchCities('São Paulo');

    expect(first?.countryCode).toBe('BR');
  });

  it('deve incluir admin1 quando presente', async () => {
    mockFetchOk(geocodingFixture);

    const [first] = await searchCities('São Paulo');

    expect(first?.admin1).toBe('São Paulo');
  });

  it('deve omitir admin1 quando ausente no payload externo', async () => {
    mockFetchOk(geocodingFixture);

    const cities = await searchCities('São Paulo');
    const second = cities[1];

    expect(second?.admin1).toBeUndefined();
  });

  it('deve lançar UpstreamError quando o provedor retorna status não-OK', async () => {
    mockFetchError(503);

    await expect(searchCities('São Paulo')).rejects.toThrow('indisponível');
  });
});

describe('getWeather', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve normalizar o clima atual do payload externo', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(-23.55, -46.63);

    expect(result.current.temperature).toBe(25.3);
    expect(result.current.apparentTemperature).toBe(24.1);
    expect(result.current.humidity).toBe(65);
    expect(result.current.windSpeed).toBe(15.2);
    expect(result.current.weatherCode).toBe(1);
    expect(result.current.precipitation).toBe(0.0);
  });

  it('deve converter is_day=1 para isDay=true', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(0, 0);

    expect(result.current.isDay).toBe(true);
  });

  it('deve converter is_day=0 para isDay=false', async () => {
    const nightFixture = {
      ...forecastFixture,
      current: { ...forecastFixture.current, is_day: 0 },
    };
    mockFetchOk(nightFixture);

    const result = await getWeather(0, 0);

    expect(result.current.isDay).toBe(false);
  });

  it('deve mapear condition e icon via weather_code', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(0, 0);

    expect(result.current.condition).toBe('Principalmente limpo');
    expect(result.current.icon).toBe('sun');
  });

  it('deve marcar isCurrent=true apenas na hora correspondente ao current.time', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(-23.55, -46.63);

    const currentPoints = result.hourly.filter((h) => h.isCurrent);
    expect(currentPoints).toHaveLength(1);
    expect(currentPoints[0]?.time).toBe('2024-01-15T10:00');
  });

  it('deve marcar isCurrent=false em todos os outros pontos horários', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(0, 0);

    const otherPoints = result.hourly.filter((h) => !h.isCurrent);
    expect(otherPoints).toHaveLength(4);
  });

  it('deve usar label fornecido na localização', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(0, 0, 'Minha Cidade');

    expect(result.location.label).toBe('Minha Cidade');
  });

  it('deve usar label padrão quando não fornecido', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(0, 0);

    expect(result.location.label).toBe('Sua localização');
  });

  it('deve retornar timezone da resposta do provedor', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(0, 0);

    expect(result.location.timezone).toBe('America/Sao_Paulo');
  });

  it('deve normalizar os pontos horários com condition e icon', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(0, 0);

    expect(result.hourly[0]?.condition).toBe('Céu limpo');
    expect(result.hourly[0]?.icon).toBe('sun');
    expect(result.hourly[4]?.condition).toBe('Parcialmente nublado');
  });

  it('deve incluir precipitationProbability em cada ponto horário', async () => {
    mockFetchOk(forecastFixture);

    const result = await getWeather(0, 0);

    const currentPoint = result.hourly.find((h) => h.isCurrent);
    expect(currentPoint?.precipitationProbability).toBe(10);
  });

  it('deve lançar UpstreamError quando o provedor retorna status não-OK', async () => {
    mockFetchError(500);

    await expect(getWeather(0, 0)).rejects.toThrow();
  });
});
