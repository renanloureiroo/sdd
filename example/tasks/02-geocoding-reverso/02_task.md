# Tarefa 2.0: Frontend e E2E

## Visão geral

Remover o label hardcoded `"Sua localização"` do payload de geolocalização no frontend — o backend agora retorna `location.label` resolvido automaticamente. Adicionar specs E2E cobrindo o fluxo de sucesso (Nominatim responde) e o fluxo de fallback (Nominatim falha).

<skills>
### Conformidade com skills

- **`react-frontend-expert`** — data fetching via hook existente; sem novo estado ou loading; segue `DESIGN.md` para UI
</skills>

<requirements>

- Em `frontend/src/pages/weather-panel.tsx`, remover `label: GEO_LOCATION_LABEL` (ou equivalente) do objeto `geoParams` enviado à API; nenhuma outra mudança de lógica no frontend
- O nome da cidade exibido no painel deve refletir `location.label` retornado pelo backend, sem alteração no componente de exibição (o label já é renderizado via dado da API)
- Specs E2E devem interceptar `**/nominatim.openstreetmap.org/**` via `page.route` para simular resposta e erro sem dependência de rede real
- Nenhum estado de loading adicional exclusivo para geocoding — o loading existente cobre o período de resolução

</requirements>

## Subtarefas

- [x] 2.1 Remover `label` hardcoded do `geoParams` em `frontend/src/pages/weather-panel.tsx`
- [x] 2.2 Criar (ou estender) `tests/e2e/weather-geolocation.spec.ts` com cenário de sucesso do Nominatim
- [x] 2.3 Adicionar cenário de fallback (Nominatim status 500) no mesmo arquivo E2E

## Detalhes de implementação

Ver `techspec.md` — seções: **Arquitetura do sistema (Modificados — weather-panel.tsx)**, **Abordagem de testes (E2E)** e **Sequenciamento do desenvolvimento (passos 6–7)**.

## Critérios de sucesso

- Com geolocalização concedida e Nominatim mockado com `{ address: { city: 'Vitória', state: 'Espírito Santo', country: 'Brasil' } }`, o painel exibe `"Vitória, Espírito Santo, Brasil"`
- Com Nominatim mockado retornando status 500, o painel exibe `DEFAULT_LOCATION_LABEL` sem mensagem de erro visível
- `npm run test:e2e` na raiz passa sem erros
- Nenhuma regressão nos testes E2E existentes

## Testes da tarefa

- [ ] Testes E2E — 2 cenários em `tests/e2e/weather-geolocation.spec.ts` conforme `techspec.md`

## Arquivos relevantes

- `frontend/src/pages/weather-panel.tsx` *(modificado)*
- `tests/e2e/weather-geolocation.spec.ts` *(novo ou modificado)*
