export type WeatherVariant = 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'neutral';

const ICON_VARIANT_MAP: Readonly<Record<string, WeatherVariant>> = {
  sun: 'sunny',
  'cloud-sun': 'cloudy',
  cloud: 'cloudy',
  'cloud-fog': 'cloudy',
  'cloud-drizzle': 'rainy',
  'cloud-rain': 'rainy',
  'cloud-snow': 'neutral',
  'cloud-lightning': 'storm',
};

export function resolveVariant(icon: string): WeatherVariant {
  return ICON_VARIANT_MAP[icon] ?? 'neutral';
}
