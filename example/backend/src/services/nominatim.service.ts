import {
  NOMINATIM_BASE_URL,
  NOMINATIM_USER_AGENT,
  REQUEST_TIMEOUT_MS,
} from '../config';
import { httpGet, UpstreamError } from '../lib/http';
import {
  extractAddressLabel,
  type NominatimResponse,
} from '../lib/nominatim-address';

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'json',
    'accept-language': 'pt',
  });
  const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;

  console.info(`[nominatim]: requesting reverse geocode lat=${lat} lon=${lon}`);

  try {
    const raw = await httpGet(url, {
      headers: { 'User-Agent': NOMINATIM_USER_AGENT },
      timeoutMs: REQUEST_TIMEOUT_MS,
    });

    const label = extractAddressLabel(raw as NominatimResponse);

    if (label) {
      console.info(`[nominatim]: resolved label="${label}"`);
    } else {
      console.warn('[nominatim]: fallback reason=MISSING_FIELDS');
    }

    return label;
  } catch (err) {
    const reason =
      err instanceof UpstreamError
        ? err.code === 'TIMEOUT'
          ? 'TIMEOUT'
          : err.code === 'NETWORK_ERROR'
            ? 'NETWORK_ERROR'
            : 'HTTP_ERROR'
        : 'UNKNOWN_ERROR';

    console.warn(`[nominatim]: fallback reason=${reason}`);
    return null;
  }
}
