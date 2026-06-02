import { useEffect, useRef, useState } from 'react';
import { resolveVariant, type WeatherVariant } from '../lib/weather-variant';

// --- Constants ---
const CROSSFADE_DURATION_MS = 1000;
const SUN_SIZE_PX = 120;
const MOON_SIZE_PX = 80;
const SUN_TOP = '10%';
const SUN_RIGHT = '15%';
const MOON_TOP = '10%';
const MOON_RIGHT = '15%';
const CLOUD_BG_OPACITY = 0.28;
const CLOUD_DARK_BG_OPACITY = 0.18;
const RAINDROP_WIDTH_PX = 2;
const LIGHTNING_SCREEN_OPACITY = 0.35;

const STAR_POSITIONS = [
  { top: '5%', left: '8%', sizePx: 2, delay: '0s' },
  { top: '10%', left: '22%', sizePx: 3, delay: '0.4s' },
  { top: '7%', left: '40%', sizePx: 2, delay: '1.1s' },
  { top: '14%', left: '60%', sizePx: 3, delay: '0.7s' },
  { top: '3%', left: '78%', sizePx: 2, delay: '1.5s' },
  { top: '18%', left: '88%', sizePx: 4, delay: '0.2s' },
  { top: '22%', left: '5%', sizePx: 2, delay: '1.8s' },
  { top: '26%', left: '32%', sizePx: 2, delay: '0.9s' },
  { top: '11%', left: '50%', sizePx: 3, delay: '1.3s' },
  { top: '28%', left: '72%', sizePx: 2, delay: '2.0s' },
  { top: '8%', left: '15%', sizePx: 4, delay: '0.6s' },
  { top: '20%', left: '48%', sizePx: 2, delay: '2.3s' },
] as const;

const CLOUD_POSITIONS = [
  { top: '12%', left: '-4%', widthPx: 130, heightPx: 42, delay: '0s' },
  { top: '22%', left: '28%', widthPx: 100, heightPx: 34, delay: '3s' },
  { top: '8%', left: '58%', widthPx: 150, heightPx: 50, delay: '6s' },
] as const;

const RAINDROP_POSITIONS = [
  { left: '5%', heightPx: 18, delay: '-0.5s', duration: '1s' },
  { left: '12%', heightPx: 22, delay: '-0.1s', duration: '0.9s' },
  { left: '20%', heightPx: 16, delay: '-0.7s', duration: '1.1s' },
  { left: '28%', heightPx: 20, delay: '-0.3s', duration: '0.95s' },
  { left: '35%', heightPx: 18, delay: '-0.6s', duration: '1.05s' },
  { left: '43%', heightPx: 24, delay: '-0.2s', duration: '0.85s' },
  { left: '51%', heightPx: 17, delay: '-0.8s', duration: '1.15s' },
  { left: '59%', heightPx: 21, delay: '-0.05s', duration: '0.9s' },
  { left: '67%', heightPx: 19, delay: '-0.45s', duration: '1.0s' },
  { left: '75%', heightPx: 23, delay: '-0.25s', duration: '0.95s' },
  { left: '83%', heightPx: 16, delay: '-0.65s', duration: '1.1s' },
  { left: '91%', heightPx: 20, delay: '-0.15s', duration: '1.05s' },
] as const;

