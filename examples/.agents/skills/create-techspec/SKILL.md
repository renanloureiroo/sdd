---
name: create-techspec
description: Cria uma Especificação Técnica (TechSpec) pronta para implementação a partir de um PRD existente. Explora o projeto a fundo, consulta documentação técnica (Context7/web), faz perguntas de esclarecimento e salva em tasks/<NN>-<feature>/techspec.md. Acionar após o PRD estar pronto e antes de gerar tarefas. Não usar para escrever o código nem para repetir requisitos do PRD — foca no COMO.
---

# Criar TechSpec

Você é um especialista em especificação técnica focado em produzir Tech Specs claras e prontas para implementação com base em um PRD completo. Suas entregas devem ser objetivas, centradas em arquitetura e seguir o `<template>` fornecido.

<critical>EXPLORE O PROJETO PRIMEIRO ANTES DE FAZER PERGUNTAS DE ESCLARECIMENTO</critical>
<critical>NÃO GERE A TECHSPEC SEM ANTES FAZER PERGUNTAS DE ESCLARECIMENTO (use a ferramenta de perguntar ao usuário se o harness tiver; senão, pergunte em texto e aguarde a resposta)</critical>
<critical>USE A SKILL/MCP CONTEXT7 PARA QUESTÕES TÉCNICAS E BUSCA NA WEB (PELO MENOS 3 BUSCAS) PARA CONSULTAR REGRAS DE NEGÓCIO ANTES DE PERGUNTAR</critical>
<critical>EM HIPÓTESE ALGUMA DESVIE DO PADRÃO DE `<template>`</critical>
<critical>EM HIPÓTESE ALGUMA IMPLEMENTE O CÓDIGO; O OBJETIVO É PRODUZIR A ESPECIFICAÇÃO TÉCNICA</critical>

## Objetivos principais

1. Traduzir os requisitos do PRD em **orientações técnicas e decisões de arquitetura**
2. Realizar uma análise profunda do projeto antes de redigir qualquer conteúdo (**IMPORTANTE**)
3. Avaliar bibliotecas existentes versus desenvolvimento próprio
4. Gerar uma especificação técnica usando o modelo padronizado e salvá-la no local correto

## Referência de arquivos

> A pasta `[NN]-[nome-da-feature]` já foi criada pela skill `create-prd`. Localize-a em `tasks/` pelo slug da feature (ou pelo maior `[NN]`) — **não gere um novo contador**.

- PRD obrigatório: `tasks/[NN]-[nome-da-feature]/prd.md`
- Documento de saída: `tasks/[NN]-[nome-da-feature]/techspec.md`

## Pré-requisitos

- Confirmar que o PRD existe em `tasks/[NN]-[nome-da-feature]/prd.md`

## Fluxo de trabalho

### 1. Analisar o PRD (obrigatório)

- Ler o PRD completo **NÃO PULE ESTA ETAPA**
- Identificar conteúdo técnico
- Extrair principais requisitos, restrições e métricas de sucesso

### 2. Análise profunda do projeto (obrigatório)

- Descobrir arquivos envolvidos, módulos, interfaces e pontos de integração
- Mapear símbolos, dependências e pontos críticos
- Explorar estratégias de solução, padrões, riscos e alternativas
- Realizar uma análise ampla: quem chama/quem é chamado, configs, middleware, persistência, concorrência, tratamento de erros, testes, infra

### 3. Esclarecimentos técnicos (obrigatório)

Fazer perguntas objetivas sobre:

- Posicionamento no domínio
- Fluxo de dados
- Dependências externas
- Principais interfaces
- Cenários de teste

### 4. Mapeamento de conformidade com padrões (obrigatório)

- Destacar desvios com justificativa e alternativas conformes

### 5. Gerar a especificação técnica (obrigatório)

- Usar o modelo (da seção `<template>`) como estrutura exata
- Fornecer: visão da arquitetura, design de componentes, interfaces, modelos, endpoints, pontos de integração, análise de impacto, estratégia de testes, observabilidade
- Manter até cerca de 2.000 palavras
- **Evite repetir requisitos funcionais do PRD**; concentre-se em como implementar
- A especificação técnica é sobre especificação, **não sobre detalhes de implementação**; evite mostrar demasiado código

### 6. Salvar a especificação técnica (obrigatório)

- Salvar como: `tasks/[NN]-[nome-da-feature]/techspec.md`
- Confirmar operação de escrita e caminho

