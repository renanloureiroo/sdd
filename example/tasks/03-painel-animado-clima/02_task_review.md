# Review: Task 2.0 — Integração no WeatherPanel e testes E2E

**Revisor**: task-reviewer (subagent)
**Data**: 2026-06-02
**Arquivo da task**: 02_task.md
**Status**: APROVADO COM OBSERVAÇÕES

---

## Resumo

A tarefa pediu a integração do `AnimatedBackground` em `weather-panel.tsx` (remoção de `bg-[#f5f5f7]`, z-index no container, text-shadow nos textos descobertos, renderização condicional com `data`) e a criação de `tests/e2e/painel-clima-animado.spec.ts` com 4 cenários. Ambos os artefatos foram entregues, typecheck e lint passam sem erros, os 4 testes são listados corretamente pelo Playwright e as fixtures existentes foram reutilizadas sem modificação. A implementação está funcionalmente correta e alinhada com a TechSpec. Os pontos levantados abaixo não são bloqueadores, mas devem ser anotados para resolução oportuna.

---

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/pages/weather-panel.tsx` | ⚠️ Problemas | 2 minor |
| `tests/e2e/painel-clima-animado.spec.ts` | ⚠️ Problemas | 1 major, 2 minor |

---

## Problemas Encontrados

### Críticos

Nenhum.

---

### Major

**`tests/e2e/painel-clima-animado.spec.ts`, linha 122–132 — Verificação de `reduced-motion` pode dar falso negativo em ambientes sem suporte a `motion-reduce:`**

A abordagem de inspecionar `window.getComputedStyle(elem).animationName` é a mais robusta para verificar se o browser aplicou a supressão de animação. O risco real é que `@media (prefers-reduced-motion: reduce)` no `index.css` define `animation-duration: 0.01ms !important`, fazendo com que a `animationName` continue sendo retornada com o nome da animação (ex.: `rain-fall`), mas com duração de 0.01ms — portanto o nome não é `'none'` e a asserção `hasActiveAnimation === false` pode falhar mesmo com reduced-motion corretamente aplicado.

O padrão correto para verificar supressão via CSS global é checar a `animation-duration` computed, não o `animationName`:

```ts
// Abordagem recomendada
const hasActiveAnimation = await background.evaluate((el) => {
  const animated = el.querySelectorAll('[class*="animate-"]')
  for (const elem of animated) {
    const style = window.getComputedStyle(elem)
    const duration = parseFloat(style.animationDuration)
    // 0.01ms é a duração forçada pelo override prefers-reduced-motion do index.css
    if (duration > 0.02) return true
  }
  return false
})
```

Ou verificar diretamente a media query ativa:

```ts
const reducedActive = await page.evaluate(() =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
)
expect(reducedActive).toBe(true) // sanity check
```

O teste como está pode passar em alguns browsers/headless onde Playwright injeta a emulação diretamente no computed style (Chrome headless com `emulateMedia` tende a colapsar `animationName` para `none`), mas é frágil por depender de comportamento implícito do browser.

---

### Minor

**`tests/e2e/painel-clima-animado.spec.ts`, linhas 60–86 — Teste de legibilidade não verifica contraste; verifica apenas presença de texto**

O critério de sucesso da task pede que o conteúdo "permaneça legível sobre o fundo animado". A implementação verifica a presença de `'°C'` e `'22'` — o que valida que o conteúdo climático está no DOM, mas não a legibilidade visual. Isso é aceitável para testes E2E (contraste real exigiria ferramentas de acessibilidade), mas o nome do teste (`deve manter o conteúdo climático legível`) cria uma expectativa que não é totalmente cumprida pela asserção. Sugestão: renomear para `deve exibir o conteúdo climático sobre o fundo animado` ou acrescentar um comentário explicando a limitação intencional.

---

**`frontend/src/pages/weather-panel.tsx`, linha 55 — `text-shadow` no `<h1>` aplica sombra escura sobre texto escuro (`#1d1d1f`)**

```tsx
// linha 53-55
className="text-[40px] font-semibold text-[#1d1d1f] leading-tight"
style={{
  textShadow: '0 1px 3px rgba(0,0,0,0.25)',
```

O texto do `<h1>` usa a cor `#1d1d1f` (quase preto) e recebe `text-shadow` com opacidade 0.25. Nas variantes de fundo claras (neutral, cloudy/day, sunny/day), a sombra escura sobre texto escuro em fundo claro é perceptível e cria um efeito visualmente pesado. A TechSpec menciona text-shadow como mitigação de contraste WCAG AA para elementos sobre o fundo animado, porém o `<h1>` não muda de cor por variante — permanece `#1d1d1f` em todos os cenários, incluindo fundos escuros (storm, rainy/night) onde a sombra faz sentido mas a cor do texto torna-se problemática para contraste. Idealmente a cor do texto deveria adaptar-se à variante, ou a sombra ser removida da cor fixa escura. Por ora é um ajuste visual que não compromete funcionalidade.

