import { test, expect } from '@playwright/test'
import geocodingFixture from '../fixtures/geocoding.json'
import forecastFixture from '../fixtures/forecast.json'
import forecastGeoFixture from '../fixtures/forecast-geo.json'

const LOCAL_HOST = 'localhost'
const WEATHER_TIMEOUT = 8_000
const ANIMATED_BG_TESTID = 'animated-background'

function toJson(data: unknown): string {
  return JSON.stringify(data)
}

function isSearchUrl(url: URL): boolean {
  return url.hostname === LOCAL_HOST && url.pathname === '/api/weather/search'
}

function isForecastUrl(url: URL): boolean {
  return url.hostname === LOCAL_HOST && url.pathname === '/api/weather'
}

test.describe('Painel Animado de Clima', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) => url.hostname !== LOCAL_HOST,
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    )
  })

  test('deve renderizar o fundo animado após busca bem-sucedida', async ({ page }) => {
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

    const background = page.getByTestId(ANIMATED_BG_TESTID)
    await expect(background).toBeAttached()
  })

  test('deve exibir o conteúdo climático sobre o fundo animado', async ({ page }) => {
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

    const climaRegion = page.getByRole('region', { name: /clima/i })
    await expect(climaRegion).toBeVisible({ timeout: WEATHER_TIMEOUT })
    await expect(climaRegion).toContainText('°C')
    await expect(climaRegion).toContainText('22')
  })

  test('deve desativar animações quando prefers-reduced-motion: reduce está ativo', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

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

    const background = page.getByTestId(ANIMATED_BG_TESTID)
    await expect(background).toBeAttached()

    // Verifica que elementos animados têm duration ≤ 0.02s (override prefers-reduced-motion do index.css)
    const hasActiveAnimation = await background.evaluate((el) => {
      const animated = el.querySelectorAll('[class*="animate-"]')
      for (const elem of animated) {
        const style = window.getComputedStyle(elem)
        const duration = parseFloat(style.animationDuration)
        if (duration > 0.02) return true
      }
      return false
    })

    expect(hasActiveAnimation).toBe(false)
  })

  test('deve exibir a paleta neutra sem erro visual para condição não mapeada (cloud-snow)', async ({
    page,
  }) => {
    const forecastSnow = {
      ...forecastGeoFixture,
      current: {
        ...forecastGeoFixture.current,
        icon: 'cloud-snow',
        condition: 'Neve',
        weatherCode: 71,
      },
    }

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
        body: toJson(forecastSnow),
      }),
    )

    await page.goto('/')

    await page.getByRole('searchbox', { name: /cidade/i }).fill('São Paulo')
    await page.getByRole('button', { name: /buscar/i }).click()
    await page.getByRole('option').first().click()

    await expect(page.getByRole('region', { name: /clima/i })).toBeVisible({
      timeout: WEATHER_TIMEOUT,
    })

    const background = page.getByTestId(ANIMATED_BG_TESTID)
    await expect(background).toBeAttached()

    // Verifica que o fundo usa a paleta neutra (gradiente parchment)
    const bgStyle = await background.evaluate((el) => {
      const layer = el.querySelector<HTMLElement>('[data-testid="active-layer"]')
      return layer ? window.getComputedStyle(layer).backgroundImage : ''
    })

    expect(bgStyle).toContain('gradient')
    // Sem elementos decorativos animados para a variante neutral
    const hasDecorativeChildren = await background.evaluate((el) => {
      const layer = el.querySelector('[data-testid="active-layer"]')
      return layer ? layer.children.length > 0 : false
    })
    expect(hasDecorativeChildren).toBe(false)
  })
})
