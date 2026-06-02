import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

const nominatimFixture = {
  address: {
    city: 'Vitória',
    state: 'Espírito Santo',
    country: 'Brasil',
  },
};

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
    time: ['2024-01-15T10:00', '2024-01-15T11:00'],
    temperature_2m: [25.3, 26.0],
    weather_code: [1, 1],
    precipitation_probability: [10, 15],
  },
};

function mockFetchOk(data: unknown): void {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

function mockFetchNotOk(status = 503): void {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  } as unknown as Response);
}

function mockFetchTimeout(): void {
  vi.spyOn(globalThis, 'fetch').mockImplementationOnce(() => {
    const err = new Error('The operation was aborted');
    err.name = 'AbortError';
    return Promise.reject(err);
  });
}

function mockFetchNetworkError(): void {
  vi.spyOn(globalThis, 'fetch').mockImplementationOnce(() =>
    Promise.reject(new Error('network failure')),
  );
}

describe('GET /api/weather/search', () => {
  const app = createApp();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar 200 com lista de candidatos para query válida', async () => {
    mockFetchOk(geocodingFixture);

    const response = await request(app)
      .get('/api/weather/search')
      .query({ q: 'São Paulo' });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0].name).toBe('São Paulo');
    expect(response.body.results[0].countryCode).toBe('BR');
  });

  it('deve retornar 200 com results vazio quando cidade não encontrada', async () => {
    mockFetchOk({ results: [] });

    const response = await request(app)
      .get('/api/weather/search')
      .query({ q: 'CidadeXYZ' });

    expect(response.status).toBe(200);
    expect(response.body.results).toEqual([]);
  });

  it('deve retornar 400 quando query está ausente', async () => {
    const response = await request(app).get('/api/weather/search');

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('deve retornar 400 quando query tem menos de 2 caracteres', async () => {
    const response = await request(app)
      .get('/api/weather/search')
      .query({ q: 'a' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.error).toContain('2 caracteres');
  });

  it('deve retornar 502 quando o provedor está indisponível', async () => {
    mockFetchNotOk(503);

    const response = await request(app)
      .get('/api/weather/search')
      .query({ q: 'São Paulo' });

    expect(response.status).toBe(502);
    expect(response.body.code).toBe('UPSTREAM_ERROR');
  });

  it('deve retornar 504 quando o provedor excede o tempo limite', async () => {
    mockFetchTimeout();

    const response = await request(app)
      .get('/api/weather/search')
      .query({ q: 'São Paulo' });

    expect(response.status).toBe(504);
    expect(response.body.code).toBe('TIMEOUT');
  });

  it('deve retornar 502 com code NETWORK_ERROR em falha de rede genérica', async () => {
    mockFetchNetworkError();

    const response = await request(app)
      .get('/api/weather/search')
      .query({ q: 'São Paulo' });

    expect(response.status).toBe(502);
    expect(response.body.code).toBe('NETWORK_ERROR');
  });
});

describe('GET /api/weather', () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar 200 com WeatherResponse para coordenadas válidas', async () => {
    mockFetchNotOk(503); // Nominatim — absorvido silenciosamente
    mockFetchOk(forecastFixture);

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-23.55', lon: '-46.63' });

    expect(response.status).toBe(200);
    expect(response.body.current.temperature).toBe(25.3);
    expect(response.body.location.timezone).toBe('America/Sao_Paulo');
    expect(Array.isArray(response.body.hourly)).toBe(true);
  });

  it('deve incluir label na location quando fornecido', async () => {
    mockFetchOk(forecastFixture);

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-23.55', lon: '-46.63', label: 'São Paulo' });

    expect(response.status).toBe(200);
    expect(response.body.location.label).toBe('São Paulo');
  });

  it('deve usar label padrão quando label não fornecido e Nominatim falha', async () => {
    mockFetchNotOk(503); // Nominatim — absorvido silenciosamente
    mockFetchOk(forecastFixture);

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-23.55', lon: '-46.63' });

    expect(response.status).toBe(200);
    expect(response.body.location.label).toBe('Sua localização');
  });

  it('deve retornar 400 quando lat está ausente', async () => {
    const response = await request(app)
      .get('/api/weather')
      .query({ lon: '-46.63' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('deve retornar 400 quando lon está ausente', async () => {
    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-23.55' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('deve retornar 400 quando lat está fora do intervalo válido', async () => {
    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '91', lon: '0' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('deve retornar 400 quando lon está fora do intervalo válido', async () => {
    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '0', lon: '181' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('deve retornar 502 quando o provedor está indisponível', async () => {
    mockFetchNotOk(503); // Nominatim — absorvido silenciosamente
    mockFetchNotOk(500); // Open-Meteo — erro que propaga

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-23.55', lon: '-46.63' });

    expect(response.status).toBe(502);
    expect(response.body.code).toBe('UPSTREAM_ERROR');
  });

  it('deve retornar 504 quando o provedor excede o tempo limite', async () => {
    mockFetchNotOk(503); // Nominatim — absorvido silenciosamente
    mockFetchTimeout();  // Open-Meteo — timeout que propaga

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-23.55', lon: '-46.63' });

    expect(response.status).toBe(504);
    expect(response.body.code).toBe('TIMEOUT');
  });

  it('deve retornar 502 com code NETWORK_ERROR em falha de rede genérica', async () => {
    mockFetchNotOk(503);     // Nominatim — absorvido silenciosamente
    mockFetchNetworkError(); // Open-Meteo — network error que propaga

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-23.55', lon: '-46.63' });

    expect(response.status).toBe(502);
    expect(response.body.code).toBe('NETWORK_ERROR');
  });

  it('deve retornar location.label com nome resolvido quando Nominatim responde com sucesso', async () => {
    mockFetchOk(nominatimFixture); // Nominatim — sucesso
    mockFetchOk(forecastFixture);  // Open-Meteo — sucesso

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-20.32', lon: '-40.34' });

    expect(response.status).toBe(200);
    expect(response.body.location.label).toBe('Vitória, Espírito Santo, Brasil');
  });

  it('deve retornar location.label com DEFAULT_LOCATION_LABEL quando Nominatim retorna erro HTTP', async () => {
    mockFetchNotOk(503); // Nominatim — HTTP error
    mockFetchOk(forecastFixture);

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-20.32', lon: '-40.34' });

    expect(response.status).toBe(200);
    expect(response.body.location.label).toBe('Sua localização');
  });

  it('deve retornar location.label com DEFAULT_LOCATION_LABEL quando Nominatim excede o timeout', async () => {
    mockFetchTimeout();           // Nominatim — timeout
    mockFetchOk(forecastFixture); // Open-Meteo — sucesso

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-20.32', lon: '-40.34' });

    expect(response.status).toBe(200);
    expect(response.body.location.label).toBe('Sua localização');
  });

  it('deve preservar o label passado no query e não chamar Nominatim', async () => {
    mockFetchOk(forecastFixture); // apenas Open-Meteo deve ser chamado

    const response = await request(app)
      .get('/api/weather')
      .query({ lat: '-23.55', lon: '-46.63', label: 'São Paulo' });

    expect(response.status).toBe(200);
    expect(response.body.location.label).toBe('São Paulo');
  });
});
