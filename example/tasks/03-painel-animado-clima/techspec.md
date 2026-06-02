# Especificação Técnica

## Resumo executivo

O Painel Animado de Clima é implementado como um componente React puro `AnimatedBackground` de responsabilidade única: receber o estado climático atual (`icon: string`, `isDay: boolean`) e renderizar um fundo animado de tela cheia via `position: fixed`. As animações são inteiramente CSS, registradas como extensões do `tailwind.config.js` existente; não há novas dependências de runtime. O mapeamento dos 8 ícones de domínio existentes para os 4 variantes animados (sunny/cloudy/rainy/storm + neutral de fallback) fica encapsulado em um utilitário `weather-variant.ts`. A transição entre estados usa o padrão de dois layers sobrepostos com `transition-opacity`, evitando a ausência de suporte nativo a interpolação de gradientes no CSS. Suporte a `prefers-reduced-motion` é aplicado via utilitário Tailwind `motion-reduce:animate-none` nos elementos individuais.

## Arquitetura do sistema

### Visão dos componentes

**Frontend (`frontend/src/`) — novos:**

- `components/animated-background.tsx` — componente principal; `position: fixed`, `z-0`; gerencia dois layers (prev/current) para cross-fade; renderiza elementos decorativos (divs animados) por variante × período.
- `lib/weather-variant.ts` — mapeia `icon: string` → `WeatherVariant`; encapsula a lógica de normalização dos 8 ícones existentes para os 4 estados animados + `'neutral'` de fallback.

**Frontend — modificados:**

- `tailwind.config.js` — adiciona `keyframes` e `animation` personalizados ao `theme.extend` (float-cloud, rain-fall, lightning-flash, star-twinkle, sun-pulse, fade-in).
- `index.css` — adiciona `@media (prefers-reduced-motion: reduce)` de segurança para neutralizar animações residuais.
- `pages/weather-panel.tsx` — importa `AnimatedBackground`; muda `<main>` de `bg-[#f5f5f7]` para `bg-transparent`; adiciona `relative z-10` ao container de conteúdo para sobrepor o fundo fixo; passa `current.icon` e `current.isDay` ao componente.

**Fluxo de dados:** `WeatherResponse.current.{icon, isDay}` (já presente via `useWeather`) → `WeatherPanel` → props `AnimatedBackground` → seleção de variante visual interna → renderização de layers + elementos decorativos.

## Design de implementação

### Principais interfaces

```ts
// lib/weather-variant.ts
type WeatherVariant = 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'neutral';

function resolveVariant(icon: string): WeatherVariant;

// components/animated-background.tsx
interface AnimatedBackgroundProps {
  icon: string;
  isDay: boolean;
}
```

### Modelos de dados

**Mapeamento icon → WeatherVariant:**

| icon (existente)   | WeatherVariant |
|--------------------|----------------|
| `sun`              | `sunny`        |
| `cloud-sun`        | `cloudy`       |
| `cloud`            | `cloudy`       |
| `cloud-fog`        | `cloudy`       |
| `cloud-drizzle`    | `rainy`        |
| `cloud-rain`       | `rainy`        |
| `cloud-snow`       | `neutral`      |
| `cloud-lightning`  | `storm`        |
| qualquer outro     | `neutral`      |

**Paleta por variante × período (inline, sem novo token — usa valores absolutos):**

| Variante × Período | Gradiente de fundo (from → to)             | Elementos decorativos               |
|--------------------|--------------------------------------------|-------------------------------------|
| sunny/day          | `#7EC8E3` → `#FDB347`                     | Sun (circle), raios suaves          |
| sunny/night        | `#0B1426` → `#1E3A5F`                     | Moon (circle), stars (dots)         |
| cloudy/day         | `#8FA9C3` → `#B8CEDE`                     | Cloud divs (drift lento)            |
| cloudy/night       | `#1E2D3D` → `#2E3F50`                     | Cloud divs escuros, estrelas tênues |
| rainy/day          | `#4B6082` → `#627490`                     | Rain drops, nuvem de fundo          |
| rainy/night        | `#1A1F2E` → `#252B3B`                     | Rain drops (mais claros), nuvem     |
| storm/day          | `#2D3748` → `#4A5568`                     | Rain denso, lightning flash div     |
| storm/night        | `#111827` → `#1F2937`                     | Rain denso escuro, lightning flash  |
| neutral (qualquer) | `#E8EEF4` → `#F5F5F7` (parchment suave)  | Nenhum                              |

