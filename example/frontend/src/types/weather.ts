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

export interface WeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyPoint[];
}

export interface SearchResponse {
  results: CityCandidate[];
}
