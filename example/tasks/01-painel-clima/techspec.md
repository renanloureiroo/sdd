# Especificação técnica

## Resumo executivo

O Painel de Clima adota o padrão **BFF (Backend-for-Frontend)**: o frontend React fala exclusivamente com o backend Express, que é o único a consumir a API pública **Open-Meteo** (geocoding e forecast). O backend expõe **dois endpoints** — um de busca de cidade (geocoding, retorna candidatos para desambiguação) e um de clima (forecast por coordenadas, retorna clima atual + série horária do dia). Toda a tradução de unidades, mapeamento de `weather_code` (WMO) para condições legíveis em pt-BR e normalização de contratos acontece no backend, entregando ao frontend um payload pronto para exibição.

No frontend, a busca, a geolocalização e a renderização do painel são orquestradas com **TanStack Query** (cache de requisição, estados de loading/erro e retry prontos) sobre hooks customizados; a UI segue integralmente o `DESIGN.md` (estética Apple, acento único Action Blue, input em pill, tipografia SF Pro/Inter). A validação dos parâmetros de entrada no backend usa **Zod**. Não há cache server-side nem persistência nesta versão — cada requisição é repassada ao Open-Meteo com timeout e tratamento de erro explícito.

## Arquitetura do sistema

### Visão dos componentes

**Backend (`backend/src/`) — novos:**

- `routes/weather.routes.ts` — registra `GET /api/weather/search` e `GET /api/weather`.
- `controllers/weather.controller.ts` — valida query (Zod), invoca o serviço, monta a resposta normalizada e loga cada branch (sucesso, vazio, erro), conforme regra de logging do projeto.
- `services/open-meteo.service.ts` — única fronteira com o Open-Meteo: `searchCities()` e `getWeather()`. Faz `fetch` com timeout, parseia e normaliza os payloads externos.
- `lib/http.ts` — wrapper de `fetch` nativo (Node 20+) com `AbortController`/timeout e tradução de falhas de rede.
- `lib/weather-code.ts` — mapa `weather_code` (WMO) → `{ condition: string (pt-BR), icon: string }`.
- `schemas/weather.schema.ts` — schemas Zod de query params (`SearchQuery`, `WeatherQuery`).
- `middleware/error-handler.ts` — substitui o handler inline atual; mapeia erros de domínio para status HTTP e corpo `{ error, code }`.
- `config.ts` — constantes nomeadas (URLs base, timeout, listas de variáveis `current`/`hourly`, `forecast_days`).

**Backend — modificado:** `index.ts` (monta `app.use('/api/weather', weatherRoutes)` e o `errorHandler`).

**Frontend (`frontend/src/`) — novos:**

- `pages/weather-panel.tsx` — página/órgão raiz que compõe busca + clima atual + previsão horária e gerencia a cidade selecionada.
- `components/city-search.tsx` — input (role `searchbox`, rótulo "cidade") + lista de candidatos para desambiguação + botão "Buscar".
- `components/current-weather.tsx` — bloco principal (role `region`, rótulo "clima"): temperatura, condição+ícone, sensação, vento, umidade, precipitação, cidade/região.
- `components/hourly-forecast.tsx` — faixa horizontal rolável; destaca a hora atual.
- `components/weather-icon.tsx` — ícone `lucide-react` por condição, com `aria-label` textual.
- `components/feedback/` — `loading-state.tsx`, `error-state.tsx` (com "tentar novamente").
- `hooks/use-city-search.ts`, `hooks/use-weather.ts` (TanStack Query), `hooks/use-geolocation.ts`, `hooks/use-debounce.ts`.
- `lib/api.ts` — cliente HTTP do BFF; `lib/weather-condition.ts` — labels/ícones pt-BR; `types/weather.ts` — contratos compartilhados.

**Frontend — modificado:** `main.tsx` (`QueryClientProvider`), `App.tsx` (renderiza `WeatherPanel`).

