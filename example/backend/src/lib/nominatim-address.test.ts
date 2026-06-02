import { describe, it, expect } from 'vitest';
import { extractAddressLabel } from './nominatim-address';

describe('extractAddressLabel', () => {
  it('deve retornar "Cidade, Estado, País" para endereço completo', () => {
    const result = extractAddressLabel({
      address: {
        city: 'Vitória',
        state: 'Espírito Santo',
        country: 'Brasil',
      },
    });

    expect(result).toBe('Vitória, Espírito Santo, Brasil');
  });

  it('deve usar town quando city está ausente', () => {
    const result = extractAddressLabel({
      address: {
        town: 'Domingos Martins',
        state: 'Espírito Santo',
        country: 'Brasil',
      },
    });

    expect(result).toBe('Domingos Martins, Espírito Santo, Brasil');
  });

  it('deve usar village quando city e town estão ausentes', () => {
    const result = extractAddressLabel({
      address: {
        village: 'Santa Leopoldina',
        state: 'Espírito Santo',
        country: 'Brasil',
      },
    });

    expect(result).toBe('Santa Leopoldina, Espírito Santo, Brasil');
  });

  it('deve usar municipality quando city, town e village estão ausentes', () => {
    const result = extractAddressLabel({
      address: {
        municipality: 'Marechal Floriano',
        state: 'Espírito Santo',
        country: 'Brasil',
      },
    });

    expect(result).toBe('Marechal Floriano, Espírito Santo, Brasil');
  });

  it('deve retornar null quando state está ausente', () => {
    const result = extractAddressLabel({
      address: {
        city: 'Vitória',
        country: 'Brasil',
      },
    });

    expect(result).toBeNull();
  });

  it('deve retornar null quando country está ausente', () => {
    const result = extractAddressLabel({
      address: {
        city: 'Vitória',
        state: 'Espírito Santo',
      },
    });

    expect(result).toBeNull();
  });

  it('deve retornar null quando nenhum campo de cidade está presente', () => {
    const result = extractAddressLabel({
      address: {
        state: 'Espírito Santo',
        country: 'Brasil',
      },
    });

    expect(result).toBeNull();
  });

  it('deve retornar null quando address está ausente na resposta', () => {
    const result = extractAddressLabel({});

    expect(result).toBeNull();
  });
});