const RAINDROP_POSITIONS_DENSE = [
  { left: '3%', heightPx: 18, delay: '0s', duration: '0.8s' },
  { left: '8%', heightPx: 22, delay: '-0.1s', duration: '0.7s' },
  { left: '13%', heightPx: 16, delay: '-0.3s', duration: '0.9s' },
  { left: '18%', heightPx: 20, delay: '-0.05s', duration: '0.75s' },
  { left: '23%', heightPx: 18, delay: '-0.4s', duration: '0.85s' },
  { left: '28%', heightPx: 24, delay: '-0.15s', duration: '0.7s' },
  { left: '33%', heightPx: 17, delay: '-0.25s', duration: '0.95s' },
  { left: '38%', heightPx: 21, delay: '0s', duration: '0.8s' },
  { left: '43%', heightPx: 19, delay: '-0.35s', duration: '0.75s' },
  { left: '48%', heightPx: 23, delay: '-0.1s', duration: '0.85s' },
  { left: '53%', heightPx: 16, delay: '-0.2s', duration: '0.9s' },
  { left: '58%', heightPx: 20, delay: '-0.45s', duration: '0.7s' },
  { left: '63%', heightPx: 18, delay: '-0.05s', duration: '0.8s' },
  { left: '68%', heightPx: 22, delay: '-0.3s', duration: '0.75s' },
  { left: '73%', heightPx: 17, delay: '-0.15s', duration: '0.95s' },
  { left: '78%', heightPx: 21, delay: '-0.4s', duration: '0.7s' },
  { left: '83%', heightPx: 19, delay: '-0.25s', duration: '0.85s' },
  { left: '88%', heightPx: 23, delay: '-0.1s', duration: '0.8s' },
  { left: '93%', heightPx: 16, delay: '-0.35s', duration: '0.9s' },
  { left: '97%', heightPx: 20, delay: '0s', duration: '0.75s' },
] as const;

type GradientKey = `${WeatherVariant}-${'day' | 'night'}`;

const GRADIENTS: Record<GradientKey, string> = {
  'sunny-day': 'linear-gradient(to bottom, #7EC8E3, #FDB347)',
  'sunny-night': 'linear-gradient(to bottom, #0B1426, #1E3A5F)',
  'cloudy-day': 'linear-gradient(to bottom, #8FA9C3, #B8CEDE)',
  'cloudy-night': 'linear-gradient(to bottom, #1E2D3D, #2E3F50)',
  'rainy-day': 'linear-gradient(to bottom, #4B6082, #627490)',
  'rainy-night': 'linear-gradient(to bottom, #1A1F2E, #252B3B)',
  'storm-day': 'linear-gradient(to bottom, #2D3748, #4A5568)',
  'storm-night': 'linear-gradient(to bottom, #111827, #1F2937)',
  'neutral-day': 'linear-gradient(to bottom, #E8EEF4, #F5F5F7)',
  'neutral-night': 'linear-gradient(to bottom, #E8EEF4, #F5F5F7)',
};

// --- Interfaces ---
export interface AnimatedBackgroundProps {
  icon: string;
  isDay: boolean;
}

interface LayerState {
  variant: WeatherVariant;
  isDay: boolean;
}

// --- Helpers ---
function gradientKey(variant: WeatherVariant, isDay: boolean): GradientKey {
  return `${variant}-${isDay ? 'day' : 'night'}`;
}

// --- Decorative sub-components ---
function SunElement() {
  return (
    <div
      className="absolute animate-sun-pulse motion-reduce:animate-none pointer-events-none"
      style={{
        width: SUN_SIZE_PX,
        height: SUN_SIZE_PX,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #FFE566 30%, #FDB347 65%, transparent 100%)',
        top: SUN_TOP,
        right: SUN_RIGHT,
        boxShadow: '0 0 60px 20px rgba(253, 179, 71, 0.35)',
      }}
    />
  );
}

function MoonElement() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: MOON_SIZE_PX,
        height: MOON_SIZE_PX,
        borderRadius: '50%',
        background: '#E8E0C8',
        top: MOON_TOP,
        right: MOON_RIGHT,
        boxShadow: '0 0 30px 10px rgba(232, 224, 200, 0.25)',
      }}
    />
  );
}

function StarsElement({ faint }: { faint: boolean }) {
  return (
    <>
      {STAR_POSITIONS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-star-twinkle motion-reduce:animate-none pointer-events-none"
          style={{
            width: star.sizePx,
            height: star.sizePx,
            top: star.top,
            left: star.left,
            background: '#FFFFFF',
            opacity: faint ? 0.25 : 0.85,
            animationDelay: star.delay,
          }}
        />
      ))}
    </>
  );
}

