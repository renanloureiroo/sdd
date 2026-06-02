import {
  OPEN_METEO_GEOCODING_URL,
  OPEN_METEO_FORECAST_URL,
  GEOCODING_COUNT,
  GEOCODING_LANGUAGE,
  FORECAST_DAYS,
  WIND_SPEED_UNIT,
  CURRENT_VARIABLES,
  HOURLY_VARIABLES,
  DEFAULT_LOCATION_LABEL,
} from '../config';
import { httpGet } from '../lib/http';
import { getWeatherCondition } from '../lib/weather-code';

export interface CityCandidate {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  icon: string;
  isDay: boolean;
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  weatherCode: number;
  condition: string;
  icon: string;
  precipitationProbability: number;
  isCurrent: boolean;
}

export interface WeatherLocation {
  label: string;
  timezone: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyPoint[];
}

interface GeocodingCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
}

interface GeocodingApiResponse {
  results?: GeocodingCity[];
}

interface ForecastCurrentData {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  is_day: number;
}

interface ForecastHourlyData {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability: number[];
}

interface ForecastApiResponse {
  timezone: string;
  current: ForecastCurrentData;
  hourly: ForecastHourlyData;
}

export async function searchCities(query: string): Promise<CityCandidate[]> {
  console.info(`[open-meteo]: searching cities q.length=${query.length}`);

  const params = new URLSearchParams({
    name: query,
    count: String(GEOCODING_COUNT),
    language: GEOCODING_LANGUAGE,
    format: 'json',
  });
  const url = `${OPEN_METEO_GEOCODING_URL}?${params.toString()}`;

  const raw = await httpGet(url);
  const data = raw as GeocodingApiResponse;

  const results = data.results ?? [];
  console.info(
    `[open-meteo]: geocoding returned ${results.length} result(s)`,
  );

  return results.map((city) => ({
    id: city.id,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    country: city.country,
    countryCode: city.country_code,
    admin1: city.admin1,
  }));
}

export async function getWeather(
  lat: number,
  lon: number,
  label?: string,
): Promise<WeatherData> {
  console.info('[open-meteo]: requesting forecast');

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT_VARIABLES.join(','),
    hourly: HOURLY_VARIABLES.join(','),
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS),
    wind_speed_unit: WIND_SPEED_UNIT,
  });
  const url = `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;

  const raw = await httpGet(url);
  const forecast = raw as ForecastApiResponse;

  const { condition: currentCondition, icon: currentIcon } =
    getWeatherCondition(forecast.current.weather_code);

  const currentHour = forecast.current.time.slice(0, 13) + ':00';

  const hourly = forecast.hourly.time.map((time, i) => {
    const { condition, icon } = getWeatherCondition(
      forecast.hourly.weather_code[i] ?? 0,
    );
    return {
      time,
      temperature: forecast.hourly.temperature_2m[i] ?? 0,
      weatherCode: forecast.hourly.weather_code[i] ?? 0,
      condition,
      icon,
      precipitationProbability:
        forecast.hourly.precipitation_probability[i] ?? 0,
      isCurrent: time === currentHour,
    };
  });

  console.info(
    `[open-meteo]: forecast ok timezone=${forecast.timezone} hourly=${hourly.length}h`,
  );

  return {
    location: {
      label: label ?? DEFAULT_LOCATION_LABEL,
      timezone: forecast.timezone,
    },
    current: {
      temperature: forecast.current.temperature_2m,
      apparentTemperature: forecast.current.apparent_temperature,
      humidity: forecast.current.relative_humidity_2m,
      precipitation: forecast.current.precipitation,
      windSpeed: forecast.current.wind_speed_10m,
      weatherCode: forecast.current.weather_code,
      condition: currentCondition,
      icon: currentIcon,
      isDay: forecast.current.is_day === 1,
    },
    hourly,
  };
}
