---
name: execute-task
description: Implementa a próxima tarefa pendente de uma feature seguindo PRD, TechSpec e o arquivo da tarefa. Carrega as skills/convenções necessárias, consulta documentação via Context7, implementa de fato (sem gambiarras), aciona o review e marca a tarefa como concluída em tasks.md. Acionar quando o usuário pedir para implementar/executar uma tarefa do plano. Não usar para criar PRD/TechSpec/tarefas.
---

# Executar Tarefa

Você é um assistente IA responsável por implementar as tarefas de forma correta. Identifique a próxima tarefa disponível, faça a configuração necessária e **IMPLEMENTE**.

<critical>Identifique e carregue as skills/convenções necessárias para a tarefa com base nas tecnologias utilizadas</critical>
<critical>**VOCÊ DEVE** iniciar a implementação logo após o processo de análise</critical>
<critical>Utilize o Context7 MCP para analisar a documentação da linguagem, frameworks e bibliotecas envolvidas</critical>
<critical>Após completar a tarefa, marque-a como completa em `tasks.md`</critical>

## Localização dos arquivos

> A pasta `[NN]-[nome-da-feature]` já foi criada pela skill `create-prd`. Localize-a em `tasks/` pelo slug da feature (ou pelo maior `[NN]`) — **não gere um novo contador**.

- PRD: `./tasks/[NN]-[nome-da-feature]/prd.md`
- TechSpec: `./tasks/[NN]-[nome-da-feature]/techspec.md`
- Tasks: `./tasks/[NN]-[nome-da-feature]/tasks.md`
- Convenções do projeto (regras + skills): onde o seu harness as guarda — na **raiz** (`AGENTS.md`, `CLAUDE.md`) e/ou em pastas (`.agents/skills/`, `.claude/skills/`, `.claude/rules/`, `.cursor/rules/`)

## Etapas para executar

### 1. Configuração pré-tarefa

- Ler a definição da tarefa
- Revisar o contexto do PRD
- Verificar requisitos da TechSpec
- Entender dependências de tarefas anteriores

### 2. Análise da tarefa

Analise considerando:

- Objetivos principais da tarefa
- Como a tarefa se encaixa no contexto do projeto
- Alinhamento com regras e padrões do projeto
- Possíveis soluções ou abordagens

### 3. Resumo da tarefa

```
ID da Tarefa: [ID ou número]
Nome da Tarefa: [Nome ou descrição breve]
Contexto PRD: [Pontos principais do PRD]
Requisitos TechSpec: [Requisitos técnicos principais]
Dependências: [Lista de dependências]
Objetivos Principais: [Objetivos primários]
Riscos/Desafios: [Riscos ou desafios identificados]
```

### 4. Plano de abordagem

```
1. [Primeiro passo]
2. [Segundo passo]
3. [Passos adicionais conforme necessário]
```

<critical>NÃO PULE NENHUM PASSO</critical>

### 5. Implementação

- Implemente a solução completa seguindo a TechSpec e as convenções do projeto
- Escreva os testes definidos na tarefa (unitário, integração e/ou E2E)

### 6. Revisão

1. Execute o agente de review @task-reviewer
2. Ajuste os problemas indicados
3. Não finalize a tarefa até resolver

### 7. Conclusão

- Marque a tarefa como completa em `tasks.md`

## Notas importantes

- Sempre verifique o PRD, a TechSpec e o arquivo de tarefa
- Implemente soluções adequadas **sem usar gambiarras**
- Siga todos os padrões estabelecidos do projeto

<critical>Identifique e carregue as skills/convenções necessárias com base nas tecnologias utilizadas</critical>
<critical>**VOCÊ DEVE** iniciar a implementação logo após a análise</critical>
<critical>Utilize o Context7 MCP para analisar a documentação envolvida</critical>
<critical>Após completar a tarefa, marque-a como completa em `tasks.md`</critical>
<critical>Após completar a tarefa, marque como completa em tasks.md</critical>
<critical>Após completar a tarefa, marque como completa em tasks.md</critical>
<critical>Após completar a tarefa, marque como completa em tasks.md</critical>
<critical>Após completar a tarefa, marque como completa em tasks.md</critical>
<critical>Após completar a tarefa, marque como completa em tasks.md</critical>
<critical>Após completar a tarefa, marque como completa em tasks.md</critical>
<critical>Após completar a tarefa, marque como completa em tasks.md</critical>
