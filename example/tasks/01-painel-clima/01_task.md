# Tarefa 1.0: Backend BFF do Painel de Clima (endpoints de busca e clima)

## Visão geral

Construir o Backend-for-Frontend que é a **única fronteira** com a API pública Open-Meteo. Entrega os dois endpoints REST (`GET /api/weather/search` e `GET /api/weather`), normalizando geocoding e forecast em contratos prontos para o frontend, com validação Zod, mapeamento de `weather_code` (WMO) para condições pt-BR/ícone, tratamento de erro centralizado e logging por branch. Nenhuma chamada externa parte do navegador (PRD req. 19).

<skills>
### Conformidade com skills

- **`express-rest-api`** — estrutura rota→controller→service, middleware de validação/erro, status e corpo de erro HTTP.
- **`nodejs-backend-patterns`** — arquitetura de serviço, tratamento de erro centralizado, integração com API externa, design de API, sem segredos hardcoded.
</skills>

<requirements>
- Cobre os requisitos funcionais do PRD: 1–10 (busca + clima atual), 11–12 (série horária com `isCurrent`), 17–19 (estados/erros, BFF exclusivo).
- `GET /api/weather/search?q=<termo>`: `q` ≥ 2 chars (Zod); vazio/curto → `400`. Resposta `{ results: CityCandidate[] }`; nenhum match → `200` com `results: []`.
- `GET /api/weather?lat&lon&label?`: `lat`/`lon` numéricos e em faixa válida (Zod). Resposta `WeatherResponse` (location + current + hourly do dia corrente).
- Chamadas externas montadas conforme querystrings da techspec (geocoding `count=5&language=pt`; forecast com `current`, `hourly`, `timezone=auto`, `forecast_days=1`, `wind_speed_unit=kmh`).
- Timeout via `AbortController` (`lib/http.ts`); falha de rede/timeout → `UpstreamError` → `502`/`504`; status não-OK do provedor → `502`; validação inválida → `400`. `error-handler` traduz tudo para `{ error: <pt-BR>, code }`.
- `isCurrent` da série horária calculado pelo **horário local retornado** (`timezone=auto`), não pelo relógio do servidor.
- Fallback de condição genérica para `weather_code` não mapeado.
- Regras do projeto: código em inglês, sem `any` (usar `unknown` + Zod), sem números mágicos (tudo em `config.ts`), logging em cada branch relevante (sem coords brutas em texto livre — privacidade), commits semânticos, arquivos em kebab-case.
</requirements>

## Subtarefas

- [x] 1.1 Adicionar `zod` ao `backend/package.json` e criar `config.ts` (URLs base, timeout, listas `current`/`hourly`, `count`, `forecast_days`, faixas de lat/lon).
- [x] 1.2 Implementar `lib/http.ts` (wrapper de `fetch` com `AbortController`/timeout e tradução de falha de rede) e `lib/weather-code.ts` (mapa WMO → `{ condition, icon }` com fallback).
- [x] 1.3 Implementar `schemas/weather.schema.ts` (`SearchQuery`, `WeatherQuery`).
- [x] 1.4 Implementar `services/open-meteo.service.ts` (`searchCities`, `getWeather`) com normalização dos payloads externos e marcação de `isCurrent`.
- [x] 1.5 Implementar `controllers/weather.controller.ts` (valida query, invoca serviço, monta resposta, loga cada branch) e `routes/weather.routes.ts`.
- [x] 1.6 Substituir o handler de erro inline por `middleware/error-handler.ts` e montar `app.use('/api/weather', ...)` + `errorHandler` em `app.ts`/`index.ts`.
- [x] 1.7 Escrever testes unitários e de integração (ver "Testes da tarefa").

## Detalhes de implementação

Ver `techspec.md` → "Arquitetura do sistema" (componentes backend), "Design de implementação" (interfaces `OpenMeteoService`, modelos `CityCandidate`/`CurrentWeather`/`HourlyPoint`/`WeatherResponse`), "Endpoints da API" e "Pontos de integração" (tratamento de erro, atribuição CC BY 4.0). Não reproduzir a implementação aqui — referenciar a techspec.

## Critérios de sucesso

- Os dois endpoints respondem conforme o contrato (status e corpo) nos cenários sucesso / vazio / `400` / indisponibilidade.
- Nenhuma chamada ao Open-Meteo fora de `open-meteo.service.ts`.
- `npm test` (backend) verde; cobertura cobre weather-code, schemas e service.
- Lint/typecheck sem `any`; nenhum número mágico fora de `config.ts`; logs presentes em cada branch.

## Testes da tarefa

- [x] **Testes unitários** — `weather-code` (faixas 0 / 45–48 / 51–67 / 71–86 / 95–99 + fallback); `weather.schema` (`q` curto/vazio rejeitado, `lat`/`lon` fora de faixa rejeitados); `open-meteo.service` (normalização externo→interno e `isCurrent`), **mockando apenas o `fetch`**.
- [x] **Testes de integração** — Vitest + supertest sobre rota+controller+serviço com `fetch` externo mockado (`vi.spyOn(globalThis, 'fetch')`): sucesso, `results: []`, query inválida (`400`), indisponibilidade do provedor (`502`/`504`).
- [ ] Testes E2E — N/A nesta tarefa (cobertos na 3.0).

## Arquivos relevantes

- `backend/src/config.ts`, `backend/src/lib/http.ts`, `backend/src/lib/weather-code.ts`
- `backend/src/schemas/weather.schema.ts`, `backend/src/services/open-meteo.service.ts`
- `backend/src/controllers/weather.controller.ts`, `backend/src/routes/weather.routes.ts`
- `backend/src/middleware/error-handler.ts`, `backend/src/app.ts` (mod.), `backend/src/index.ts` (mod.)
- `backend/package.json` (zod), testes `*.test.ts` em `backend/src/`
</content>
