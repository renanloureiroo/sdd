import { test, expect } from '@playwright/test'
import geocodingFixture from '../fixtures/geocoding.json'
import geocodingEmptyFixture from '../fixtures/geocoding-empty.json'
import forecastFixture from '../fixtures/forecast.json'
import forecastGeoFixture from '../fixtures/forecast-geo.json'

const LOCAL_HOST = 'localhost'
const WEATHER_TIMEOUT = 8_000

function toJson(data: unknown): string {
  return JSON.stringify(data)
}

function isSearchUrl(url: URL): boolean {
  return url.hostname === LOCAL_HOST && url.pathname === '/api/weather/search'
}

function isForecastUrl(url: URL): boolean {
  return url.hostname === LOCAL_HOST && url.pathname === '/api/weather'
}

test.describe('Painel de Clima', () => {
  test.beforeEach(async ({ page }) => {
    // Intercepta todas as chamadas externas (fora de localhost) para manter
    // o E2E determinístico — nenhuma requisição real a APIs de terceiros.
    await page.route(
      (url) => url.hostname !== LOCAL_HOST,
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    )
  })

  test('deve exibir o painel inicial com campo de busca', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /painel de clima/i })).toBeVisible()
    await expect(page.getByRole('searchbox', { name: /cidade/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /buscar/i })).toBeVisible()
  })

  test('deve buscar uma cidade e exibir o clima atual', async ({ page }) => {
    await page.route(isSearchUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(geocodingFixture),
      }),
    )
    await page.route(isForecastUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(forecastFixture),
      }),
    )

    await page.goto('/')

    await page.getByRole('searchbox', { name: /cidade/i }).fill('São Paulo')
    await page.getByRole('button', { name: /buscar/i }).click()

    // Seleciona o primeiro candidato na lista de desambiguação
    await page.getByRole('option').first().click()

    await expect(page.getByRole('region', { name: /clima/i })).toBeVisible({
      timeout: WEATHER_TIMEOUT,
    })
    await expect(page.getByRole('region', { name: /clima/i })).toContainText('22')
    await expect(page.getByRole('region', { name: /clima/i })).toContainText('°C')
  })

  test('não deve exibir identificador técnico IANA de timezone no painel de clima', async ({
    page,
  }) => {
    await page.route(isSearchUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(geocodingFixture),
      }),
    )
    await page.route(isForecastUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(forecastFixture),
      }),
    )

    await page.goto('/')

    await page.getByRole('searchbox', { name: /cidade/i }).fill('São Paulo')
    await page.getByRole('button', { name: /buscar/i }).click()
    await page.getByRole('option').first().click()

    await expect(page.getByRole('region', { name: /clima/i })).toBeVisible({
      timeout: WEATHER_TIMEOUT,
    })

    // Garante que o identificador IANA (ex.: "America/Sao_Paulo") não está visível
    const regionText = await page.getByRole('region', { name: /clima/i }).textContent()
    expect(regionText).not.toMatch(/[A-Z][a-z]+\/[A-Z]/)
  })

  test('deve exibir mensagem quando cidade não for encontrada', async ({ page }) => {
    await page.route(isSearchUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(geocodingEmptyFixture),
      }),
    )

    await page.goto('/')

    await page.getByRole('searchbox', { name: /cidade/i }).fill('CidadeInexistente')
    await page.getByRole('button', { name: /buscar/i }).click()

    await expect(page.getByText(/cidade não encontrada/i)).toBeVisible({
      timeout: WEATHER_TIMEOUT,
    })
  })

  test('deve exibir mensagem de erro e botão tentar novamente quando provedor falhar', async ({
    page,
  }) => {
    await page.route(isSearchUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(geocodingFixture),
      }),
    )
    await page.route(isForecastUrl, (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: toJson({
          error: 'Serviço temporariamente indisponível. Tente novamente.',
          code: 'UPSTREAM_ERROR',
        }),
      }),
    )

    await page.goto('/')

    await page.getByRole('searchbox', { name: /cidade/i }).fill('São Paulo')
    await page.getByRole('button', { name: /buscar/i }).click()
    await page.getByRole('option').first().click()

    await expect(page.getByRole('alert')).toBeVisible({ timeout: WEATHER_TIMEOUT })
    await expect(page.getByRole('button', { name: /tentar novamente/i })).toBeVisible()
  })

  test('deve pré-carregar o clima quando geolocalização for concedida', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: -23.5475, longitude: -46.6361 })

    await page.route(isForecastUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: toJson(forecastGeoFixture),
      }),
    )

    await page.goto('/')

    await expect(page.getByRole('region', { name: /clima/i })).toBeVisible({
      timeout: WEATHER_TIMEOUT,
    })
    await expect(page.getByRole('region', { name: /clima/i })).toContainText('Sua localização')
  })

  test('deve permitir busca manual quando geolocalização for negada', async ({
    page,
    context,
  }) => {
    await context.clearPermissions()

    await page.goto('/')

    // Garante que o estado inicial de busca manual está disponível sem erro intrusivo
    await expect(page.getByRole('searchbox', { name: /cidade/i })).toBeVisible()
    await expect(page.getByRole('alert')).not.toBeVisible()
  })
})
