export const OPEN_METEO_GEOCODING_URL =
  'https://geocoding-api.open-meteo.com/v1/search';
export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export const REQUEST_TIMEOUT_MS = 8000;
export const GEOCODING_COUNT = 5;
export const GEOCODING_LANGUAGE = 'pt';
export const FORECAST_DAYS = 1;
export const WIND_SPEED_UNIT = 'kmh';

export const CURRENT_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'is_day',
] as const;

export const HOURLY_VARIABLES = [
  'temperature_2m',
  'weather_code',
  'precipitation_probability',
] as const;

export const MIN_QUERY_LENGTH = 2;
export const LAT_MIN = -90;
export const LAT_MAX = 90;
export const LON_MIN = -180;
export const LON_MAX = 180;

export const DEFAULT_LOCATION_LABEL = 'Sua localização';

export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';
export const NOMINATIM_USER_AGENT = 'painel-clima/1.0';
