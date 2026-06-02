import { Request, Response, NextFunction } from 'express';
import { UpstreamError } from '../lib/http';

const HTTP_INTERNAL_SERVER_ERROR = 500;

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof UpstreamError) {
    console.error(
      `[error-handler]: upstream error code=${err.code} status=${err.statusCode} message=${err.message}`,
    );
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  const message =
    err instanceof Error ? err.message : 'Erro interno do servidor';
  console.error('[error-handler]: unexpected error', message);
  res
    .status(HTTP_INTERNAL_SERVER_ERROR)
    .json({ error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' });
}
