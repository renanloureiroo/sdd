import { Thermometer, Wind, Droplets, CloudRain } from 'lucide-react';
import { WeatherIcon } from './weather-icon';
import type { WeatherResponse } from '../types/weather';

interface CurrentWeatherProps {
  data: WeatherResponse;
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  const { location, current } = data;

  return (
    <section
      role="region"
      aria-label="clima"
      className="w-full max-w-lg mx-auto bg-white rounded-[18px] border border-[#e0e0e0] p-6"
    >
      <header className="mb-4">
        <h2
          className="text-[21px] font-semibold text-[#1d1d1f] leading-tight"
          style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', letterSpacing: '0.231px' }}
        >
          {location.label}
        </h2>
      </header>

      <div className="flex items-center gap-4 mb-6">
        <WeatherIcon
          icon={current.icon}
          size={56}
          className="text-[#0066cc] shrink-0"
        />
        <div>
          <p
            className="text-[56px] font-semibold text-[#1d1d1f] leading-none"
            style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', letterSpacing: '-0.28px' }}
          >
            {Math.round(current.temperature)}°C
          </p>
          <p
            className="text-[17px] text-[#333333] mt-1"
            style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', letterSpacing: '-0.374px' }}
          >
            {current.condition}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Thermometer size={18} className="text-[#7a7a7a] shrink-0" aria-hidden="true" />
          <div>
            <dt className="text-[12px] text-[#7a7a7a]" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
              Sensação térmica
            </dt>
            <dd className="text-[17px] font-semibold text-[#1d1d1f]" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', letterSpacing: '-0.374px' }}>
              {Math.round(current.apparentTemperature)}°C
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind size={18} className="text-[#7a7a7a] shrink-0" aria-hidden="true" />
          <div>
            <dt className="text-[12px] text-[#7a7a7a]" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
              Vento
            </dt>
            <dd className="text-[17px] font-semibold text-[#1d1d1f]" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', letterSpacing: '-0.374px' }}>
              {Math.round(current.windSpeed)} km/h
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-[#7a7a7a] shrink-0" aria-hidden="true" />
          <div>
            <dt className="text-[12px] text-[#7a7a7a]" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
              Umidade
            </dt>
            <dd className="text-[17px] font-semibold text-[#1d1d1f]" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', letterSpacing: '-0.374px' }}>
              {current.humidity}%
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CloudRain size={18} className="text-[#7a7a7a] shrink-0" aria-hidden="true" />
          <div>
            <dt className="text-[12px] text-[#7a7a7a]" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}>
              Precipitação
            </dt>
            <dd className="text-[17px] font-semibold text-[#1d1d1f]" style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', letterSpacing: '-0.374px' }}>
              {current.precipitation} mm
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