**Fluxo de dados:** `city-search` → `GET /api/weather/search` → usuário seleciona candidato → `use-weather` → `GET /api/weather?lat&lon&label` → `current-weather` + `hourly-forecast`. No carregamento, `use-geolocation` tenta obter coords e dispara `use-weather` direto (sem geocoding).

## Design de implementação

### Principais interfaces

```ts
// backend/src/services/open-meteo.service.ts
interface OpenMeteoService {
  searchCities(query: string, lang: string): Promise<CityCandidate[]>;
  getWeather(lat: number, lon: number): Promise<WeatherData>;
}

// frontend/src/lib/api.ts
interface WeatherApi {
  searchCities(q: string, signal?: AbortSignal): Promise<CityCandidate[]>;
  getWeather(lat: number, lon: number, label?: string): Promise<WeatherResponse>;
}
```

### Modelos de dados

```ts
interface CityCandidate {
  id: number; name: string; latitude: number; longitude: number;
  country: string; countryCode: string; admin1?: string; // estado/região
}

interface CurrentWeather {
  temperature: number; apparentTemperature: number; // °C
  humidity: number; precipitation: number;          // % | mm
  windSpeed: number;                                // km/h
  weatherCode: number; condition: string; icon: string; // WMO → pt-BR
  isDay: boolean;
}

interface HourlyPoint {
  time: string; // ISO local
  temperature: number; weatherCode: number; condition: string;
  icon: string; precipitationProbability: number; isCurrent: boolean;
}

interface WeatherResponse {
  location: { label: string; admin1?: string; country?: string; timezone: string };
  current: CurrentWeather;
  hourly: HourlyPoint[]; // dia corrente
}
```

### Endpoints da API

- **`GET /api/weather/search?q=<termo>`** — geocoding. `q` ≥ 2 chars (Zod); vazio/curto → `400`. Resposta: `{ results: CityCandidate[] }`. Nenhum match → `200` com `results: []` (frontend exibe "cidade não encontrada").
- **`GET /api/weather?lat=<num>&lon=<num>&label=<str?>`** — forecast. `lat`/`lon` numéricos e em faixa válida (Zod). Resposta: `WeatherResponse`. `label` opcional (usado quando vem da geolocalização: rótulo neutro "Sua localização").

**Chamadas externas montadas pelo serviço (exemplos de querystring):**
- Geocoding: `/v1/search?name=<q>&count=5&language=pt&format=json`
- Forecast: `/v1/forecast?latitude&longitude&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code,precipitation_probability&timezone=auto&forecast_days=1&wind_speed_unit=kmh`

## Pontos de integração

- **Open-Meteo Geocoding** (`https://geocoding-api.open-meteo.com/v1/search`) e **Forecast** (`https://api.open-meteo.com/v1/forecast`). Gratuita, **sem API key**.
- **Autenticação:** nenhuma. **Atribuição obrigatória:** dados sob **CC BY 4.0** — exibir crédito "Dados meteorológicos: Open-Meteo" no rodapé do painel.
- **Limites do plano grátis:** 600 req/min, 5.000/h, 10.000/dia (uso não-comercial). Sem cache nesta versão; mitigar carga via debounce na busca (frontend) e `count=5` no geocoding.
- **Tratamento de erro:** `lib/http.ts` aplica timeout (`AbortController`, ex.: 8s). Falha de rede/timeout → erro de domínio `UpstreamError` → `502`/`504`. Status não-OK do provedor → `502`. Validação inválida → `400`. O `error-handler` traduz tudo para `{ error: <msg pt-BR>, code }` e o frontend mostra mensagem clara + "tentar novamente".

## Abordagem de testes

> Backend já com runner: **Vitest** (`npm test` → `vitest run`, mais `test:watch` e `test:coverage`) + **supertest** para integração HTTP e `@vitest/coverage-v8` para cobertura.

### Testes unitários

