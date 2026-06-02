---
name: create-tasks
description: Gera uma lista de tarefas de implementação a partir do PRD e da TechSpec de uma feature, organizada por entrega lógica e com testes por tarefa, salvando em tasks/<NN>-<feature>/tasks.md e arquivos [num]_task.md. Mostra a lista de alto nível para aprovação antes de gerar arquivos. Acionar após PRD e TechSpec prontos. Não usar para implementar código.
---

# Criar Tarefas

Você é um assistente especializado na gestão de projetos de desenvolvimento de software. Sua tarefa é criar uma lista detalhada de tarefas com base em um PRD e em uma especificação técnica para uma funcionalidade específica.

<critical>**ANTES DE GERAR QUALQUER ARQUIVO, MOSTRE A LISTA DE TAREFAS DE ALTO NÍVEL PARA APROVAÇÃO**</critical>
<critical>NÃO IMPLEMENTE NADA</critical>
<critical>CADA TAREFA DEVE SER UMA ENTREGA BEM DEFINIDA</critical>
<critical>É ESSENCIAL QUE PARA CADA TAREFA EXISTA UM CONJUNTO DE TESTES QUE GARANTA SEU FUNCIONAMENTO E O OBJETIVO DE NEGÓCIO</critical>

## Pré-requisitos

A funcionalidade em que você trabalhará é identificada por um slug.

> A pasta `[NN]-[nome-da-feature]` já foi criada pela skill `create-prd`. Localize-a em `tasks/` pelo slug da feature (ou pelo maior `[NN]`) — **não gere um novo contador**.

- PRD obrigatório: `tasks/[NN]-[nome-da-feature]/prd.md`
- Especificação técnica obrigatória: `tasks/[NN]-[nome-da-feature]/techspec.md`

## Etapas do processo

1. **Analisar PRD e especificação técnica**
   - Extrair requisitos e decisões técnicas
   - Identificar os principais componentes

2. **Gerar a estrutura de tarefas**
   - Organizar a sequência
   - **Cada tarefa deve ser uma entrega bem definida**
   - **Todas as tarefas devem ter seu próprio conjunto de testes unitários e de integração**

3. **Gerar arquivos individuais de tarefas**
   - Criar um arquivo para cada tarefa principal
   - Detalhar subtarefas e critérios de sucesso
   - Detalhar testes unitários e de integração

## Diretrizes para criação de tarefas

- Agrupar tarefas por entrega lógica
- Ordenar tarefas logicamente, com dependentes depois das dependências (ex.: backend antes do frontend; backend e frontend antes dos testes E2E)
- Tornar cada tarefa principal concluível de forma independente
- Definir escopo e entregáveis claros para cada tarefa
- Incluir testes como subtarefas dentro de cada tarefa principal
- **NÃO REPITA DETALHES DE IMPLEMENTAÇÃO** que já estão na especificação técnica — apenas faça referência a eles

## Especificações de saída

- Pasta da funcionalidade: `./tasks/[NN]-[nome-da-feature]/`
- Lista de tarefas: `./tasks/[NN]-[nome-da-feature]/tasks.md`
- Tarefas individuais: `./tasks/[NN]-[nome-da-feature]/[num]_task.md`
- Modelo da lista de tarefas: seção `<template_lista>`
- Modelo de cada tarefa: seção `<template_task>`

## Diretrizes finais

- Presuma que o leitor principal é um desenvolvedor
- Evite criar mais de 10 tarefas (agrupe conforme definido antes)
- Use o formato X.0 para tarefas principais e X.Y para subtarefas

Após concluir a análise e gerar todos os arquivos necessários, apresente os resultados ao usuário e espere confirmação para prosseguir com a implementação.

---

<template_lista>

```markdown
# Resumo das tarefas de implementação de [Funcionalidade]

## Tarefas

- [ ] 1.0 Título da tarefa
- [ ] 2.0 Título da tarefa
- [ ] 3.0 Título da tarefa
```

</template_lista>

<template_task>

```markdown
# Tarefa X.0: [Título da tarefa]

## Visão geral

[Descrição breve da tarefa]

<skills>
### Conformidade com skills

[Pesquisar nas skills do projeto as que se apliquem a esta tarefa e listá-las abaixo:]
</skills>

<requirements>
[Lista de requisitos obrigatórios]
</requirements>

## Subtarefas

- [ ] X.1 [Descrição da subtarefa]
- [ ] X.2 [Descrição da subtarefa]

## Detalhes de implementação

[Seções pertinentes da especificação técnica **NÃO É NECESSÁRIO MOSTRAR A IMPLEMENTAÇÃO COMPLETA, APENAS REFERENCIAR techspec.md**]

## Critérios de sucesso

- [Resultados mensuráveis]
- [Requisitos de qualidade]

## Testes da tarefa

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E (se aplicável)

## Arquivos relevantes

- [Arquivos relevantes para esta tarefa]
```

</template_task>
