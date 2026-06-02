# Relatório de Code Review — Painel de Clima

## Resumo

- **Data:** 2026-06-02
- **Branch:** main (arquivos não commitados — working tree)
- **Status:** APROVADO COM RESSALVAS
- **Arquivos novos:** 30 (backend + frontend + E2E)
- **Arquivos modificados:** 7 (`app.ts`, `package.json`, `App.tsx`, `main.tsx`, `tasks.md`, `prd.md`, `techspec.md`)

---

## Conformidade com Rules

| Rule | Status | Observações |
|------|--------|-------------|
| Idioma do código em inglês | OK | Todos os identificadores, tipos e comentários em inglês |
| Documentação em pt-BR | OK | Labels, mensagens de UI e testes em pt-BR |
| Nomenclatura kebab-case | OK | Todos os arquivos: `weather-panel.tsx`, `open-meteo.service.ts`, etc. |
| Sem `any` | OK | `unknown` + narrowing/cast explícito nos limites de API externa |
| Sem números mágicos | OK com ressalva | 1 número mágico menor encontrado (ver Problemas) |
| Logging em branches relevantes | OK | Controller, serviço e lib/http logam em todos os branches |
| Commits semânticos | OK | Padrão Conventional Commits adotado |
| `describe`/`it` em pt-BR + "deve…" | OK | Todos os testes seguem o padrão imperativo |

---

## Aderência à TechSpec

| Decisão Técnica | Implementado | Observações |
|-----------------|:------------:|-------------|
| BFF com dois endpoints (`/api/weather/search` e `/api/weather`) | SIM | Rota separada via `weather.routes.ts` |
| Validação Zod nos query params | SIM | `searchQuerySchema` e `weatherQuerySchema` em `schemas/weather.schema.ts` |
| `lib/http.ts` com `AbortController`/timeout 8s | SIM | `UpstreamError` com `statusCode` e `code` |
| `lib/weather-code.ts` com mapa WMO → pt-BR + fallback | SIM | Fallback `'Condição desconhecida'` para códigos não mapeados |
| `middleware/error-handler.ts` centralizado | SIM | Mapeia `UpstreamError` e erros genéricos |
| `config.ts` com todas as constantes | SIM | URLs, timeout, variáveis current/hourly, faixas lat/lon |
| `services/open-meteo.service.ts` com normalização | SIM | `isCurrent` calculado por hora local, `is_day` → booleano |
| TanStack Query no frontend | SIM | `QueryClientProvider` em `main.tsx`, hooks com `queryOptions` |
| Hooks: `useCitySearch`, `useWeather`, `useGeolocation`, `useDebounce` | SIM | Todos implementados com tipagem explícita |
| Componentes: `CitySearch`, `CurrentWeather`, `HourlyForecast`, `WeatherIcon` | SIM | Todos presentes conforme TechSpec |
| `feedback/`: `LoadingState`, `ErrorState` com "tentar novamente" | SIM | `role="status"` e `role="alert"` com `aria-live` |
| Atribuição Open-Meteo CC BY 4.0 no rodapé | SIM | Presente em `weather-panel.tsx` |
| `GET /health` preservado | SIM | Rota mantida em `app.ts` |
| Sem chamada direta do frontend ao Open-Meteo | SIM | `lib/api.ts` aponta apenas para `localhost:3000` |
| Geolocalização: negada → busca manual sem bloqueio | SIM | `useGeolocation` retorna `status: 'denied'` e UI adapta |

---

## Tasks Verificadas

| Task | Status | Observações |
|------|--------|-------------|
| 1.0 Backend BFF (endpoints de busca e clima) | COMPLETA | Todos os subítens de `01_task.md` implementados |
| 2.0 Frontend (busca, clima atual, previsão, geolocalização) | COMPLETA | Todos os componentes/hooks previstos |
| 3.0 Integração e testes E2E | COMPLETA | 5 cenários cobertos: busca feliz, não encontrada, erro, geo concedida, geo negada |

---

## Testes

| Suíte | Total | Passando | Falhando |
|-------|------:|--------:|---------:|
| Unitários + Integração (Vitest) | 74 | 74 | 0 |
| E2E (Playwright) | 6 | 6 | 0 |
| **Total** | **80** | **80** | **0** |

**Coverage do backend:**

| Métrica | Resultado |
|---------|----------:|
| Statements | 96.42% (108/112) |
| Branches | 72.22% (26/36) |
| Functions | 92.3% (12/13) |
| Lines | 97.24% (106/109) |

A cobertura de branches (72.22%) está abaixo do ideal. Linhas não cobertas documentadas na seção de Problemas.

---

## Problemas Encontrados

| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|------:|-----------|----------|
| Média | `frontend/src/lib/api.ts` | 3 | `BFF_BASE_URL = 'http://localhost:3000'` hardcoded sem variável de ambiente. Quebrará em qualquer deploy além do desenvolvimento local. | Usar `import.meta.env.VITE_API_URL \|\| 'http://localhost:3000'` para permitir override via `.env`. |
| Baixa | `frontend/src/components/hourly-forecast.tsx` | 22 | `ITEM_WIDTH = 72` inconsistente com o CSS `w-[68px]` do item. Com gap de 8px o passo real é 76px; o uso de 72 causa leve desvio no scroll automático para a hora atual. | Corrigir para `const ITEM_WIDTH_PX = 76` (68 + gap 8) ou calcular dinamicamente via `scrollRef`. |
| Baixa | `frontend/src/components/city-search.tsx` | 22,29 | Valor literal `2` para comprimento mínimo de busca duplica o `MIN_QUERY_LENGTH` do hook `use-city-search.ts`. Violação menor de DRY. | Extrair `MIN_QUERY_LENGTH` para `types/weather.ts` ou `lib/constants.ts` e importar nos dois pontos. |
| Baixa | `backend/src/lib/http.ts` | 45–46 | Branch `NETWORK_ERROR` (erro genérico que não é `AbortError`) sem cobertura de teste. | Adicionar teste no `weather.integration.test.ts` simulando `fetch` rejeitando com `new Error('network failure')`. |
| Baixa | `backend/src/middleware/error-handler.ts` | 21 | Branch em que `err` não é instância de `Error` (segundo operando do ternário) sem cobertura. | Adicionar teste unitário passando um valor primitivo (`throw 'string'`) ao handler. |
| Muito Baixa | `frontend/src/components/ui/button.tsx` | 51 | Warning de lint `react-refresh/only-export-components`. Arquivo de boilerplate (shadcn/ui), não da feature. | Pode ser suprimido com `// eslint-disable-next-line` ou tratado numa limpeza geral de boilerplate. |

---

## Pontos Positivos

- **Zero falhas de teste**: 80 testes passando (74 unitários/integração + 6 E2E), incluindo todos os 5 cenários E2E críticos.
- **Cobertura de statements excelente**: 96.42% sem necessidade de testes artificiais.
- **Sem `any`**: `unknown` + type casting explícito nas fronteiras externas; interfaces internas 100% tipadas.
- **Acessibilidade bem implementada**: `role="searchbox"`, `aria-label="cidade"`, `role="region" aria-label="clima"`, `aria-current="time"`, `aria-live` nos estados de loading/erro — todos os seletores do E2E funcionam por roles semânticos.
- **Mapeamento WMO no backend**: centraliza a tradução pt-BR/ícone; frontend recebe payload pronto — contrato estável e fácil de manter.
- **Tratamento de erro robusto**: `UpstreamError` com `statusCode`/`code`, timeout via `AbortController`, fallback de condição desconhecida, geolocalização tratada como caminho normal (nunca erro intrusivo).
- **Fixtures determinísticas no E2E**: `page.route` intercepta tanto chamadas a hosts externos quanto ao backend local — zero dependência de API real.
- **Constantes nomeadas**: URLs, timeout, faixas lat/lon, variáveis de query — tudo em `config.ts` sem número mágico solto.
- **Debounce no frontend**: reduz carga ao Open-Meteo conforme previsto na TechSpec.

---

## Recomendações

1. **(Antes do próximo deploy)** Extrair `BFF_BASE_URL` para variável de ambiente Vite (`VITE_API_URL`) em `lib/api.ts`. Criar `.env.example` com o valor padrão.
2. **(Melhoria de qualidade)** Corrigir `ITEM_WIDTH` no `hourly-forecast.tsx` para corresponder ao CSS + gap real.
3. **(Melhoria de cobertura)** Adicionar testes para os dois branches não cobertos em `http.ts` e `error-handler.ts` — aumentaria cobertura de branches para ~85%+.
4. **(DRY menor)** Centralizar `MIN_QUERY_LENGTH = 2` em um único ponto compartilhado entre `use-city-search.ts` e `city-search.tsx`.

---

## Conclusão

A implementação está **completa e funcional**. Todos os requisitos do PRD foram atendidos, a TechSpec foi seguida com fidelidade (BFF pattern, Zod, TanStack Query, mapeamento WMO, acessibilidade, atribuição Open-Meteo), e a suíte de testes está 100% verde. O único ponto que deve ser resolvido antes de um deploy em ambiente compartilhado é a URL hardcoded do backend no cliente HTTP do frontend (`api.ts:3`). Os demais itens são melhorias de qualidade sem bloqueio funcional.

**Veredicto: APROVADO COM RESSALVAS** — tratar o item de severidade Média (`BFF_BASE_URL`) antes de promover para staging/produção.
