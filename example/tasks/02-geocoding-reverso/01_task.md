# Tarefa 1.0: Backend — Geocoding reverso completo

## Visão geral

Implementar toda a camada backend do geocoding reverso: constantes de config, extensão do cliente HTTP, helper puro de extração de endereço, serviço `reverseGeocode` com absorção de erros e orquestração paralela no controller. Inclui todos os testes unitários e de integração.

<skills>
### Conformidade com skills

- **`express-rest-api`** — padrão controller → service → lib; Nominatim com absorção de erro no service (não propaga como `UpstreamError`)
- **`nodejs-backend-patterns`** — integração externa em `services/`, helper puro em `lib/`, constantes centralizadas em `config.ts`
</skills>

<requirements>

- Novas constantes em `config.ts`: `NOMINATIM_BASE_URL` e `NOMINATIM_USER_AGENT`
- `httpGet` em `lib/http.ts` deve aceitar segundo parâmetro `options?: { headers?: Record<string, string>; timeoutMs?: number }` sem alterar comportamento padrão
- `lib/nominatim-address.ts`: helper puro que extrai `"Cidade, Estado, País"` usando a ordem `city → town → village → municipality`; retorna `null` quando state, country ou qualquer campo de cidade estiver ausente
- `services/nominatim.service.ts`: `reverseGeocode(lat, lon): Promise<string | null>` — nunca lança exceção; inclui header `User-Agent`, timeout via `REQUEST_TIMEOUT_MS` e logs em cada branch (`requesting`, `resolved`, `fallback reason=`)
- `weather.controller.ts`: quando `label` ausente no query, executa `Promise.allSettled([reverseGeocode, getWeatherService])` em paralelo; sobrescreve `location.label` com o valor resolvido ou `DEFAULT_LOCATION_LABEL`; quando `label` presente, curto-circuita sem chamar Nominatim
- Sem `any`; timeout e URLs via constantes; arquivos em kebab-case; testes com `it('deve…')` em pt-BR

</requirements>

## Subtarefas

- [x] 1.1 Adicionar `NOMINATIM_BASE_URL` e `NOMINATIM_USER_AGENT` em `backend/src/config.ts`
- [x] 1.2 Estender `httpGet` em `backend/src/lib/http.ts` com `options` (headers + timeoutMs)
- [x] 1.3 Criar `backend/src/lib/nominatim-address.ts` com a lógica de extração de label
- [x] 1.4 Criar `backend/src/lib/nominatim-address.test.ts` com todos os cenários unitários
- [x] 1.5 Criar `backend/src/services/nominatim.service.ts` com `reverseGeocode`
- [x] 1.6 Criar `backend/src/services/nominatim.service.test.ts` com todos os cenários unitários
- [x] 1.7 Atualizar `backend/src/controllers/weather.controller.ts` com orquestração paralela
- [x] 1.8 Atualizar `backend/src/weather.integration.test.ts` com cenários de Nominatim

## Detalhes de implementação

Ver `techspec.md` — seções: **Arquitetura do sistema**, **Design de implementação**, **Pontos de integração**, **Abordagem de testes (unitários e integração)** e **Sequenciamento do desenvolvimento (passos 1–5)**.

## Critérios de sucesso

- `npm test` no `backend/` passa sem erros com todos os novos cenários cobrindo sucesso, fallback HTTP, fallback timeout, campos ausentes e curto-circuito com label
- `reverseGeocode` nunca propaga exceção — qualquer falha retorna `null`
- Controller responde com `location.label` preenchido pelo Nominatim quando disponível, ou `DEFAULT_LOCATION_LABEL` nos demais casos
- Busca manual (query com `label`) não dispara chamada ao Nominatim

## Testes da tarefa

- [ ] Testes unitários — `nominatim-address.test.ts` (3 cenários) e `nominatim.service.test.ts` (7 cenários) conforme `techspec.md`
- [ ] Testes de integração — 4 novos cenários em `weather.integration.test.ts` conforme `techspec.md`

## Arquivos relevantes

- `backend/src/config.ts` *(modificado)*
- `backend/src/lib/http.ts` *(modificado)*
- `backend/src/lib/nominatim-address.ts` *(novo)*
- `backend/src/lib/nominatim-address.test.ts` *(novo)*
- `backend/src/services/nominatim.service.ts` *(novo)*
- `backend/src/services/nominatim.service.test.ts` *(novo)*
- `backend/src/controllers/weather.controller.ts` *(modificado)*
- `backend/src/weather.integration.test.ts` *(modificado)*
