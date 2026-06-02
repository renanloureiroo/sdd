export interface WeatherCondition {
  condition: string;
  icon: string;
}

const WEATHER_CODE_MAP: Readonly<Record<number, WeatherCondition>> = {
  0: { condition: 'Céu limpo', icon: 'sun' },
  1: { condition: 'Principalmente limpo', icon: 'sun' },
  2: { condition: 'Parcialmente nublado', icon: 'cloud-sun' },
  3: { condition: 'Nublado', icon: 'cloud' },
  45: { condition: 'Nevoeiro', icon: 'cloud-fog' },
  48: { condition: 'Nevoeiro com geada', icon: 'cloud-fog' },
  51: { condition: 'Garoa leve', icon: 'cloud-drizzle' },
  53: { condition: 'Garoa moderada', icon: 'cloud-drizzle' },
  55: { condition: 'Garoa intensa', icon: 'cloud-drizzle' },
  56: { condition: 'Garoa gelada leve', icon: 'cloud-drizzle' },
  57: { condition: 'Garoa gelada intensa', icon: 'cloud-drizzle' },
  61: { condition: 'Chuva leve', icon: 'cloud-rain' },
  63: { condition: 'Chuva moderada', icon: 'cloud-rain' },
  65: { condition: 'Chuva forte', icon: 'cloud-rain' },
  66: { condition: 'Chuva gelada leve', icon: 'cloud-rain' },
  67: { condition: 'Chuva gelada forte', icon: 'cloud-rain' },
  71: { condition: 'Neve leve', icon: 'cloud-snow' },
  73: { condition: 'Neve moderada', icon: 'cloud-snow' },
  75: { condition: 'Neve forte', icon: 'cloud-snow' },
  77: { condition: 'Granizo', icon: 'cloud-snow' },
  80: { condition: 'Pancada leve', icon: 'cloud-rain' },
  81: { condition: 'Pancada moderada', icon: 'cloud-rain' },
  82: { condition: 'Pancada forte', icon: 'cloud-rain' },
  85: { condition: 'Neve em pancada leve', icon: 'cloud-snow' },
  86: { condition: 'Neve em pancada forte', icon: 'cloud-snow' },
  95: { condition: 'Trovoada', icon: 'cloud-lightning' },
  96: { condition: 'Trovoada com granizo leve', icon: 'cloud-lightning' },
  99: { condition: 'Trovoada com granizo forte', icon: 'cloud-lightning' },
};

const FALLBACK_CONDITION: WeatherCondition = {
  condition: 'Condição desconhecida',
  icon: 'cloud',
};

export function getWeatherCondition(code: number): WeatherCondition {
  return WEATHER_CODE_MAP[code] ?? FALLBACK_CONDITION;
}
