import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

const HTTP_OK = 200;

describe('GET /health', () => {
  it('deve retornar 200 com status healthy', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(HTTP_OK);
    expect(response.body.status).toBe('healthy');
  });

  it('deve retornar um timestamp ISO válido', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(typeof response.body.timestamp).toBe('string');
    expect(new Date(response.body.timestamp).toISOString()).toBe(
      response.body.timestamp,
    );
  });
});