### Endpoints da API

Não aplicável — feature exclusivamente frontend sem novas chamadas ao backend.

## Pontos de integração

- **`WeatherPanel` → `AnimatedBackground`**: lê `data.current.icon` e `data.current.isDay` (campos já presentes em `WeatherResponse.current`; sem alteração de contrato no backend).
- **`tailwind.config.js`**: extensão de `keyframes`/`animation` afeta o bundle CSS gerado; confirmar que o Tailwind JIT inclui as novas classes nos arquivos `.tsx`.
- **`index.css`**: `@media (prefers-reduced-motion: reduce)` desativa animações de forma global como fallback de segurança além do `motion-reduce:` Tailwind aplicado individualmente.

## Abordagem de testes

### Testes unitários

**`lib/weather-variant.ts`** (Vitest — `frontend/src/lib/weather-variant.test.ts`)

- Cada um dos 8 ícones mapeados retorna o `WeatherVariant` correto.
- Ícone não mapeado (`'cloud-snow'`, string vazia, `'unknown'`) retorna `'neutral'`.

### Testes de integração

Não necessários para este componente visual puro — sem lógica de negócio além do mapeamento coberto nos unitários.

### Testes E2E

**`tests/e2e/painel-clima-animado.spec.ts`** (Playwright)

- **Fundo renderizado após busca**: após `getByRole('region', { name: /clima/i })` visível, verificar que o elemento com `data-testid="animated-background"` está presente no DOM.
- **Legibilidade do conteúdo**: `getByRole('region', { name: /clima/i })` continua visível e com texto legível (snapshot ou contraste aferido via avaliação JS de `getComputedStyle`).
- **Reduced-motion**: `page.emulateMedia({ reducedMotion: 'reduce' })` antes de navegar; verificar que nenhum elemento dentro de `[data-testid="animated-background"]` possui classe `animate-*` ativa (via verificação de computed style ou `classList`).
- **Fallback neutral**: usar fixture com `icon: 'cloud-snow'`; verificar que o fundo exibe a paleta neutra sem erro visual.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **`lib/weather-variant.ts` + testes unitários** — base sem dependência de UI; permite validar o mapeamento antes de qualquer renderização.
2. **`tailwind.config.js` — keyframes e classes `animate-*`** — prerequisito para os elementos animados no componente.
3. **`components/animated-background.tsx`** — lógica de dois layers (cross-fade), elementos decorativos por variante × período, `motion-reduce:animate-none` nos elementos animados.
4. **`index.css` — override `prefers-reduced-motion`** — camada de segurança além do Tailwind.
5. **Integração em `weather-panel.tsx`** — remoção de `bg-[#f5f5f7]` da `<main>`, adição de `relative z-10` no container, renderização de `AnimatedBackground` passando `icon` e `isDay`.
6. **Testes E2E** — `painel-clima-animado.spec.ts` com fixtures existentes (os fixtures `forecast.json` e `forecast-geo.json` já fornecem `isDay` via campo `current.isDay`).

### Dependências técnicas

- Nenhuma nova dependência de runtime; apenas extensão de configuração Tailwind.
- O campo `current.isDay` já existe em `WeatherResponse` (backend entrega `is_day` do Open-Meteo via `CurrentWeather.isDay`).
- Fixtures E2E existentes (`forecast.json`, `forecast-geo.json`) já possuem `current.isDay` — reutilizáveis sem modificação.

## Monitoramento e observabilidade

- **Logs**: nenhum log adicional necessário — o componente é puramente declarativo e não realiza chamadas de rede.
- **Métricas de performance visual**: animações restritas a `transform` e `opacity` garantem que o browser as execute no compositor (GPU), fora do thread principal. Verificar ausência de `layout` ou `paint` no DevTools Performance durante transição de condição.
- **Frequência do flash de relâmpago**: o keyframe `lightning-flash` deve ser configurado para no máximo 1 flash a cada 4 segundos (~0,25 Hz), bem abaixo do limite WCAG de 3 Hz para prevenção de gatilhos fotossensíveis.