## Princípios centrais

- A especificação técnica **foca no COMO, não no O QUÊ** (o PRD detém o o quê/por quê)
- Preferir arquitetura simples e evolutiva com interfaces claras
- Trazer considerações de testabilidade e observabilidade desde cedo

## Lista de verificação de perguntas de esclarecimento

- **Domínio**: limites adequados e propriedade de módulos
- **Fluxo de dados**: entradas/saídas, contratos e transformações
- **Dependências**: serviços externos/APIs, modos de falha, timeouts, idempotência
- **Implementação central**: lógica central, interfaces e modelos de dados
- **Testes**: caminhos críticos, testes unitários/integração/E2E, testes de contrato
- **Reutilização vs. construir**: bibliotecas/componentes existentes, viabilidade de licença, estabilidade da API

## Lista de verificação de qualidade

- [ ] PRD revisado
- [ ] Análise profunda do repositório
- [ ] Principais esclarecimentos técnicos respondidos
- [ ] Especificação técnica gerada com o modelo
- [ ] Rules/convenções do projeto verificadas (ver README)
- [ ] Arquivo gravado em `./tasks/[NN]-[nome-da-feature]/techspec.md`
- [ ] Caminho final da saída fornecido e confirmação

---

<template>

```markdown
# Especificação técnica

## Resumo executivo

[Fornecer uma visão técnica breve da abordagem da solução. Resumir as principais decisões de arquitetura e a estratégia de implementação em 1–2 parágrafos.]

## Arquitetura do sistema

### Visão dos componentes

[Descrição breve dos principais componentes e suas responsabilidades:

- Nomes dos componentes e funções principais **Certifique-se de listar cada componente novo ou modificado**
- Principais relacionamentos entre componentes
- Visão geral do fluxo de dados]

## Design de implementação

### Principais interfaces

[Definir as principais interfaces de serviço (≤20 linhas por exemplo):

```ts
// Exemplo de definição de interface
interface ServiceName {
  methodName(input: Type): Promise<Output>;
}
```

]

### Modelos de dados

[Definir estruturas de dados essenciais:

- Principais entidades de domínio (se aplicável)
- Tipos de requisição/resposta
- Esquemas de banco de dados (se aplicável)]

### Endpoints da API

[Listar endpoints da API se aplicável:

- Método e caminho (ex.: `POST /api/v0/resource`)
- Descrição breve
- Referências de formato de requisição/resposta]

## Pontos de integração

[Incluir apenas se a funcionalidade exigir integrações externas:

- Serviços ou APIs externos
- Requisitos de autenticação
- Abordagem de tratamento de erros]

## Abordagem de testes

### Testes unitários

[Descrever estratégia de testes unitários:

- Principais componentes a testar
- Requisitos de mocks (somente para serviços externos)
- Cenários de teste críticos]

### Testes de integração

[Se necessário, descrever testes de integração:

- Componentes a testar em conjunto
- Requisitos de dados de teste]

### Testes E2E

[Se necessário, descrever testes E2E:

- Testar o frontend junto com o backend **usando a ferramenta de E2E do projeto** (ex.: Playwright)]

## Sequenciamento do desenvolvimento

### Ordem de construção

[Definir sequência de implementação:

1. Primeiro componente/funcionalidade (por que primeiro)
2. Segundo componente/funcionalidade (dependências)
3. Componentes subsequentes
4. Integração e testes]

### Dependências técnicas

[Listar bloqueadores de dependências:

- Infraestrutura necessária
- Disponibilidade de serviços externos]

## Monitoramento e observabilidade

[Definir abordagem de monitoramento usando a infraestrutura existente:

- Métricas a expor
- Principais logs e níveis de log
- Integração com dashboards existentes]

## Considerações técnicas

### Principais decisões

[Documentar decisões técnicas importantes:

- Escolha da abordagem e justificativa
- Trade-offs considerados
- Alternativas descartadas e por quê]

### Riscos conhecidos

[Identificar riscos técnicos:

- Desafios potenciais
- Abordagens de mitigação
- Áreas que precisam de pesquisa]

### Conformidade com rules

[Pesquisar as rules/convenções do projeto que se apliquem a esta especificação técnica e listá-las abaixo:]

### Conformidade com skills

[Pesquisar as skills do projeto que se apliquem a esta especificação técnica e listá-las abaixo:]

### Arquivos relevantes e dependentes

[Listar aqui os arquivos relevantes e dependentes]
```

</template>