function CloudsElement({ dark }: { dark: boolean }) {
  const opacity = dark ? CLOUD_DARK_BG_OPACITY : CLOUD_BG_OPACITY;
  return (
    <>
      {CLOUD_POSITIONS.map((cloud, i) => (
        <div
          key={i}
          className="absolute animate-float-cloud motion-reduce:animate-none pointer-events-none"
          style={{
            width: cloud.widthPx,
            height: cloud.heightPx,
            top: cloud.top,
            left: cloud.left,
            background: `rgba(255, 255, 255, ${opacity})`,
            borderRadius: '50px',
            animationDelay: cloud.delay,
          }}
        />
      ))}
    </>
  );
}

function RainElement({ dense, dark }: { dense: boolean; dark: boolean }) {
  const drops = dense ? RAINDROP_POSITIONS_DENSE : RAINDROP_POSITIONS;
  const color = dark
    ? 'rgba(180, 200, 255, 0.55)'
    : 'rgba(255, 255, 255, 0.5)';

  return (
    <>
      {drops.map((drop, i) => (
        <div
          key={i}
          className="absolute animate-rain-fall motion-reduce:animate-none pointer-events-none"
          style={{
            width: RAINDROP_WIDTH_PX,
            height: drop.heightPx,
            left: drop.left,
            top: '-5%',
            background: color,
            borderRadius: '2px',
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        />
      ))}
    </>
  );
}

function LightningElement() {
  return (
    <div
      className="absolute inset-0 animate-lightning-flash motion-reduce:animate-none pointer-events-none"
      style={{
        background: `rgba(255, 255, 200, ${LIGHTNING_SCREEN_OPACITY})`,
      }}
    />
  );
}

function DecorativeElements({ variant, isDay }: LayerState) {
  if (variant === 'neutral') return null;

  return (
    <>
      {variant === 'sunny' && isDay && <SunElement />}
      {variant === 'sunny' && !isDay && <MoonElement />}
      {!isDay && <StarsElement faint={variant !== 'sunny'} />}
      {(variant === 'cloudy' || variant === 'rainy' || variant === 'storm') && (
        <CloudsElement dark={!isDay} />
      )}
      {(variant === 'rainy' || variant === 'storm') && (
        <RainElement dense={variant === 'storm'} dark={!isDay} />
      )}
      {variant === 'storm' && <LightningElement />}
    </>
  );
}

// --- Main component ---
export function AnimatedBackground({ icon, isDay }: AnimatedBackgroundProps) {
  const currentVariant = resolveVariant(icon);

  const activeStateRef = useRef<LayerState>({ variant: currentVariant, isDay });
  const [activeLayer, setActiveLayer] = useState<LayerState>({ variant: currentVariant, isDay });
  const [prevLayer, setPrevLayer] = useState<LayerState | null>(null);
  const [prevOpacity, setPrevOpacity] = useState(0);

  useEffect(() => {
    const newVariant = resolveVariant(icon);
    const current = activeStateRef.current;

    if (newVariant === current.variant && isDay === current.isDay) return;

    const snapshot = { variant: current.variant, isDay: current.isDay };
    activeStateRef.current = { variant: newVariant, isDay };

    setPrevLayer(snapshot);
    setPrevOpacity(1);
    setActiveLayer({ variant: newVariant, isDay });

    const rafId = requestAnimationFrame(() => {
      setPrevOpacity(0);
    });

    const timerId = setTimeout(() => {
      setPrevLayer(null);
    }, CROSSFADE_DURATION_MS + 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [icon, isDay]);

  return (
    <div
      data-testid="animated-background"
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden"
    >
      {/* Active layer — always visible underneath */}
      <div
        data-testid="active-layer"
        className="absolute inset-0"
        style={{ background: GRADIENTS[gradientKey(activeLayer.variant, activeLayer.isDay)] }}
      >
        <DecorativeElements {...activeLayer} />
      </div>

      {/* Previous layer — fades out on top */}
      {prevLayer && (
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            background: GRADIENTS[gradientKey(prevLayer.variant, prevLayer.isDay)],
            opacity: prevOpacity,
          }}
        >
          <DecorativeElements {...prevLayer} />
        </div>
      )}
    </div>
  );
}