## Considerações técnicas

### Principais decisões

- **`position: fixed` para o fundo**: garante cobertura total do viewport independente do conteúdo; conteúdo mantém `z-10`, fundo fica em `z-0`. Trade-off: requer que o `<main>` passe a `bg-transparent`; cards de conteúdo (`bg-white`, `rounded-[18px]`) preservam legibilidade por si mesmos.
- **Cross-fade via dois layers sobrepostos**: CSS não interpola `background-image: linear-gradient()` nativamente. A solução é manter dois `<div>` absolutos sobrepostos; o layer "anterior" sai de `opacity-100` para `opacity-0` enquanto o layer "atual" entra de `opacity-0` para `opacity-100`, ambos com `transition-opacity duration-1000`. Isso simula cross-fade suave independente de browser.
- **Keyframes no `tailwind.config.js`**: consistente com o padrão do projeto (accordion já usa esse approach); classes ficam disponíveis como `animate-float-cloud`, `animate-rain-fall`, etc., e o utilitário `motion-reduce:animate-none` do Tailwind neutraliza automaticamente.
- **Prop `icon: string`** (sem novo union type): preserva o contrato existente de `CurrentWeather.icon` sem criar acoplamento adicional; o mapeamento para `WeatherVariant` fica encapsulado em `weather-variant.ts`, seguindo o princípio de responsabilidade única.
- **Elementos decorativos como `<div>` puro**: zero dependência adicional, máxima performance via GPU (border-radius + transform/opacity). Formas complexas (sol, lua) são círculos com `border-radius: 50%`; estrelas são pontos de 2–4px.

### Riscos conhecidos

- **Legibilidade do header e mensagens de estado**: o texto do header (`h1`, `p`) e os estados de geo-hint ficam sobre o fundo animado sem card branco. Mitigação: adicionar `text-shadow: 0 1px 3px rgba(0,0,0,0.3)` nesses elementos, garantindo contraste WCAG AA em qualquer variante do fundo.
- **Transição no carregamento inicial**: na primeira renderização sem dados (`activeParams === null`), `AnimatedBackground` ainda não é exibido — exibe-se somente quando `data` existe. Isso evita flash do fundo sem conteúdo; o estado neutro `#f5f5f7` da parchment permanece via CSS do body até o primeiro dado aparecer.
- **`cloud-snow` como `neutral`**: neve está fora do escopo do PRD; o mapeamento para `'neutral'` garante ausência de erro visual sem comportamento especial.

### Conformidade com rules

- **Idioma do código**: inglês (identificadores, tipos, comentários). Docs e labels em pt-BR.
- **Nomenclatura kebab-case**: `animated-background.tsx`, `weather-variant.ts`.
- **Sem `any`**: `WeatherVariant` como union type explícito; `resolveVariant` retorna tipo estrito.
- **Sem números mágicos**: durations de animação, opacidades e tamanhos de elementos decorativos extraídos como constantes nomeadas dentro de `animated-background.tsx`.
- **Sem logging adicional** (frontend): componente visual puro, sem side effects.
- **Commits semânticos**: `feat(frontend): add animated background component`.

### Conformidade com skills

- **`react-frontend-expert`**: componente funcional com hook `useState` para controle de cross-fade, TypeScript strict, sem `any`, acessibilidade (elemento `aria-hidden="true"` no fundo decorativo para não ser anunciado por leitores de tela), `data-testid` para testes.
- **`DESIGN.md`**: paletas de cor definidas dentro dos limites do design (superfícies escuras e claras do sistema); o conteúdo sobreposto preserva a hierarquia tipográfica SF Pro/Inter, botões e cards intactos. O fundo não introduz novos tokens de cor ao design system — usa valores absolutos no componente visual.

### Arquivos relevantes e dependentes

**Novos:**
- `frontend/src/components/animated-background.tsx`
- `frontend/src/lib/weather-variant.ts`
- `frontend/src/lib/weather-variant.test.ts`
- `tests/e2e/painel-clima-animado.spec.ts`

**Modificados:**
- `frontend/tailwind.config.js` (extend.keyframes + extend.animation)
- `frontend/src/index.css` (prefers-reduced-motion override)
- `frontend/src/pages/weather-panel.tsx` (integração do componente + ajuste de bg)
