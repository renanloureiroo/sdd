import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from './error-handler';
import { UpstreamError } from '../lib/http';

function makeRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, json, status };
}

describe('errorHandler', () => {
  const req = {} as Request;
  const next = vi.fn() as unknown as NextFunction;

  it('deve mapear UpstreamError para o status e code corretos', () => {
    const { res, status, json } = makeRes();
    const err = new UpstreamError('Serviço indisponível', 502, 'UPSTREAM_ERROR');

    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(502);
    expect(json).toHaveBeenCalledWith({ error: 'Serviço indisponível', code: 'UPSTREAM_ERROR' });
  });

  it('deve retornar 500 com mensagem do Error quando err é instância de Error', () => {
    const { res, status, json } = makeRes();

    errorHandler(new Error('boom'), req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' });
  });

  it('deve retornar 500 com mensagem genérica quando err não é instância de Error', () => {
    const { res, status, json } = makeRes();

    errorHandler('erro em string', req, res, next);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' });
  });
});
