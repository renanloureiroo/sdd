import { describe, it, expect } from 'vitest';
import { resolveVariant } from './weather-variant';

describe('resolveVariant', () => {
  it('deve retornar "sunny" para ícone "sun"', () => {
    expect(resolveVariant('sun')).toBe('sunny');
  });

  it('deve retornar "cloudy" para ícones "cloud-sun", "cloud" e "cloud-fog"', () => {
    expect(resolveVariant('cloud-sun')).toBe('cloudy');
    expect(resolveVariant('cloud')).toBe('cloudy');
    expect(resolveVariant('cloud-fog')).toBe('cloudy');
  });

  it('deve retornar "rainy" para ícones "cloud-drizzle" e "cloud-rain"', () => {
    expect(resolveVariant('cloud-drizzle')).toBe('rainy');
    expect(resolveVariant('cloud-rain')).toBe('rainy');
  });

  it('deve retornar "storm" para ícone "cloud-lightning"', () => {
    expect(resolveVariant('cloud-lightning')).toBe('storm');
  });

  it('deve retornar "neutral" para ícone "cloud-snow"', () => {
    expect(resolveVariant('cloud-snow')).toBe('neutral');
  });

  it('deve retornar "neutral" para string vazia', () => {
    expect(resolveVariant('')).toBe('neutral');
  });

  it('deve retornar "neutral" para ícone desconhecido', () => {
    expect(resolveVariant('unknown')).toBe('neutral');
  });
});
