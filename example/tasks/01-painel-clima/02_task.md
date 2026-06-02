# Tarefa 2.0: Frontend do Painel de Clima (busca, clima atual, previsão horária, geolocalização)

## Visão geral

Construir o painel React completo que consome **exclusivamente** o BFF da Tarefa 1.0. Inclui a infraestrutura de data fetching (TanStack Query), a busca de cidade com desambiguação, o bloco de clima atual, a faixa de previsão horária, a sugestão por geolocalização e todos os estados de loading/erro/retry. Toda a UI segue integralmente o `DESIGN.md` (estética Apple, acento único Action Blue, input em pill, SF Pro/Inter), em pt-BR e sistema métrico, com acessibilidade.

<skills>
### Conformidade com skills

- **`react-frontend-expert`** — componentes funcionais, hooks customizados, data fetching com TanStack Query, TypeScript strict, forms, routing, acessibilidade (rótulos, `aria-label` em ícones, anúncio de loading/erro).
- **`DESIGN.md`** — seguir integralmente para toda a UI (ler antes de implementar).
</skills>

<requirements>
- Cobre os requisitos do PRD: 1–4 (busca + desambiguação + "não encontrada" + entrada vazia), 5–13 (clima atual + previsão horária navegável/responsiva + hora atual destacada), 14–16 (geolocalização concedida/negada sem bloqueio), 17–19 (loading, erro pt-BR com "tentar novamente", consumo só do backend).
- Fluxo de dados: `city-search` → `GET /api/weather/search` → seleção de candidato → `use-weather` → `GET /api/weather?lat&lon&label`. No carregamento, `use-geolocation` tenta coords e dispara `use-weather` direto (sem geocoding); rótulo neutro "Sua localização".
- Busca com **debounce** (mitiga rate-limit); entrada vazia/curta não dispara consulta.
- Geolocalização negada/indisponível → estado inicial de busca manual, **sem erro intrusivo**.
- Ícones de condição com `aria-label` textual; campo de busca operável por teclado; estados anunciáveis por leitor de tela.
- Crédito "Dados meteorológicos: Open-Meteo" no rodapé (CC BY 4.0).
- Regras do projeto: código em inglês, sem `any`, sem números mágicos, arquivos kebab-case, commits semânticos.
</requirements>

## Subtarefas

- [ ] 2.1 Adicionar `@tanstack/react-query`; configurar `QueryClientProvider` em `main.tsx`; renderizar `WeatherPanel` em `App.tsx`.
- [ ] 2.2 Criar `types/weather.ts` (contratos compartilhados), `lib/api.ts` (cliente HTTP do BFF) e `lib/weather-condition.ts` (labels/ícones pt-BR).
- [ ] 2.3 Implementar hooks: `use-debounce`, `use-city-search`, `use-weather` (TanStack Query), `use-geolocation`.
- [ ] 2.4 Implementar `components/city-search.tsx` (searchbox rotulado "cidade" + lista de candidatos + botão "Buscar") com desambiguação e "cidade não encontrada".
- [ ] 2.5 Implementar `components/current-weather.tsx` (region "clima": temperatura, condição+ícone, sensação, vento, umidade, precipitação, cidade/região) e `components/weather-icon.tsx`.
- [ ] 2.6 Implementar `components/hourly-forecast.tsx` (faixa horizontal rolável, hora atual destacada, responsiva).
- [ ] 2.7 Implementar `components/feedback/loading-state.tsx` e `error-state.tsx` (com "tentar novamente"); compor tudo em `pages/weather-panel.tsx`.
- [ ] 2.8 Escrever testes unitários disponíveis e validar a11y/visual (ver "Testes da tarefa").

## Detalhes de implementação

Ver `techspec.md` → "Arquitetura do sistema" (componentes frontend e fluxo de dados), "Design de implementação" (interface `WeatherApi`, modelos compartilhados), "Considerações técnicas" (decisões TanStack Query, sem reverse geocoding, geolocalização como caminho normal) e o `DESIGN.md`. Não reproduzir a implementação aqui — referenciar a techspec e o DESIGN.

## Critérios de sucesso

- Painel utilizável: digitar cidade → (desambiguar se preciso) → ver clima atual + previsão horária; geolocalização concedida pré-carrega o clima.
- Frontend nunca chama o Open-Meteo diretamente (apenas o BFF).
- `npm run typecheck` e `npm run lint` (frontend) verdes; sem `any`/números mágicos.
- UI aderente ao `DESIGN.md`; estados de loading/erro/retry e a11y (rótulos/`aria-label`) presentes.

## Testes da tarefa

- [ ] **Testes unitários** — se runner disponível no frontend: `use-debounce`, mapeamento de condição (`weather-condition`), e estados de `use-weather` (loading/erro/sucesso) com `fetch` mockado.
- [ ] **Testes de integração** — N/A no frontend isolado (contrato validado na 1.0; jornada na 3.0).
- [ ] **Testes E2E** — cobertos na Tarefa 3.0 (esta tarefa deve deixar os papéis/rótulos `searchbox` "cidade", botão "Buscar" e `region` "clima" prontos para o E2E).

## Arquivos relevantes

- `frontend/src/main.tsx` (mod.), `frontend/src/App.tsx` (mod.)
- `frontend/src/pages/weather-panel.tsx`
- `frontend/src/components/city-search.tsx`, `current-weather.tsx`, `hourly-forecast.tsx`, `weather-icon.tsx`, `components/feedback/loading-state.tsx`, `error-state.tsx`
- `frontend/src/hooks/use-city-search.ts`, `use-weather.ts`, `use-geolocation.ts`, `use-debounce.ts`
- `frontend/src/lib/api.ts`, `lib/weather-condition.ts`, `types/weather.ts`
- `frontend/package.json` (@tanstack/react-query), `DESIGN.md`
</content>
