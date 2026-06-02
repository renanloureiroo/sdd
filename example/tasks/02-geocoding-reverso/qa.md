# Relatório de QA — Geocoding Reverso

## Resumo

- **Data:** 2026-06-02
- **Status:** REPROVADO (1 bug aberto — severidade Baixa)
- **Total de Requisitos:** 7 (RF-01 a RF-07)
- **Requisitos Atendidos:** 6/7
- **Bugs Encontrados:** 1 (ver `bugs.md`)

---

## Requisitos Verificados

| ID    | Requisito                                                                                           | Status  | Evidência                                                              |
|-------|-----------------------------------------------------------------------------------------------------|---------|------------------------------------------------------------------------|
| RF-01 | Sistema recebe coordenadas do navegador e envia ao backend                                          | PASSOU  | `weather-panel.tsx` — `geoParams` sem `label`; rede: `GET /api/weather?lat=&lon=` |
| RF-02 | Backend consulta Nominatim com `lat`, `lon`, `format=json`, `accept-language=pt` e `User-Agent`     | PASSOU  | `nominatim.service.ts` + log `[nominatim]: requesting...`              |
| RF-03 | Sistema exibe nome no formato **Cidade, Estado, País**                                              | PASSOU  | Painel exibiu "São Paulo, São Paulo, Brasil"; API retornou "Vitória, Espírito Santo, Brasil" para coords reais |
| RF-04 | Nome exibido no mesmo local do label de localização (`<h2>` no componente `CurrentWeather`)         | PASSOU  | `qa/02-busca-manual-com-label.png` e `qa/03-painel-com-geocoding.png`  |
| RF-05 | Fallback silencioso para label padrão quando Nominatim falha — **label incorreto**                  | FALHOU  | Label retornado é `"Minha localização"` em vez de `"Sua localização"` (PRD, RF-5) — ver BUG-01 |
| RF-06 | Falha no geocoding não bloqueia carregamento do clima (`Promise.allSettled`)                        | PASSOU  | `weather.controller.ts` linha 78; testes de integração confirmam      |
| RF-07 | Timeout máximo aplicado na chamada ao Nominatim (`REQUEST_TIMEOUT_MS` = 8 000 ms)                  | PASSOU  | `nominatim.service.ts` + `http.ts`; teste de integração "deve retornar label com timeout" |

---

## Testes Executados

### Testes unitários (backend)

| Suite                              | Resultado | Testes |
|------------------------------------|-----------|--------|
| `nominatim.service.test.ts`        | PASSOU    | incluídos nos 99 totais |
| `nominatim-address.test.ts`        | PASSOU    | incluídos nos 99 totais |
| `weather.integration.test.ts`      | PASSOU    | 4 novos cenários Nominatim |
| **Total backend**                  | **PASSOU**| **99/99** |

### Testes E2E (Playwright)

| Fluxo                                                                         | Resultado | Observações                                      |
|-------------------------------------------------------------------------------|-----------|--------------------------------------------------|
| Estado inicial do painel                                                      | PASSOU    | Carrega com detecção de geolocalização           |
| Busca manual — "São Paulo" → selecionar cidade → exibir clima com label       | PASSOU    | Label "São Paulo, São Paulo, Brasil" exibido corretamente |
| `weather-geolocation.spec.ts` — nome real quando Nominatim sucesso            | PASSOU    | "Vitória, Espírito Santo, Brasil" via fixture    |
| `weather-geolocation.spec.ts` — fallback quando Nominatim falha               | PASSOU    | "Minha localização" — teste passou mas label diverge do PRD |
| Short-circuit quando `label` presente na query                                | PASSOU    | Rede: `GET /api/weather?...&label=...` sem chamada ao Nominatim |
| **Total E2E**                                                                 | **PASSOU**| **9/9**                                          |

### API direta

| Endpoint                                   | Resultado | Retorno                                     |
|--------------------------------------------|-----------|---------------------------------------------|
| `GET /api/weather?lat=-20.32&lon=-40.34`   | PASSOU    | `location.label = "Vitória, Espírito Santo, Brasil"` — Nominatim real |
| `GET /api/weather?lat=...&label=...`       | PASSOU    | Label do query preservado; Nominatim não chamado |

---

## Acessibilidade (WCAG 2.2)

- [x] Navegação por teclado funciona: `searchbox → botão Buscar → lista previsão → link Open-Meteo`
- [x] Campo de busca tem `role="search"` com label "Buscar cidade"
- [x] Botão "Buscar" tem texto descritivo
- [x] Nome da cidade renderizado como texto em `<h2>` — lido por leitores de tela sem abreviações
- [x] Ícones decorativos com `aria-hidden="true"`
- [x] Região de clima com `role="region"` e `aria-label="clima"`
- [x] Região de previsão com `aria-label="Previsão horária"`
- [x] Status de geolocalização com `role="status"` e `aria-live="polite"`
- [x] Sem erros no console do browser

---

## Bugs Encontrados

| ID     | Descrição                                              | Severidade |
|--------|--------------------------------------------------------|------------|
| BUG-01 | Label de fallback: "Minha localização" ≠ "Sua localização" (PRD RF-5) | Baixa |

Detalhes completos em `bugs.md`.

---

## Conclusão

A feature de Geocoding Reverso está **funcionalmente correta** em todos os aspectos técnicos: resolução de nome via Nominatim, paralelismo com `Promise.allSettled`, fallback silencioso, timeout, short-circuit para busca manual e acessibilidade.

O único ponto de reprovação é o label de fallback: o PRD (RF-5) especifica explicitamente `"Sua localização"`, mas a implementação usa `"Minha localização"` — divergência presente em `config.ts`, nos testes de integração (3 asserções) e no teste E2E. Por ser apenas um texto de fallback de baixa visibilidade (só aparece quando o geocoding falha), a severidade é **Baixa**. Recomenda-se correção antes do merge para manter consistência com o PRD.