- **`lib/weather-code.ts`**: cada faixa WMO mapeia para a condição pt-BR e ícone corretos (0=céu limpo, 45/48=nevoeiro, 51–67=chuva, 71–86=neve, 95–99=trovoada).
- **`services/open-meteo.service.ts`**: normalização do payload externo → modelos internos; marcação de `isCurrent` na série horária (hora local = hora atual); cálculo de "dia corrente". **Mock apenas do `fetch`/provedor externo.**
- **`schemas/weather.schema.ts`**: `q` curto/vazio rejeitado; `lat`/`lon` fora de faixa rejeitados.
- **Frontend** (se runner disponível): `use-debounce`, mapeamento de condição, e estados de `use-weather` (loading/erro/sucesso) com fetch mockado.

### Testes de integração

- Backend (**Vitest + supertest**): rotas + controller + serviço com o `fetch` externo mockado (`vi.fn`/`vi.spyOn(globalThis, 'fetch')`), validando contrato HTTP (status e corpo) para: sucesso, `results` vazio, query inválida (`400`) e indisponibilidade do provedor (`502`/`504`).

### Testes E2E

- Playwright (raiz, `tests/e2e/painel-clima.spec.ts`). Reativar o teste `fixme` existente: `searchbox` rotulado "cidade" → preencher → `button` "Buscar" → `region` "clima" visível.
- **Determinismo:** o `beforeEach` já intercepta hosts externos; estender o `page.route` para devolver fixtures de geocoding/forecast do Open-Meteo. Cobrir: fluxo de busca feliz, cidade não encontrada, erro do provedor (com "tentar novamente") e geolocalização negada (cai no estado de busca manual). Geolocalização concedida via `context.grantPermissions(['geolocation'])` + `setGeolocation`.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Backend — config, http, weather-code, schemas** (base sem dependências de UI; permite testar mapeamento WMO cedo).
2. **Backend — service + controller + routes + error-handler**; validar via `curl`/Playwright route. Razão: o contrato precisa existir antes do frontend consumir.
3. **Frontend — infra**: instalar TanStack Query, `QueryClientProvider`, `lib/api.ts`, `types/weather.ts`, hooks.
4. **Frontend — busca de cidade** (`city-search` + `use-city-search` + debounce + desambiguação).
5. **Frontend — clima atual + previsão horária** (`current-weather`, `hourly-forecast`, `weather-icon`), seguindo `DESIGN.md`.
6. **Frontend — geolocalização** (`use-geolocation`) e estados de loading/erro/retry.
7. **Integração e testes E2E** (reativar `fixme`, fixtures, cenários de erro/geolocalização).

### Dependências técnicas

- **Backend:** adicionar `zod`. `fetch` é nativo (Node 20+). **Vitest + supertest já instalados** (runner de testes pronto).
- **Frontend:** adicionar `@tanstack/react-query`. `lucide-react` já presente.
- Disponibilidade do Open-Meteo (sem SLA no plano grátis) — único serviço externo.

## Monitoramento e observabilidade

- **Logs (backend):** logar em cada branch relevante de controller/serviço (regra do projeto), com `console` estruturado: requisição recebida (endpoint + params saneados, **sem** coords brutas em texto livre por privacidade), latência da chamada ao Open-Meteo, resultado (nº de candidatos / sucesso forecast), e erros com `code`. Níveis: `info` (fluxo), `warn` (vazio/`400`), `error` (`502`/`504`/exceção).
- **Métricas (derivadas dos logs, alinhadas ao PRD):** taxa de buscas com resultado válido, taxa de erro retornada ao usuário, % de sessões usando geolocalização (evento de sucesso/negação no frontend).
- **Sem dashboard dedicado** nesta versão; `GET /health` permanece como health check (já usado pelo E2E/`webServer`).

## Considerações técnicas

### Principais decisões

