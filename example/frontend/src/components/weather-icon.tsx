import type { ComponentType } from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { getConditionInfo } from '../lib/weather-condition';

interface WeatherIconProps {
  icon: string;
  size?: number;
  className?: string;
}

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  sun: Sun,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
};

export function WeatherIcon({ icon, size = 24, className }: WeatherIconProps) {
  const IconComponent = ICON_MAP[icon] ?? Cloud;
  const { label } = getConditionInfo(icon);

  return (
    <IconComponent
      size={size}
      className={className}
      aria-label={label}
      role="img"
    />
  );
}
