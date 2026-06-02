# Tarefa 2.0: Integração no WeatherPanel e testes E2E

## Visão geral

Integrar o `AnimatedBackground` na página `weather-panel.tsx`, ajustar o background e z-index do container de conteúdo, e validar o comportamento completo via testes E2E Playwright (fundo renderizado, legibilidade do conteúdo, reduced-motion, fallback neutral).

<skills>
### Conformidade com skills

- **`react-frontend-expert`** — integração de componente, props, z-index, acessibilidade.
</skills>

<requirements>

- `pages/weather-panel.tsx` importa e renderiza `<AnimatedBackground icon={...} isDay={...} />`.
- O `<main>` passa de `bg-[#f5f5f7]` para `bg-transparent`.
- O container de conteúdo recebe `relative z-10` para sobrepor o fundo fixo.
- Props passadas: `current.icon` e `current.isDay` vindos de `useWeather`.
- `AnimatedBackground` só é renderizado quando `data` existe (evita flash antes do primeiro dado).
- Elementos de header/geo-hint sobre o fundo recebem `text-shadow` para garantir contraste WCAG AA.
- Testes E2E cobrem os 4 cenários da `techspec.md`.
- Fixtures E2E existentes (`forecast.json`, `forecast-geo.json`) reutilizadas sem modificação.

</requirements>

## Subtarefas

- [x] 2.1 Modificar `frontend/src/pages/weather-panel.tsx`: importar `AnimatedBackground`, remover `bg-[#f5f5f7]` do `<main>`, adicionar `relative z-10` ao container de conteúdo, renderizar `AnimatedBackground` condicionalmente quando `data` existe
- [x] 2.2 Adicionar `text-shadow` nos elementos de header e geo-hint que ficam sobre o fundo sem card branco
- [x] 2.3 Criar `tests/e2e/painel-clima-animado.spec.ts` com os 4 cenários E2E

## Detalhes de implementação

Ver `techspec.md`:
- **Pontos de integração** — `WeatherPanel` → `AnimatedBackground`, `data.current.icon` e `data.current.isDay`.
- **Riscos conhecidos** — legibilidade do header (text-shadow), transição no carregamento inicial (renderizar somente com `data`).
- **Testes E2E** — seletor `data-testid="animated-background"`, `page.emulateMedia({ reducedMotion: 'reduce' })`, fixture `cloud-snow` para neutral.

## Critérios de sucesso

- `data-testid="animated-background"` presente no DOM após busca bem-sucedida.
- Conteúdo climático (temperatura, condições, previsão) permanece legível sobre o fundo animado.
- Com `reducedMotion: 'reduce'`, nenhum elemento dentro do fundo possui animação ativa.
- Com fixture `cloud-snow`, fundo exibe paleta neutra sem erro visual.
- `npm run typecheck` e `npm run lint` passam sem erros.

## Testes da tarefa

- [ ] **E2E** — `tests/e2e/painel-clima-animado.spec.ts`:
  - deve renderizar o fundo animado após busca bem-sucedida
  - deve manter o conteúdo climático legível sobre o fundo animado
  - deve desativar animações quando `prefers-reduced-motion: reduce` está ativo
  - deve exibir a paleta neutra sem erro visual para condição não mapeada (`cloud-snow`)

## Arquivos relevantes

- `frontend/src/pages/weather-panel.tsx` *(modificado)*
- `tests/e2e/painel-clima-animado.spec.ts` *(novo)*
- `tests/e2e/fixtures/forecast.json` *(reutilizado, sem modificação)*
- `tests/e2e/fixtures/forecast-geo.json` *(reutilizado, sem modificação)*