- **BFF com dois endpoints** (search separado de weather): cumpre o requisito de desambiguação (lista de candidatos) e mantém o frontend isolado do provedor; alinha-se ao contrato do teste E2E (digitar → buscar → painel).
- **Sem cache server-side** (decisão do time): simplicidade; mitiga rate-limit via debounce no frontend e `count=5`. Trade-off: maior exposição a latência/limites sob carga — aceitável no escopo atual e revisável depois sem mudança de contrato.
- **Sem reverse geocoding** na geolocalização: Open-Meteo é forward-only; usa-se rótulo neutro ("Sua localização") + região/timezone do forecast, evitando 2º provedor externo e respeitando a privacidade (coords não persistidas).
- **TanStack Query no frontend + Zod no backend:** estados de loading/erro/retry e cache de requisição prontos no FE; validação declarativa e tipada no BE. Trade-off: duas dependências novas, justificadas pela redução de boilerplate e robustez dos estados (req. 17–18).
- **Mapeamento WMO no backend:** centraliza a tradução pt-BR/ícone, mantendo o frontend "burro" e o contrato estável.

### Riscos conhecidos

- **Rate-limit / indisponibilidade do Open-Meteo:** sem cache, picos podem gerar `429`/erros — mitigar com debounce e mensagens de retry; reavaliar cache in-memory se necessário.
- **`weather_code` incompleto:** trovoadas (95–99) só na Europa Central; garantir fallback de condição genérica para códigos não mapeados.
- **Geolocalização:** permissão negada/timeout/HTTPS — tratar como caminho normal (estado de busca manual), nunca erro intrusivo (req. 16).
- **Hora atual na série horária:** depende de `timezone=auto`; calcular `isCurrent` pelo horário local retornado, não pelo relógio do servidor.

### Conformidade com rules

- **Idioma do código:** inglês (identificadores/comentários); **docs/UI:** pt-BR. **Testes:** `describe`/`it` em pt-BR, padrão imperativo "deve…".
- **Nomenclatura kebab-case** em todos os arquivos novos (ex.: `weather-panel.tsx`, `open-meteo.service.ts`).
- **Sem `any`** (tipar com `unknown` + narrowing/Zod); **sem números mágicos** (timeouts, `count`, `forecast_days`, faixas de lat/lon em `config.ts`).
- **Logging** em cada statement/branch relevante no backend. **Commits** semânticos.

### Conformidade com skills

- **`express-rest-api`** e **`nodejs-backend-patterns`**: estrutura rota→controller→service, middleware de erro centralizado, validação com Zod, sem segredos hardcoded.
- **`react-frontend-expert`**: componentes funcionais, hooks customizados (`useCitySearch`, `useWeather`, `useGeolocation`, `useDebounce`), data fetching com TanStack Query, TypeScript strict, acessibilidade (rótulos, `aria-label` em ícones, anúncio de loading/erro).
- **UI segue `DESIGN.md`** integralmente (acento único Action Blue `#0066cc`, input em pill, SF Pro/Inter, hierarquia com destaque para temperatura/condição, faixa horária rolável responsiva).

### Arquivos relevantes e dependentes

- **Backend:** `backend/src/index.ts` (mod.), `routes/weather.routes.ts`, `controllers/weather.controller.ts`, `services/open-meteo.service.ts`, `lib/http.ts`, `lib/weather-code.ts`, `schemas/weather.schema.ts`, `middleware/error-handler.ts`, `config.ts`, `backend/package.json` (zod).
- **Frontend:** `src/main.tsx` (mod.), `src/App.tsx` (mod.), `pages/weather-panel.tsx`, `components/city-search.tsx`, `components/current-weather.tsx`, `components/hourly-forecast.tsx`, `components/weather-icon.tsx`, `components/feedback/*`, `hooks/*`, `lib/api.ts`, `lib/weather-condition.ts`, `types/weather.ts`, `frontend/package.json` (@tanstack/react-query).
- **E2E/config:** `tests/e2e/painel-clima.spec.ts` (mod.), `playwright.config.ts`, `DESIGN.md`, `AGENTS.md`.
