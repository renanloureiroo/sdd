# Tarefa 1.0: Fundação do componente animado

## Visão geral

Criar o utilitário de mapeamento de variante climática, registrar os keyframes e classes de animação no Tailwind, e implementar o componente `AnimatedBackground` com suporte a cross-fade de dois layers, elementos decorativos por variante × período e respeito a `prefers-reduced-motion`.

<skills>
### Conformidade com skills

- **`react-frontend-expert`** — componente funcional TypeScript, hooks, acessibilidade, `data-testid`, sem `any`.
</skills>

<requirements>

- `lib/weather-variant.ts` exporta `WeatherVariant` (union type) e `resolveVariant(icon: string): WeatherVariant`.
- Mapeamento completo dos 8 ícones existentes conforme `techspec.md` (tabela de mapeamento icon → WeatherVariant).
- Ícones não mapeados retornam `'neutral'`.
- `tailwind.config.js` estendido com keyframes e classes `animate-*`: `float-cloud`, `rain-fall`, `lightning-flash`, `star-twinkle`, `sun-pulse`, `fade-in`.
- `index.css` com `@media (prefers-reduced-motion: reduce)` desativando todas as animações residuais.
- `components/animated-background.tsx` usa dois `<div>` sobrepostos com `transition-opacity duration-1000` para cross-fade.
- Elementos decorativos (sol, lua, estrelas, nuvens, gotas, relâmpago) renderizados por variante × período conforme paleta da `techspec.md`.
- `motion-reduce:animate-none` aplicado em cada elemento animado individualmente.
- Flash de relâmpago configurado para ≤ 0,25 Hz (1 flash a cada ≥ 4s), abaixo do limite WCAG de 3 Hz.
- Elemento raiz com `aria-hidden="true"` e `data-testid="animated-background"`.
- Durations, opacidades e tamanhos extraídos como constantes nomeadas — sem números mágicos.
- Sem `any`; `WeatherVariant` tipado explicitamente.
- Nomes de arquivos em kebab-case.

</requirements>

## Subtarefas

- [x] 1.1 Criar `frontend/src/lib/weather-variant.ts` com `WeatherVariant` e `resolveVariant`
- [x] 1.2 Criar `frontend/src/lib/weather-variant.test.ts` com testes unitários (todos os ícones + fallback)
- [x] 1.3 Estender `frontend/tailwind.config.js` com keyframes e classes `animate-*`
- [x] 1.4 Adicionar override `prefers-reduced-motion` em `frontend/src/index.css`
- [x] 1.5 Criar `frontend/src/components/animated-background.tsx` com lógica de cross-fade, elementos decorativos e `reduced-motion`

## Detalhes de implementação

Ver `techspec.md`:
- **Principais interfaces** — tipos `WeatherVariant` e `AnimatedBackgroundProps`.
- **Modelos de dados** — tabela de mapeamento icon → WeatherVariant e paleta por variante × período.
- **Principais decisões** — `position: fixed`, cross-fade via dois layers, keyframes no Tailwind, `<div>` puro para elementos decorativos.

## Critérios de sucesso

- Todos os 8 ícones mapeados retornam a `WeatherVariant` correta nos testes unitários.
- Ícones não mapeados retornam `'neutral'` sem erro.
- O componente renderiza sem erro para todas as 8 combinações variante × período.
- `motion-reduce:animate-none` neutraliza animações quando `prefers-reduced-motion: reduce` está ativo.
- Sem erros de TypeScript (`npm run typecheck` passa).

## Testes da tarefa

- [x] **Unitários** — `frontend/src/lib/weather-variant.test.ts`:
  - deve retornar `'sunny'` para ícone `'sun'`
  - deve retornar `'cloudy'` para ícones `'cloud-sun'`, `'cloud'`, `'cloud-fog'`
  - deve retornar `'rainy'` para ícones `'cloud-drizzle'`, `'cloud-rain'`
  - deve retornar `'storm'` para ícone `'cloud-lightning'`
  - deve retornar `'neutral'` para `'cloud-snow'`, string vazia e `'unknown'`
- [ ] **Integração** — não necessária (componente visual puro; lógica de mapeamento coberta nos unitários).
- [ ] **E2E** — cobertos na Tarefa 2.0.

## Arquivos relevantes

- `frontend/src/lib/weather-variant.ts` *(novo)*
- `frontend/src/lib/weather-variant.test.ts` *(novo)*
- `frontend/src/components/animated-background.tsx` *(novo)*
- `frontend/tailwind.config.js` *(modificado)*
- `frontend/src/index.css` *(modificado)*
