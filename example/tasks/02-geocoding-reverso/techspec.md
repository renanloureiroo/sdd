# Especificação Técnica

## Resumo executivo

A feature adiciona resolução automática do nome da cidade a partir de coordenadas geográficas via API pública Nominatim OpenStreetMap. A implementação ancora-se no endpoint `GET /api/weather` existente: quando o frontend não passa `label` (fluxo de geolocalização), o controller orquestra duas chamadas em paralelo — Nominatim e Open-Meteo — via `Promise.allSettled`, garantindo que falhas no Nominatim sejam absorvidas silenciosamente sem bloquear o clima. No frontend, a única mudança é remover o label hardcoded `'Sua localização'` do payload de geolocalização; o backend retorna o label resolvido em `location.label`.

## Arquitetura do sistema

### Visão dos componentes

**Novos:**
- `backend/src/services/nominatim.service.ts` — chama o Nominatim com `User-Agent` obrigatório, extrai o label formatado e **nunca lança exceção ao caller** (retorna `string | null`)
- `backend/src/lib/nominatim-address.ts` — helper puro que extrai `"Cidade, Estado, País"` do objeto `address` da resposta Nominatim

**Modificados:**
- `backend/src/lib/http.ts` — `httpGet` recebe segundo parâmetro `options?: { headers?: Record<string, string>; timeoutMs?: number }` para suportar `User-Agent` customizado; sem mudança no comportamento padrão
- `backend/src/config.ts` — duas novas constantes: `NOMINATIM_BASE_URL` e `NOMINATIM_USER_AGENT`
- `backend/src/controllers/weather.controller.ts` — função `getWeather` orquestra chamada paralela ao Nominatim quando `label` está ausente na query; sobrescreve `location.label` no resultado antes de responder
- `frontend/src/pages/weather-panel.tsx` — `geoParams` deixa de passar `label: GEO_LOCATION_LABEL`; backend retorna o nome resolvido automaticamente

**Fluxo de dados (geolocalização):**

```
Browser → [lat, lon] → GET /api/weather?lat&lon
                           ↓
              Controller (sem label no query)
              Promise.allSettled([
                reverseGeocode(lat, lon),   ← Nominatim
                getWeatherService(lat, lon), ← Open-Meteo
              ])
                           ↓
              label = geocode.value ?? DEFAULT_LOCATION_LABEL
              response = { ...weather, location: { label, timezone } }
```

## Design de implementação

### Principais interfaces

```ts
// lib/http.ts — extensão
interface HttpGetOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}
export async function httpGet(url: string, options?: HttpGetOptions): Promise<unknown>

// services/nominatim.service.ts
export async function reverseGeocode(lat: number, lon: number): Promise<string | null>
```

### Modelos de dados

**Resposta Nominatim** (campos relevantes):

```ts
interface NominatimAddress {
  city?: string;         // capital / grande cidade
  town?: string;         // cidade média
  village?: string;      // vila / município menor
  municipality?: string;
  state?: string;
  country?: string;
}
interface NominatimResponse {
  address?: NominatimAddress;
}
```

**Label formatado:** `"${city}, ${state}, ${country}"`, onde `city` é o primeiro campo presente na ordem `city → town → village → municipality`. Retorna `null` quando nenhum desses campos está presente ou quando `state`/`country` estão ausentes.

### Endpoints da API

`GET /api/weather?lat=&lon=` (sem `label`) — comportamento alterado:
- Resolve label via Nominatim em paralelo com o forecast
- Resposta: `WeatherResponse` com `location.label` preenchido pelo Nominatim ou `DEFAULT_LOCATION_LABEL`

`GET /api/weather?lat=&lon=&label=` (com `label`) — comportamento atual preservado:
- Controller curto-circuita a chamada ao Nominatim; usa o label passado diretamente

## Pontos de integração

**Nominatim OpenStreetMap**
- URL: `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&accept-language=pt`
- Header obrigatório (política de uso): `User-Agent: painel-clima/1.0`
- Sem API key; gratuito
- Timeout: `REQUEST_TIMEOUT_MS` (8 000 ms) — mesmo valor usado para Open-Meteo
- Tratamento de erros: qualquer falha (HTTP 4xx/5xx, timeout, 429, resposta malformada) é capturada dentro de `reverseGeocode`, que retorna `null`; o controller usa `DEFAULT_LOCATION_LABEL` como fallback

## Abordagem de testes

### Testes unitários

`backend/src/services/nominatim.service.test.ts`:
- deve retornar label formatado quando Nominatim responde com city, state e country
- deve usar `town` quando `city` está ausente
- deve usar `village` quando `city` e `town` estão ausentes
- deve retornar null quando nenhum campo de cidade está presente na resposta
- deve retornar null quando Nominatim retorna status HTTP de erro (4xx/5xx)
- deve retornar null quando a chamada excede o timeout (AbortError)
- deve retornar null quando a resposta não contém o campo `address`

`backend/src/lib/nominatim-address.test.ts`:
- deve retornar `"Cidade, Estado, País"` para endereço completo
- deve retornar null quando state ou country estão ausentes
- deve retornar null quando nenhum campo de cidade está presente

### Testes de integração

Adicionar cenários em `backend/src/weather.integration.test.ts`:
- deve retornar `location.label` com nome resolvido quando Nominatim responde com sucesso (dois mocks de fetch sequenciais: Nominatim → Open-Meteo)
- deve retornar `location.label` com `DEFAULT_LOCATION_LABEL` quando Nominatim retorna erro HTTP
- deve retornar `location.label` com `DEFAULT_LOCATION_LABEL` quando Nominatim excede o timeout
- deve preservar o `label` passado no query e não chamar Nominatim (busca manual)

