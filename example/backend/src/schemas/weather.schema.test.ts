import { describe, it, expect } from 'vitest';
import { searchQuerySchema, weatherQuerySchema } from './weather.schema';

describe('searchQuerySchema', () => {
  it('deve rejeitar query vazia', () => {
    const result = searchQuerySchema.safeParse({ q: '' });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar query com apenas 1 caractere', () => {
    const result = searchQuerySchema.safeParse({ q: 'a' });
    expect(result.success).toBe(false);
  });

  it('deve incluir mensagem de erro em pt-BR para query curta', () => {
    const result = searchQuerySchema.safeParse({ q: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('pelo menos 2 caracteres');
    }
  });

  it('deve aceitar query com exatamente 2 caracteres', () => {
    const result = searchQuerySchema.safeParse({ q: 'SP' });
    expect(result.success).toBe(true);
  });

  it('deve aceitar query normal de cidade', () => {
    const result = searchQuerySchema.safeParse({ q: 'São Paulo' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('São Paulo');
    }
  });

  it('deve rejeitar query ausente', () => {
    const result = searchQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('weatherQuerySchema', () => {
  it('deve aceitar coordenadas válidas', () => {
    const result = weatherQuerySchema.safeParse({ lat: '-23.55', lon: '-46.63' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lat).toBe(-23.55);
      expect(result.data.lon).toBe(-46.63);
    }
  });

  it('deve coercir strings numéricas para número', () => {
    const result = weatherQuerySchema.safeParse({ lat: '10.5', lon: '20.3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.lat).toBe('number');
      expect(typeof result.data.lon).toBe('number');
    }
  });

  it('deve rejeitar latitude maior que 90', () => {
    const result = weatherQuerySchema.safeParse({ lat: '91', lon: '0' });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar latitude menor que -90', () => {
    const result = weatherQuerySchema.safeParse({ lat: '-91', lon: '0' });
    expect(result.success).toBe(false);
  });

  it('deve aceitar latitude nos extremos (-90 e 90)', () => {
    expect(weatherQuerySchema.safeParse({ lat: '-90', lon: '0' }).success).toBe(true);
    expect(weatherQuerySchema.safeParse({ lat: '90', lon: '0' }).success).toBe(true);
  });

  it('deve rejeitar longitude maior que 180', () => {
    const result = weatherQuerySchema.safeParse({ lat: '0', lon: '181' });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar longitude menor que -180', () => {
    const result = weatherQuerySchema.safeParse({ lat: '0', lon: '-181' });
    expect(result.success).toBe(false);
  });

  it('deve aceitar longitude nos extremos (-180 e 180)', () => {
    expect(weatherQuerySchema.safeParse({ lat: '0', lon: '-180' }).success).toBe(true);
    expect(weatherQuerySchema.safeParse({ lat: '0', lon: '180' }).success).toBe(true);
  });

  it('deve aceitar label opcional', () => {
    const result = weatherQuerySchema.safeParse({
      lat: '0',
      lon: '0',
      label: 'São Paulo',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBe('São Paulo');
    }
  });

  it('deve aceitar query sem label', () => {
    const result = weatherQuerySchema.safeParse({ lat: '0', lon: '0' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBeUndefined();
    }
  });

  it('deve rejeitar lat ou lon ausente', () => {
    expect(weatherQuerySchema.safeParse({ lat: '0' }).success).toBe(false);
    expect(weatherQuerySchema.safeParse({ lon: '0' }).success).toBe(false);
    expect(weatherQuerySchema.safeParse({}).success).toBe(false);
  });
});
