import { describe, it, expect, vi, afterEach } from 'vitest';
import { reverseGeocode } from './nominatim.service';

const nominatimFixture = {
  address: {
    city: 'Vitória',
    state: 'Espírito Santo',
    country: 'Brasil',
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

describe('reverseGeocode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar label formatado quando Nominatim responde com city, state e country', async () => {
    mockFetchOk(nominatimFixture);

    const result = await reverseGeocode(-20.32, -40.34);

    expect(result).toBe('Vitória, Espírito Santo, Brasil');
  });

  it('deve usar town quando city está ausente', async () => {
    mockFetchOk({
      address: {
        town: 'Domingos Martins',
        state: 'Espírito Santo',
        country: 'Brasil',
      },
    });

    const result = await reverseGeocode(-20.32, -40.34);

    expect(result).toBe('Domingos Martins, Espírito Santo, Brasil');
  });

  it('deve usar village quando city e town estão ausentes', async () => {
    mockFetchOk({
      address: {
        village: 'Santa Leopoldina',
        state: 'Espírito Santo',
        country: 'Brasil',
      },
    });

    const result = await reverseGeocode(-20.32, -40.34);

    expect(result).toBe('Santa Leopoldina, Espírito Santo, Brasil');
  });

  it('deve retornar null quando nenhum campo de cidade está presente na resposta', async () => {
    mockFetchOk({
      address: {
        state: 'Espírito Santo',
        country: 'Brasil',
      },
    });

    const result = await reverseGeocode(-20.32, -40.34);

    expect(result).toBeNull();
  });

  it('deve retornar null quando Nominatim retorna status HTTP de erro (4xx/5xx)', async () => {
    mockFetchNotOk(503);

    const result = await reverseGeocode(-20.32, -40.34);

    expect(result).toBeNull();
  });

  it('deve retornar null quando a chamada excede o timeout (AbortError)', async () => {
    mockFetchTimeout();

    const result = await reverseGeocode(-20.32, -40.34);

    expect(result).toBeNull();
  });

  it('deve retornar null quando a resposta não contém o campo address', async () => {
    mockFetchOk({});

    const result = await reverseGeocode(-20.32, -40.34);

    expect(result).toBeNull();
  });

  it('deve retornar null em falha de rede genérica (NetworkError)', async () => {
    mockFetchNetworkError();

    const result = await reverseGeocode(-20.32, -40.34);

    expect(result).toBeNull();
  });
});
