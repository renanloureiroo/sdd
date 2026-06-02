# Relatório de Bugfix — Geocoding Reverso

## Resumo

- **Total de Bugs:** 1
- **Bugs Corrigidos:** 1
- **Testes de Regressão Criados:** 0 novos — os testes existentes já cobriam o cenário; foram atualizados para refletir o valor correto do PRD (servem como regressão)

---

## Detalhes por Bug

| ID     | Severidade | Status    | Correção                                                                 | Testes Atualizados                                                                                     |
|--------|------------|-----------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| BUG-01 | Baixa      | Corrigido | `DEFAULT_LOCATION_LABEL` alterado de `'Minha localização'` → `'Sua localização'` em `backend/src/config.ts` | `weather.integration.test.ts` (3), `open-meteo.service.test.ts` (1), `forecast-geo-default.json`, `weather-geolocation.spec.ts` |

---

## Arquivos Modificados

| Arquivo                                              | Alteração                                          |
|------------------------------------------------------|----------------------------------------------------|
| `backend/src/config.ts`                              | `DEFAULT_LOCATION_LABEL = 'Sua localização'`       |
| `backend/src/weather.integration.test.ts`            | 3 asserções atualizadas (`'Minha'` → `'Sua'`)     |
| `backend/src/services/open-meteo.service.test.ts`   | 1 asserção atualizada (`'Minha'` → `'Sua'`)       |
| `tests/fixtures/forecast-geo-default.json`           | `"label"` atualizado (`'Minha'` → `'Sua'`)        |
| `tests/e2e/weather-geolocation.spec.ts`              | Asserção de fallback atualizada (`'Minha'` → `'Sua'`) |

---

## Testes

- **Testes unitários:** TODOS PASSANDO — 99/99
- **Testes de integração:** TODOS PASSANDO — incluídos nos 99 acima
- **Testes E2E:** TODOS PASSANDO — 9/9
- **Tipagem:** SEM ERROS (sem uso de `any`; constante tipada como `string`)
