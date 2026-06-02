import { Request, Response, NextFunction } from 'express';
import {
  searchCities as searchCitiesService,
  getWeather as getWeatherService,
} from '../services/open-meteo.service';
import { reverseGeocode } from '../services/nominatim.service';
import {
  searchQuerySchema,
  weatherQuerySchema,
} from '../schemas/weather.schema';
import { DEFAULT_LOCATION_LABEL } from '../config';

const HTTP_BAD_REQUEST = 400;

export async function searchCities(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  console.info('[weather/search]: request received');

  const result = searchQuerySchema.safeParse(req.query);
  if (!result.success) {
    const message =
      result.error.issues[0]?.message ?? 'Parâmetros inválidos';
    console.warn('[weather/search]: invalid query -', message);
    res
      .status(HTTP_BAD_REQUEST)
      .json({ error: message, code: 'VALIDATION_ERROR' });
    return;
  }

  const { q } = result.data;

  try {
    const cities = await searchCitiesService(q);

    if (cities.length === 0) {
      console.warn(`[weather/search]: no results q.length=${q.length}`);
    } else {
      console.info(`[weather/search]: found ${cities.length} result(s)`);
    }

    res.json({ results: cities });
  } catch (err) {
    next(err);
  }
}

export async function getWeather(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  console.info('[weather]: request received');

  const result = weatherQuerySchema.safeParse(req.query);
  if (!result.success) {
    const message =
      result.error.issues[0]?.message ?? 'Parâmetros inválidos';
    console.warn('[weather]: invalid query -', message);
    res
      .status(HTTP_BAD_REQUEST)
      .json({ error: message, code: 'VALIDATION_ERROR' });
    return;
  }

  const { lat, lon, label } = result.data;

  try {
    if (label) {
      const data = await getWeatherService(lat, lon, label);
      console.info('[weather]: response ok');
      res.json(data);
      return;
    }

    const [geocodeResult, weatherResult] = await Promise.allSettled([
      reverseGeocode(lat, lon),
      getWeatherService(lat, lon),
    ]);

    if (weatherResult.status === 'rejected') {
      throw weatherResult.reason as Error;
    }

    const resolvedLabel =
      geocodeResult.status === 'fulfilled' && geocodeResult.value
        ? geocodeResult.value
        : DEFAULT_LOCATION_LABEL;

    const data = weatherResult.value;
    data.location.label = resolvedLabel;

    console.info('[weather]: response ok');
    res.json(data);
  } catch (err) {
    next(err);
  }
}