### Testes E2E

`tests/e2e/weather-geolocation.spec.ts` (novo arquivo ou adicionado ao existente):
- deve exibir nome real da cidade quando geolocalização é concedida e Nominatim responde com sucesso — intercept `**/nominatim.openstreetmap.org/**` com fixture `{ address: { city: 'Vitória', state: 'Espírito Santo', country: 'Brasil' } }`
- deve exibir `DEFAULT_LOCATION_LABEL` quando geolocalização concedida mas Nominatim falha — intercept retorna status 500

## Sequenciamento do desenvolvimento

### Ordem de construção

1. `backend/src/config.ts` — novas constantes (`NOMINATIM_BASE_URL`, `NOMINATIM_USER_AGENT`); sem dependências
2. `backend/src/lib/http.ts` — extensão de `httpGet` com `options`; base para o Nominatim service
3. `backend/src/lib/nominatim-address.ts` + testes — lógica pura e independente
4. `backend/src/services/nominatim.service.ts` + testes — depende de config, http e nominatim-address
5. `backend/src/controllers/weather.controller.ts` — orquestração paralela + atualização dos testes de integração
6. `frontend/src/pages/weather-panel.tsx` — remoção do label hardcoded
7. `tests/e2e/` — cenários E2E de geolocalização com mock de Nominatim

### Dependências técnicas

- Nominatim é API pública sem provisionamento ou chave necessários
- Todos os pacotes de runtime e teste já estão instalados no projeto

## Monitoramento e observabilidade

- `[nominatim]: requesting reverse geocode lat=${lat} lon=${lon}` — ao iniciar a chamada
- `[nominatim]: resolved label="${label}"` — ao sucesso
- `[nominatim]: fallback reason=${reason}` (warn) — ao falha silenciosa; inclui causa legível (ex.: `TIMEOUT`, `HTTP_ERROR`, `MISSING_FIELDS`)
- O label final aparece no log existente `[weather]: response ok` via campo `location.label` no payload; nenhuma observabilidade extra necessária no frontend

## Considerações técnicas

### Principais decisões

- **`Promise.allSettled` para paralelismo e fallback**: Nominatim e Open-Meteo correm em paralelo sem bloquear um ao outro. `allSettled` (ao invés de `all`) é crítico para absorver falha do Nominatim sem cancelar o clima.
- **`reverseGeocode` nunca lança**: o service encapsula toda lógica de erro e retorna `string | null`. O controller não precisa de `try/catch` adicional para o geocoding — o padrão mantém o código do controller limpo.
- **Sobrescrição do label no controller**: `getWeatherService` continua retornando `location.label = DEFAULT_LOCATION_LABEL` quando não recebe `label`; o controller substitui pelo valor resolvido quando disponível. Mudança cirúrgica — interface do serviço Open-Meteo não muda.
- **Curto-circuito quando `label` presente**: quando o query contém `label`, o controller não invoca `reverseGeocode`, evitando chamada desnecessária ao Nominatim (fluxo de busca manual).

### Riscos conhecidos

- **Campos de cidade variáveis no Nominatim**: para áreas rurais, `city/town/village/municipality` podem estar ausentes. Nesse caso, `reverseGeocode` retorna `null` → fallback para `DEFAULT_LOCATION_LABEL`. Monitorar o log `MISSING_FIELDS` em produção para decidir se vale expandir o fallback para `suburb` ou `county`.
- **Rate limit (política Nominatim)**: a política é 1 req/s. Em picos de múltiplos usuários simultâneos, pode ocorrer HTTP 429. Já tratado: `reverseGeocode` retorna `null` para qualquer erro HTTP, incluindo 429.
- **Latência extra em redes lentas**: com timeout em 8 000 ms, em cenários de Nominatim muito lento o usuário esperará 8s antes do fallback. Como as chamadas são paralelas, isso não bloqueia o Open-Meteo — o clima responde assim que o forecast chegar, mas `location.label` aguarda o `Promise.allSettled` completar. Se essa latência se mostrar perceptível em produção, pode-se reduzir `NOMINATIM_TIMEOUT_MS` sem afetar o forecast.

### Conformidade com rules

- Sem `any` — resposta Nominatim tipada via `NominatimResponse` e `NominatimAddress`
- Sem números mágicos — timeout via `REQUEST_TIMEOUT_MS`, URL e User-Agent via constantes em `config.ts`
- Logging em cada branch relevante (sucesso, fallback com reason)
- Arquivos em kebab-case: `nominatim.service.ts`, `nominatim-address.ts`
- Testes com `describe`/`it` em pt-BR no padrão imperativo `"deve…"`
- Código (variáveis, funções, tipos) em inglês

### Conformidade com skills

- **`express-rest-api`**: padrão controller → service → lib; validação Zod no schema (sem alteração); Nominatim com absorção de erro no service (não propaga como `UpstreamError`)
- **`nodejs-backend-patterns`**: integração externa em `services/`, helper puro em `lib/`, constantes centralizadas em `config.ts`

### Arquivos relevantes e dependentes

**Novos:**
- `backend/src/services/nominatim.service.ts`
- `backend/src/services/nominatim.service.test.ts`
- `backend/src/lib/nominatim-address.ts`
- `backend/src/lib/nominatim-address.test.ts`
- `tests/e2e/weather-geolocation.spec.ts`

**Modificados:**
- `backend/src/lib/http.ts`
- `backend/src/config.ts`
- `backend/src/controllers/weather.controller.ts`
- `backend/src/weather.integration.test.ts`
- `frontend/src/pages/weather-panel.tsx`
