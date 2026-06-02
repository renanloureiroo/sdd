import { useState } from 'react';
import { AnimatedBackground } from '../components/animated-background';
import { CitySearch } from '../components/city-search';
import { CurrentWeather } from '../components/current-weather';
import { HourlyForecast } from '../components/hourly-forecast';
import { LoadingState } from '../components/feedback/loading-state';
import { ErrorState } from '../components/feedback/error-state';
import { useWeather } from '../hooks/use-weather';
import { useGeolocation } from '../hooks/use-geolocation';
import type { CityCandidate } from '../types/weather';

interface WeatherParams {
  lat: number;
  lon: number;
  label?: string;
}

export default function WeatherPanel() {
  const [selectedParams, setSelectedParams] = useState<WeatherParams | null>(null);
  const { coords, status: geoStatus } = useGeolocation();

  const geoParams: WeatherParams | null =
    geoStatus === 'success' && coords && selectedParams === null
      ? { lat: coords.latitude, lon: coords.longitude }
      : null;

  const activeParams = selectedParams ?? geoParams;

  const { data, isLoading, isError, errorMessage, refetch } = useWeather(activeParams);

  function handleCitySelect(city: CityCandidate) {
    setSelectedParams({
      lat: city.latitude,
      lon: city.longitude,
      label: [city.name, city.admin1, city.country].filter(Boolean).join(', '),
    });
  }

  const showGeoDeniedHint =
    !selectedParams && (geoStatus === 'denied' || geoStatus === 'error');

  return (
    <main className="min-h-screen bg-transparent">
      {data && (
        <AnimatedBackground icon={data.current.icon} isDay={data.current.isDay} />
      )}

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 flex flex-col gap-6">
        <header className="text-center">
          <h1
            className="text-[40px] font-semibold text-[#1d1d1f] leading-tight"
            style={{
              fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif',
              letterSpacing: '0',
            }}
          >
            Painel de Clima
          </h1>
          <p
            className="text-[17px] text-[#7a7a7a] mt-2"
            style={{
              fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.374px',
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            Consulte o clima atual e a previsão para hoje
          </p>
        </header>

        <CitySearch onCitySelect={handleCitySelect} />

        {showGeoDeniedHint && (
          <p
            role="status"
            aria-live="polite"
            className="text-center text-[14px] text-[#7a7a7a]"
            style={{
              fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif',
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            Localização não disponível. Digite o nome de uma cidade para buscar.
          </p>
        )}

        {geoStatus === 'loading' && !selectedParams && (
          <p
            role="status"
            aria-live="polite"
            className="text-center text-[14px] text-[#7a7a7a]"
            style={{
              fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif',
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            Detectando sua localização...
          </p>
        )}

        {isLoading && <LoadingState />}

        {isError && !isLoading && (
          <ErrorState
            message={errorMessage ?? 'Não foi possível obter os dados do clima.'}
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && data && (
          <>
            <CurrentWeather data={data} />
            <HourlyForecast hourly={data.hourly} />
          </>
        )}

        {!activeParams && !isLoading && !data && geoStatus !== 'loading' && (
          <div className="text-center py-12">
            <p
              className="text-[17px] text-[#7a7a7a]"
              style={{
                fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.374px',
                textShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            >
              Digite o nome de uma cidade para ver o clima
            </p>
          </div>
        )}
      </div>

      <footer className="relative z-10 bg-white/60 backdrop-blur-sm border-t border-[#e0e0e0] py-6 mt-8">
        <p
          className="text-center text-[12px] text-[#7a7a7a]"
          style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', letterSpacing: '-0.12px' }}
        >
          Dados meteorológicos:{' '}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0066cc] hover:underline"
          >
            Open-Meteo
          </a>{' '}
          (CC BY 4.0)
        </p>
      </footer>
    </main>
  );
}
