import { z } from 'zod';
import { MIN_QUERY_LENGTH, LAT_MIN, LAT_MAX, LON_MIN, LON_MAX } from '../config';

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(
      MIN_QUERY_LENGTH,
      `A consulta deve ter pelo menos ${MIN_QUERY_LENGTH} caracteres`,
    ),
});

export const weatherQuerySchema = z.object({
  lat: z.coerce
    .number()
    .min(LAT_MIN, `Latitude deve estar entre ${LAT_MIN} e ${LAT_MAX}`)
    .max(LAT_MAX, `Latitude deve estar entre ${LAT_MIN} e ${LAT_MAX}`),
  lon: z.coerce
    .number()
    .min(LON_MIN, `Longitude deve estar entre ${LON_MIN} e ${LON_MAX}`)
    .max(LON_MAX, `Longitude deve estar entre ${LON_MIN} e ${LON_MAX}`),
  label: z.string().optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type WeatherQuery = z.infer<typeof weatherQuerySchema>;
