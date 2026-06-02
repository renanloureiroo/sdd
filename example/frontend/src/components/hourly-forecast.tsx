import { useRef, useEffect } from 'react';
import { WeatherIcon } from './weather-icon';
import type { HourlyPoint } from '../types/weather';

interface HourlyForecastProps {
  hourly: HourlyPoint[];
}

function formatHour(isoTime: string): string {
  const parts = isoTime.split('T');
  if (parts.length < 2) return isoTime;
  const timePart = parts[1] ?? '';
  return timePart.slice(0, 5);
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentIndex = hourly.findIndex((point) => point.isCurrent);
    if (currentIndex > 0 && scrollRef.current) {
      const ITEM_WIDTH = 76;
      scrollRef.current.scrollLeft = Math.max(0, (currentIndex - 1) * ITEM_WIDTH);
    }
  }, [hourly]);

  return (
    <section
      aria-label="Previsão horária"
      className="w-full max-w-lg mx-auto"
    >
      <h3
        className="text-[14px] font-semibold text-[#7a7a7a] mb-3 px-1"
        style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', letterSpacing: '-0.224px' }}
      >
        PREVISÃO HORA A HORA
      </h3>
      <div
        ref={scrollRef}
        role="list"
        aria-label="Previsão hora a hora"
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hourly.map((point) => (
          <div
            key={point.time}
            role="listitem"
            aria-current={point.isCurrent ? 'time' : undefined}
            className={`flex flex-col items-center gap-2 px-3 py-3 rounded-[18px] shrink-0 w-[68px] border transition-colors ${
              point.isCurrent
                ? 'bg-[#0066cc] border-[#0066cc] text-white'
                : 'bg-white border-[#e0e0e0] text-[#1d1d1f]'
            }`}
          >
            <span
              className={`text-[12px] font-normal ${point.isCurrent ? 'text-white' : 'text-[#7a7a7a]'}`}
              style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}
            >
              {formatHour(point.time)}
            </span>
            <WeatherIcon
              icon={point.icon}
              size={20}
              className={point.isCurrent ? 'text-white' : 'text-[#0066cc]'}
            />
            <span
              className={`text-[14px] font-semibold ${point.isCurrent ? 'text-white' : 'text-[#1d1d1f]'}`}
              style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', letterSpacing: '-0.224px' }}
            >
              {Math.round(point.temperature)}°
            </span>
            {point.precipitationProbability > 0 && (
              <span
                className={`text-[10px] ${point.isCurrent ? 'text-white/80' : 'text-[#0066cc]'}`}
                style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}
                aria-label={`${point.precipitationProbability}% de probabilidade de precipitação`}
              >
                {point.precipitationProbability}%
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
