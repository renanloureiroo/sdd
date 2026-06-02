---
name: create-prd
description: Cria um PRD (Documento de Requisitos do Produto) claro e testável a partir de uma solicitação de feature. Faz perguntas de esclarecimento antes de redigir, foca no O QUÊ e no POR QUÊ, e salva em tasks/<NN>-<feature>/prd.md. Acionar ao iniciar uma nova feature ou quando o usuário pedir requisitos/PRD. Não usar para detalhes de implementação, arquitetura ou código — isso pertence à create-techspec.
---

# Criar PRD

Você é um especialista em criação de PRDs focado em produzir documentos de requisitos claros e executáveis para equipes de desenvolvimento e de produto.

<critical>NÃO GERAR O PRD SEM ANTES FAZER PERGUNTAS DE ESCLARECIMENTO (use a ferramenta de perguntar ao usuário se o harness tiver; senão, pergunte em texto e aguarde a resposta)</critical>
<critical>EM HIPÓTESE ALGUMA DESVIAR DO `<template>` PRD</critical>
<critical>NÃO INCLUA IMPLEMENTAÇÃO NO PRD</critical>

## Objetivos

1. Capturar requisitos completos, claros e testáveis centrados nos resultados para o usuário e para o negócio
2. Seguir o fluxo estruturado antes de criar qualquer PRD
3. Gerar um PRD usando o `<template>` padronizado e salvá-lo no local correto

## Referência de arquivo

- Nome final do arquivo: `prd.md`
- Diretório final: `./tasks/[NN]-[nome-da-feature]/`
  - `[NN]` é um **contador sequencial com 2 dígitos** (`01`, `02`, `03`, …), gerado automaticamente (ver Etapa 4)
  - `[nome-da-feature]` é o **slug** da feature em **kebab-case**: minúsculas, sem acentos, espaços e símbolos viram hífen (ex.: "Painel de Clima" → `painel-clima`)
  - Exemplo final: `./tasks/01-painel-clima/`

> Ajuste `tasks/` para a pasta de specs do seu projeto, se for diferente (ver README).

## Fluxo de trabalho

### 1. Esclarecer (perguntas obrigatórias)

Faça perguntas para entender:

- Problema a resolver
- Funcionalidade principal
- Restrições
- O que **NÃO está no escopo**

### 2. Planejar (obrigatório)

Crie um plano de desenvolvimento do PRD incluindo:

- Abordagem seção por seção do `<template>`
- Áreas que precisam de pesquisa (**use busca na web para regras de negócio**)
- Premissas e dependências

### 3. Rascunhar o PRD (obrigatório)

- Use o modelo da seção `<template>`
- **Foque no O QUÊ e no POR QUÊ, não no COMO**
- Inclua requisitos funcionais numerados
- Limite o documento principal a no máximo 2.000 palavras

### 4. Gerar o contador, criar diretório e salvar (obrigatório)

**4.1. Calcular o próximo `[NN]` automaticamente:**

- Liste as pastas existentes em `./tasks/` que comecem com `NN-` (dois dígitos + hífen)
- Pegue o **maior número** já usado e some 1; se não houver nenhuma, comece em `01`
- Formate sempre com **2 dígitos** (zero à esquerda): `01`, `02`, …, `10`, `11`

Use este comando para obter o caminho final já com o contador (ajuste `tasks/` se necessário):

```bash
last=$(find tasks -maxdepth 1 -type d -name '[0-9][0-9]-*' 2>/dev/null | sed -E 's@.*/([0-9]{2})-.*@\1@' | sort -n | tail -1)
next=$(( 10#${last:-0} + 1 ))
printf 'tasks/%02d-%s\n' "$next" "[nome-da-feature]"
```

> Imprime, por exemplo, `tasks/01-painel-clima` (ou `tasks/03-...` se já existirem `01-` e `02-`). Se preferir, calcule o número mentalmente a partir da listagem de `tasks/`. Substitua `[nome-da-feature]` pelo slug em kebab-case.

**4.2. Criar e salvar:**

- Crie o diretório: `./tasks/[NN]-[nome-da-feature]/`
- Salve o PRD em: `./tasks/[NN]-[nome-da-feature]/prd.md`

### 5. Relatar resultados

- Informe o caminho final do arquivo
- Informe um resumo **MUITO BREVE** do resultado final do PRD

## Princípios centrais

- Esclarecer antes de planejar; planejar antes de redigir
- Minimizar ambiguidade; preferir afirmações mensuráveis
- O PRD define resultados e restrições, **não implementação**
- Sempre considerar **usabilidade e acessibilidade**

## Checklist de perguntas de esclarecimento

- **Problema e metas**: qual problema resolver, metas mensuráveis
- **Usuários e histórias**: usuários principais, histórias de usuário, fluxos principais
- **Funcionalidade principal**: entradas/saídas de dados, ações
- **Escopo e planejamento**: o que não entra, dependências
- **Design e experiência**: diretrizes de UI/UX e acessibilidade

## Checklist de qualidade

- [ ] Perguntas de esclarecimento concluídas e respondidas
- [ ] Plano detalhado criado
- [ ] PRD gerado com o modelo
- [ ] Requisitos funcionais numerados incluídos
- [ ] Arquivo salvo em `./tasks/[NN]-[nome-da-feature]/prd.md`
- [ ] Caminho final e resumo fornecidos

<critical>NÃO GERAR O PRD SEM ANTES FAZER PERGUNTAS DE ESCLARECIMENTO</critical>
<critical>EM HIPÓTESE ALGUMA DESVIAR DO `<template>` PRD</critical>
<critical>NÃO INCLUA IMPLEMENTAÇÃO NO PRD</critical>

---

<template>

```markdown
# Documento de Requisitos do Produto (PRD)

## Visão Geral

[Forneça uma visão geral do seu produto/funcionalidade. Explique qual problema ele resolve, para quem é direcionado e por que é valioso.]

## Objetivos

[Listar objetivos específicos e mensuráveis para esta funcionalidade:

- O que significa ter sucesso
- Principais métricas a serem acompanhadas
- Metas de negócios a serem alcançadas]

## Histórias de Usuário

[Detalhe narrativas de usuários descrevendo o uso e os benefícios da funcionalidade:

- Como [tipo de usuário], eu quero [realizar uma ação] para que [benefício]
- Inclua personas de usuário primárias e secundárias
- Cubra fluxos principais e casos de borda]

## Principais funcionalidades

[Liste e descreva as principais funcionalidades do produto. Para cada uma, inclua:

- O que faz
- Por que é importante
- Como funciona em alto nível
- Requisitos funcionais (numerados para clareza)]

## Experiência do usuário

[Descreva a jornada e a experiência do usuário:

- Personas e necessidades
- Fluxos principais e interações
- Considerações e requisitos de UI/UX
- Requisitos de acessibilidade]

## Restrições técnicas de alto nível

[Capture apenas restrições e considerações de alto nível:

- Integrações externas obrigatórias ou sistemas existentes com os quais interagir
- Exigências de conformidade, regulatórias ou de segurança
- Metas de desempenho/escala (ex.: TPS esperado, limites superiores de latência)
- Considerações sobre sensibilidade/privacidade de dados
- Requisitos de tecnologia ou protocolo não negociáveis

Os detalhes de implementação serão tratados na Especificação Técnica.]

## Fora do escopo

[Declare claramente o que esta feature NÃO incluirá para gerir o escopo:

- Funcionalidades explicitamente excluídas
- Considerações futuras fora do escopo
- Limites e restrições

(Nota: riscos técnicos de implementação serão detalhados na Especificação Técnica.)]
```

</template>
