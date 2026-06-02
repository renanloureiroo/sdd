export interface WeatherConditionInfo {
  label: string;
  icon: string;
}

const WEATHER_CONDITION_MAP: Readonly<Record<string, WeatherConditionInfo>> = {
  sun: { label: 'Ensolarado', icon: 'sun' },
  'cloud-sun': { label: 'Parcialmente nublado', icon: 'cloud-sun' },
  cloud: { label: 'Nublado', icon: 'cloud' },
  'cloud-fog': { label: 'Nevoeiro', icon: 'cloud-fog' },
  'cloud-drizzle': { label: 'Garoa', icon: 'cloud-drizzle' },
  'cloud-rain': { label: 'Chuva', icon: 'cloud-rain' },
  'cloud-snow': { label: 'Neve', icon: 'cloud-snow' },
  'cloud-lightning': { label: 'Trovoada', icon: 'cloud-lightning' },
};

const FALLBACK_CONDITION: WeatherConditionInfo = {
  label: 'Condição desconhecida',
  icon: 'cloud',
};

export function getConditionInfo(icon: string): WeatherConditionInfo {
  return WEATHER_CONDITION_MAP[icon] ?? FALLBACK_CONDITION;
}
