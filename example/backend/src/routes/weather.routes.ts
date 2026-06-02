import { Router } from 'express';
import { searchCities, getWeather } from '../controllers/weather.controller';

const router = Router();

router.get('/search', searchCities);
router.get('/', getWeather);

export { router as weatherRoutes };