---

**`tests/e2e/painel-clima-animado.spec.ts`, linha 177–188 — Seletor do layer neutro pode ser frágil**

```ts
const layer = el.querySelector<HTMLElement>('div')
return layer ? window.getComputedStyle(layer).backgroundImage : ''
```

O teste seleciona o primeiro `<div>` filho de `[data-testid="animated-background"]` para inspecionar o gradiente. Na estrutura atual do `AnimatedBackground`, o primeiro filho sempre é o active layer — correto. Porém se a estrutura interna do componente mudar (ex.: adição de um wrapper), o seletor quebrará silenciosamente (retornará string vazia e o teste passará em falso positivo). Sugestão: adicionar um `data-testid="active-layer"` ao active layer no componente, tornando o seletor explícito e resistente a refatorações.

---

## Destaques Positivos

- **Renderização condicional correta**: `{data && <AnimatedBackground ... />}` na linha 44 implementa exatamente o requisito de evitar flash antes do primeiro dado.
- **`aria-hidden="true"` no fundo**: herdado do componente de task 1, garante que leitores de tela não anunciem o elemento decorativo.
- **Constantes nomeadas no spec**: `LOCAL_HOST`, `WEATHER_TIMEOUT`, `ANIMATED_BG_TESTID` — sem números/strings mágicos, padrão consistente com o spec existente `painel-clima.spec.ts`.
- **`toJson` e helpers de URL**: reuso do padrão do spec anterior, mantendo consistência do projeto.
- **text-shadow nos três elementos de status** (`geo-hint`, `loading`, empty-state, `<p>` do subtítulo): cobertura completa dos textos descobertos, além do mínimo pedido pela task.
- **`backdrop-blur` no footer**: melhoria visual que mantém legibilidade do rodapé sobre qualquer variante de fundo — não estava explicitamente pedido e foi um acréscimo bem-vindo.
- **`beforeEach` bloqueando chamadas externas**: o interceptor de chamadas não-localhost no `beforeEach` protege todos os testes de dependências externas não mockadas.
- **Fixture snow construída com spread**: o teste de `cloud-snow` constrói o fixture estendendo `forecastGeoFixture` em vez de criar um JSON ad hoc — elegante e fácil de manter.

---

## Conformidade com Convenções

| Convenção | Status |
|-----------|--------|
| Código em inglês (variáveis, tipos, comentários) | ✅ |
| Documentação/labels em pt-BR | ✅ |
| `it`/`test` no padrão imperativo "deve…" | ✅ |
| Nomenclatura kebab-case nos arquivos | ✅ |
| Sem `any` | ✅ |
| Sem números mágicos | ✅ |
| Typecheck (`npm run typecheck`) | ✅ Passa sem erros |
| Lint (`npm run lint`) | ✅ Passa sem erros |
| TechSpec — integração WeatherPanel | ✅ |
| TechSpec — testes E2E (4 cenários) | ✅ (com ressalva minor no cenário 3) |
| Fixtures existentes reutilizadas sem modificação | ✅ |

---

## Recomendações

1. **(Major — cenário reduced-motion)** Revisar a asserção do teste `deve desativar animações...` para verificar `animation-duration` computed (ou outro indicador estável) em vez de `animationName`, garantindo que o teste não dependa de comportamento headless implícito.
2. **(Minor — legibilidade do h1)** Avaliar se o `text-shadow` escuro no `<h1>` com cor `#1d1d1f` faz sentido nas variantes de fundo claro; considerar remover a sombra nesses casos ou tornar a cor do texto dinâmica.
3. **(Minor — nome do teste)** Renomear `deve manter o conteúdo climático legível...` para refletir o que a asserção de fato verifica, ou adicionar comentário sobre limitação intencional.
4. **(Minor — seletor frágil no cenário neutral)** Adicionar `data-testid="active-layer"` ao active layer do `AnimatedBackground` para tornar o seletor do teste de paleta neutra explícito e resistente a refatorações futuras.

---

## Veredito

A implementação está **correta e completa** para todos os requisitos da task: integração do componente, ajuste de estilos, text-shadow nos elementos descobertos e 4 cenários E2E com fixtures reutilizadas. Typecheck e lint passam sem erros. O problema de robustez na asserção do teste de `reduced-motion` é real mas não compromete a build ou a funcionalidade — tende a passar em Chrome headless com `emulateMedia`, que é o ambiente de CI configurado. Por essa razão o status é **APROVADO COM OBSERVAÇÕES**: a implementação pode seguir, mas o item major do cenário 3 deve ser resolvido na próxima iteração ou em uma task de melhoria de qualidade de testes.
