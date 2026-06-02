import { describe, it, expect } from 'vitest';
import { getWeatherCondition } from './weather-code';

describe('getWeatherCondition', () => {
  describe('céu limpo (código 0)', () => {
    it('deve retornar condição "Céu limpo" e ícone "sun" para código 0', () => {
      const result = getWeatherCondition(0);
      expect(result.condition).toBe('Céu limpo');
      expect(result.icon).toBe('sun');
    });

    it('deve retornar condição "Principalmente limpo" para código 1', () => {
      const result = getWeatherCondition(1);
      expect(result.condition).toBe('Principalmente limpo');
      expect(result.icon).toBe('sun');
    });
  });

  describe('nublado (códigos 2-3)', () => {
    it('deve retornar condição "Parcialmente nublado" e ícone "cloud-sun" para código 2', () => {
      const result = getWeatherCondition(2);
      expect(result.condition).toBe('Parcialmente nublado');
      expect(result.icon).toBe('cloud-sun');
    });

    it('deve retornar condição "Nublado" e ícone "cloud" para código 3', () => {
      const result = getWeatherCondition(3);
      expect(result.condition).toBe('Nublado');
      expect(result.icon).toBe('cloud');
    });
  });

  describe('nevoeiro (códigos 45-48)', () => {
    it('deve retornar condição "Nevoeiro" e ícone "cloud-fog" para código 45', () => {
      const result = getWeatherCondition(45);
      expect(result.condition).toBe('Nevoeiro');
      expect(result.icon).toBe('cloud-fog');
    });

    it('deve retornar condição "Nevoeiro com geada" para código 48', () => {
      const result = getWeatherCondition(48);
      expect(result.condition).toBe('Nevoeiro com geada');
      expect(result.icon).toBe('cloud-fog');
    });
  });

  describe('garoa/drizzle (códigos 51-57)', () => {
    it('deve retornar ícone "cloud-drizzle" para código 51', () => {
      expect(getWeatherCondition(51).icon).toBe('cloud-drizzle');
    });

    it('deve retornar ícone "cloud-drizzle" para código 53', () => {
      expect(getWeatherCondition(53).icon).toBe('cloud-drizzle');
    });

    it('deve retornar ícone "cloud-drizzle" para código 55', () => {
      expect(getWeatherCondition(55).icon).toBe('cloud-drizzle');
    });

    it('deve retornar ícone "cloud-drizzle" para código 57', () => {
      expect(getWeatherCondition(57).icon).toBe('cloud-drizzle');
    });
  });

  describe('chuva (códigos 61-67)', () => {
    it('deve retornar condição "Chuva leve" e ícone "cloud-rain" para código 61', () => {
      const result = getWeatherCondition(61);
      expect(result.condition).toBe('Chuva leve');
      expect(result.icon).toBe('cloud-rain');
    });

    it('deve retornar condição "Chuva forte" para código 65', () => {
      expect(getWeatherCondition(65).condition).toBe('Chuva forte');
    });

    it('deve retornar ícone "cloud-rain" para código 67', () => {
      expect(getWeatherCondition(67).icon).toBe('cloud-rain');
    });
  });

  describe('neve (códigos 71-86)', () => {
    it('deve retornar condição "Neve leve" e ícone "cloud-snow" para código 71', () => {
      const result = getWeatherCondition(71);
      expect(result.condition).toBe('Neve leve');
      expect(result.icon).toBe('cloud-snow');
    });

    it('deve retornar ícone "cloud-snow" para código 77 (granizo)', () => {
      expect(getWeatherCondition(77).icon).toBe('cloud-snow');
    });

    it('deve retornar ícone "cloud-snow" para código 86', () => {
      expect(getWeatherCondition(86).icon).toBe('cloud-snow');
    });
  });

  describe('trovoada (códigos 95-99)', () => {
    it('deve retornar condição "Trovoada" e ícone "cloud-lightning" para código 95', () => {
      const result = getWeatherCondition(95);
      expect(result.condition).toBe('Trovoada');
      expect(result.icon).toBe('cloud-lightning');
    });

    it('deve retornar ícone "cloud-lightning" para código 96', () => {
      expect(getWeatherCondition(96).icon).toBe('cloud-lightning');
    });

    it('deve retornar ícone "cloud-lightning" para código 99', () => {
      expect(getWeatherCondition(99).icon).toBe('cloud-lightning');
    });
  });

  describe('código desconhecido (fallback)', () => {
    it('deve retornar condição "Condição desconhecida" para código não mapeado', () => {
      const result = getWeatherCondition(999);
      expect(result.condition).toBe('Condição desconhecida');
      expect(result.icon).toBe('cloud');
    });

    it('deve retornar fallback para código negativo', () => {
      const result = getWeatherCondition(-1);
      expect(result.condition).toBe('Condição desconhecida');
    });
  });
});
