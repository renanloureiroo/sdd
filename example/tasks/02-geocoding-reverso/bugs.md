# Bugs — Geocoding Reverso

## BUG-01: Label de fallback diverge do PRD ("Minha localização" vs "Sua localização")

- **Severidade:** Baixa
- **Componente:** `backend/src/config.ts` — constante `DEFAULT_LOCATION_LABEL`
- **Passos para reproduzir:**
  1. Simular falha do Nominatim (ex.: desligar rede ou mockar HTTP 500 no Nominatim)
  2. Acessar `GET /api/weather?lat=-20.32&lon=-40.34` (sem `label`)
  3. Verificar o campo `location.label` na resposta
- **Resultado atual:** `location.label` retorna `"Minha localização"`
- **Resultado esperado:** `location.label` retorna `"Sua localização"` conforme definido no PRD (RF-5: "o sistema **deve** manter o rótulo 'Sua localização'")
- **Evidência:** `qa/01-estado-inicial.png` — estado inicial do painel; testes de integração em `weather.integration.test.ts` linhas 199, 295, 307 usam `'Minha localização'`
- **Causa raiz:** Constante `DEFAULT_LOCATION_LABEL` em `backend/src/config.ts` foi definida como `'Minha localização'` divergindo do PRD (RF-5) que exige `'Sua localização'`. Os testes de integração e E2E foram escritos com o valor incorreto da constante.
- **Correção aplicada:** Alterado `DEFAULT_LOCATION_LABEL` de `'Minha localização'` para `'Sua localização'` em `config.ts`; atualizado `weather.integration.test.ts` (3 asserções), `open-meteo.service.test.ts` (1 asserção), `tests/fixtures/forecast-geo-default.json` e `tests/e2e/weather-geolocation.spec.ts`.
- **Testes de regressão:** Asserções existentes em `weather.integration.test.ts` (linhas 199, 295, 307) e `open-meteo.service.test.ts` (linha 216) falharão se a constante for revertida para `'Minha localização'`. Teste E2E `weather-geolocation.spec.ts` também valida o label via fixture.
- **Status:** Corrigido
