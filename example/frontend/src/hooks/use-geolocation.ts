import { useState, useEffect } from 'react';

interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error';

interface UseGeolocationResult {
  coords: GeolocationCoords | null;
  status: GeolocationStatus;
}

const GEOLOCATION_TIMEOUT_MS = 10000;

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('success');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      },
      { timeout: GEOLOCATION_TIMEOUT_MS },
    );
  }, []);

  return { coords, status };
}
