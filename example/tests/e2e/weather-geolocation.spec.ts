import { test, expect } from '@playwright/test'
import forecastGeoVitoriaFixture from '../fixtures/forecast-geo-vitoria.json'
import forecastGeoDefaultFixture from '../fixtures/forecast-geo-default.json'

const LOCAL_HOST = 'localhost'
const WEATHER_TIMEOUT = 8_000

function toJson(data: unknown): string {
  return JSON.stringify(data)
}

function isForecastUrl(url: URL): boolean {
  return url.hostname === LOCAL_HOST && url.pathname === '/api/weather'
}

test.describe('Geolocalização com Geocoding Reverso', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) => url.hostname !== LOCAL_HOST,
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    )
  })

  test('deve exibir nome real da cidade quando geolocalização é concedida e Nominatim responde com sucesso', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: -20.32, longitude: -40.34 })

    await page.route(isForecastUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(forecastGeoVitoriaFixture),
      }),
    )

    await page.goto('/')

    await expect(page.getByRole('region', { name: /clima/i })).toBeVisible({
      timeout: WEATHER_TIMEOUT,
    })
    await expect(page.getByRole('region', { name: /clima/i })).toContainText(
      'Vitória, Espírito Santo, Brasil',
    )
  })

  test('deve exibir DEFAULT_LOCATION_LABEL quando geolocalização concedida mas Nominatim falha', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: -20.32, longitude: -40.34 })

    await page.route(isForecastUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(forecastGeoDefaultFixture),
      }),
    )

    await page.goto('/')

    await expect(page.getByRole('region', { name: /clima/i })).toBeVisible({
      timeout: WEATHER_TIMEOUT,
    })
    await expect(page.getByRole('region', { name: /clima/i })).toContainText(
      'Sua localização',
    )
    await expect(page.getByRole('alert')).not.toBeVisible()
  })
})
