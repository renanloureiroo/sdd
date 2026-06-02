import { REQUEST_TIMEOUT_MS } from '../config';

export class UpstreamError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}

export interface HttpGetOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export async function httpGet(url: string, options?: HttpGetOptions): Promise<unknown> {
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: options?.headers,
    });

    if (!response.ok) {
      console.error(
        `[http]: upstream returned non-OK status=${response.status}`,
      );
      throw new UpstreamError(
        'Serviço meteorológico indisponível',
        502,
        'UPSTREAM_ERROR',
      );
    }

    return response.json() as Promise<unknown>;
  } catch (err) {
    if (err instanceof UpstreamError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[http]: request timed out');
      throw new UpstreamError(
        'Tempo limite excedido ao consultar o serviço meteorológico',
        504,
        'TIMEOUT',
      );
    }

    console.error('[http]: network error', err);
    throw new UpstreamError(
      'Falha de rede ao consultar o serviço meteorológico',
      502,
      'NETWORK_ERROR',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
