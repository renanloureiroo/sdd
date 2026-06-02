# Documento de Requisitos do Produto (PRD)

## Visão Geral

O **Painel Animado de Clima** é um componente visual independente e reutilizável que exibe um fundo animado responsivo às condições meteorológicas e ao período do dia (dia ou noite). Quando integrado ao Painel de Clima (feature `01-painel-clima`), ele transforma a experiência do usuário de uma interface estática em uma visualização imersiva que comunica instantaneamente o contexto climático atual por meio de movimento, cor e elementos visuais.

O problema que resolve: a ausência de feedback visual dinâmico faz com que o painel de clima pareça genérico — a mesma aparência para sol, chuva ou tempestade, de dia ou de noite. O componente entrega essa camada de expressão visual sem depender de dados ou lógica do painel principal, podendo ser reutilizado em outros contextos da aplicação.

É direcionado ao mesmo usuário final do Painel de Clima (público geral, pt-BR), que se beneficia de uma experiência mais rica e intuitiva ao consultar o tempo.

## Objetivos

- Comunicar visualmente a condição climática e o período do dia **sem que o usuário precise ler os dados** — o fundo já transmite a mensagem.
- Suportar as **4 condições climáticas principais**: ensolarado/limpo, nublado/parcialmente nublado, chovendo e tempestade/trovão.
- Diferenciar **dia e noite** por meio de paleta de cores E elementos visuais distintos (sol de dia; lua e estrelas à noite).
- Garantir acessibilidade para usuários que configuraram **redução de movimento** no sistema operacional (`prefers-reduced-motion`).
- Ser um **componente desacoplado** — recebe condição e período como props/parâmetros e não conhece a fonte de dados.

Métricas a acompanhar: ausência de regressões de acessibilidade (contraste, reduced-motion), compatibilidade visual com o `DESIGN.md` aprovado, performance percebida (sem jank nas animações).

## Histórias de Usuário

- **Como** usuário do painel de clima, **quero** que o fundo da tela mude visualmente conforme o tempo atual, **para que** eu perceba a condição climática de forma imediata e intuitiva.
- **Como** usuário, **quero** que o painel exiba elementos de dia (sol) ou de noite (lua e estrelas) de acordo com o horário local, **para que** o visual reflita a realidade do momento.
- **Como** usuário com sensibilidade a animações, **quero** que o painel respeite minha configuração de "redução de movimento" do sistema operacional, **para que** eu possa usar a aplicação sem desconforto ou distração.
- **Como** desenvolvedor, **quero** um componente com interface clara (condição + período como entradas), **para que** eu possa integrá-lo em qualquer ponto da aplicação sem acoplamento à fonte de dados.

## Principais funcionalidades

### 1. Fundo animado por condição climática

- **O que faz:** renderiza uma animação CSS/visual distinta para cada condição meteorológica suportada.
- **Por que é importante:** é o núcleo da feature; sem ela o componente não entrega valor visual.
- **Como funciona (alto nível):** o componente recebe a condição como entrada e seleciona o conjunto de animações e elementos visuais correspondentes.

Requisitos funcionais:

1. O componente **deve** exibir uma animação distinta para a condição **ensolarado/limpo** (ex.: gradiente claro, raios ou brilho do sol).
2. O componente **deve** exibir uma animação distinta para a condição **nublado/parcialmente nublado** (ex.: nuvens em movimento lento).
3. O componente **deve** exibir uma animação distinta para a condição **chovendo** (ex.: gotas de chuva caindo).
4. O componente **deve** exibir uma animação distinta para a condição **tempestade/trovão** (ex.: chuva intensa + flash de relâmpago periódico).
5. Para condições **não mapeadas** explicitamente, o componente **deve** exibir um estado neutro/fallback sem erro visual.

### 2. Diferenciação dia/noite

- **O que faz:** adapta paleta de cores e elementos visuais (sol vs. lua e estrelas) conforme o período do dia.
- **Por que é importante:** o mesmo estado climático (ex.: "limpo") tem aparências completamente diferentes de dia e de noite.
- **Como funciona (alto nível):** o componente recebe o período (dia/noite) como entrada e combina-o com a condição para determinar a variante visual final.

Requisitos funcionais:

6. Durante o **dia**, o componente **deve** usar paleta com tons claros/quentes e exibir elemento solar (sol animado ou brilho).
7. Durante a **noite**, o componente **deve** usar paleta com tons escuros/frios (azul escuro/índigo) e exibir elemento lunar (lua) e estrelas.
8. A combinação **condição + período** **deve** produzir uma variante visual coerente para todos os 8 cenários possíveis (4 condições × 2 períodos).
9. Em condições com cobertura de nuvens (nublado, chovendo, tempestade), os elementos de sol/lua **podem** ficar ocultos ou parcialmente encobertos — o comportamento deve ser visualmente consistente.

### 3. Acessibilidade — redução de movimento

- **O que faz:** desativa ou simplifica as animações quando o usuário configurou `prefers-reduced-motion: reduce` no sistema operacional.
- **Por que é importante:** animações contínuas podem causar desconforto ou náusea em parte dos usuários.
- **Como funciona (alto nível):** a mídia query `prefers-reduced-motion` é detectada e as animações são substituídas por transições instantâneas ou visuais estáticos equivalentes.

Requisitos funcionais:

10. Quando `prefers-reduced-motion: reduce` estiver ativo, o componente **deve** eliminar ou reduzir ao mínimo todas as animações contínuas.
11. Com redução de movimento ativa, o componente **ainda deve** aplicar a paleta de cores e os elementos visuais corretos para condição e período — apenas o movimento é removido/simplificado.

### 4. Interface do componente (contrato de entrada)

- **O que faz:** define como o componente é controlado por quem o integra.
- **Por que é importante:** garante o desacoplamento e a reutilizabilidade.
- **Como funciona (alto nível):** o componente aceita a condição climática e o período do dia como entradas; toda a lógica de renderização é interna.

Requisitos funcionais:

12. O componente **deve** aceitar como entrada a **condição climática** (mapeada para os 4 tipos suportados + fallback).
13. O componente **deve** aceitar como entrada o **período do dia** (dia ou noite).
14. O componente **não deve** fazer chamadas a APIs externas nem conhecer a estrutura de dados do Painel de Clima — recebe apenas os valores já resolvidos.

## Experiência do usuário

**Personas e necessidades:** público geral pt-BR que abre o painel para uma consulta rápida. O usuário espera feedback visual imediato — o fundo precisa "contar a história" do tempo antes mesmo de ler os números.

**Fluxos principais:**

- *Fluxo típico:* usuário abre/troca a cidade → painel carrega → fundo animado transiciona suavemente para a condição e período corretos.
- *Fluxo redução de movimento:* mesmo fluxo, mas sem animações — apenas a paleta e os elementos visuais estáticos são aplicados.
- *Fluxo fallback:* condição não reconhecida → fundo neutro, sem erro ou tela em branco.

**Considerações de UI/UX:**

- A interface segue integralmente o **`DESIGN.md`** do projeto (paleta, tipografia, espaçamento).
- As animações devem ser **suaves e não intrusivas** — complementam o conteúdo, não competem com ele.
- A transição entre condições/períodos **deve ser animada** (fade ou cross-fade) para evitar mudanças abruptas.
- O fundo animado **não deve prejudicar a legibilidade** do conteúdo sobreposto (temperatura, condições, previsão horária).
- Layout responsivo: o componente deve ocupar o fundo corretamente em desktop e mobile.

**Requisitos de acessibilidade:**

- Respeito obrigatório a `prefers-reduced-motion: reduce`.
- O fundo é puramente decorativo — não deve ser o único veículo de informação; texto e ícones continuam presentes.
- Contraste adequado entre os elementos de fundo e o conteúdo sobreposto, conforme WCAG 2.2 (AA mínimo).
- Nenhuma animação piscante com frequência superior a 3 Hz (prevenção de gatilhos fotossensíveis).

## Restrições técnicas de alto nível

- **Componente independente:** sem dependência direta da API Open-Meteo ou do estado interno do Painel de Clima — comunicação somente via interface (props/parâmetros).
- **Stack declarada no projeto:** React + TypeScript + Tailwind CSS; animações devem ser implementadas dentro dessas tecnologias.
- **Desempenho:** animações não devem causar quedas de frame perceptíveis (jank) em dispositivos modernos de média configuração; preferir animações via CSS/`transform`/`opacity` que beneficiam da GPU.
- **Acessibilidade:** conformidade com WCAG 2.2 AA para contraste e `prefers-reduced-motion`.
- **Compatibilidade:** navegadores modernos evergreen (Chrome, Firefox, Safari, Edge nas versões atuais).

Os detalhes de implementação (biblioteca de animação, estrutura de variantes, nomes de classes Tailwind, mapeamento de weather codes) serão tratados na Especificação Técnica.

## Fora do escopo

- **Busca ou consumo de dados climáticos** — o componente recebe a condição já resolvida; não obtém dados.
- **Condições adicionais** além das 4 definidas (neve, neblina, granizo, etc.) — poderão ser incluídas em versões futuras.
- **Efeitos sonoros** associados às condições (chuva, trovão, etc.).
- **Animações 3D** ou uso de WebGL/Canvas — escopo limitado a CSS/SVG/elementos HTML.
- **Tema personalizável pelo usuário** (cores, intensidade de animação).
- **Suporte a períodos intermediários** (amanhecer, entardecer) — apenas dia e noite nesta versão.

> Nota: riscos e decisões técnicas de implementação serão detalhados na Especificação Técnica.
