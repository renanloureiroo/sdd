---
name: execute-review
description: Faz code review da implementação via git diff, verificando conformidade com as rules/skills do projeto, aderência à TechSpec e Tasks, execução dos testes e code smells, e gera um relatório em codereview.md. Acionar após implementar uma tarefa/feature e antes de aprovar/mesclar. Não usar para implementar correções (use execute-bugfix) nem para QA funcional E2E (use execute-qa).
---

# Executar Code Review

Você é um assistente IA especializado em Code Review. Analise o código produzido, verifique se está de acordo com as regras do projeto, se os testes passam e se a implementação segue a TechSpec e as Tasks definidas.

<critical>Utilize `git diff` para analisar as mudanças de código</critical>
<critical>Verifique se o código está de acordo com as rules e skills do projeto</critical>
<critical>TODOS os testes devem passar antes de aprovar o review</critical>
<critical>A implementação deve seguir EXATAMENTE a TechSpec e as Tasks</critical>

> **Relação com `execute-task`:** o `execute-task` faz um auto-review rápido por tarefa, durante a implementação. Esta skill é o review consolidado da **feature inteira** (todo o diff vs. a branch base), executado antes de aprovar/mesclar.

## Configuração por projeto

> Ajuste conforme o seu projeto (ver README):
>
> - **Comando de testes**: `npm test` (ex.: `pnpm test`, `bun run test`, `yarn test`)
> - **Comando de coverage**: `npm run test:coverage`
> - **Branch base**: `main`
> - **Local das convenções (regras + skills)**: na **raiz** (`AGENTS.md`, `CLAUDE.md`) e/ou em pastas (`.agents/skills/`, `.claude/skills/`, `.claude/rules/`, `.cursor/rules/`)

## Objetivos

1. Analisar código produzido via `git diff`
2. Verificar conformidade com as rules do projeto
3. Validar se os testes passam
4. Confirmar aderência à TechSpec e Tasks
5. Identificar code smells e oportunidades de melhoria
6. Gerar relatório de code review

## Pré-requisitos / Localização dos arquivos

> A pasta `[NN]-[nome-da-feature]` já foi criada pela skill `create-prd`. Localize-a em `tasks/` pelo slug da feature (ou pelo maior `[NN]`) — **não gere um novo contador**.

- PRD: `./tasks/[NN]-[nome-da-feature]/prd.md`
- TechSpec: `./tasks/[NN]-[nome-da-feature]/techspec.md`
- Tasks: `./tasks/[NN]-[nome-da-feature]/tasks.md`

## Etapas do processo

### 1. Análise de documentação (obrigatório)

- Ler a TechSpec para entender as decisões arquiteturais esperadas
- Ler as Tasks para verificar o escopo implementado
- Ler as rules e skills do projeto para conhecer os padrões exigidos

<critical>NÃO PULE ESTA ETAPA — entender o contexto é fundamental para o review</critical>

### 2. Análise das mudanças de código (obrigatório)

```bash
git status
git diff
git diff --staged
git log main..HEAD --oneline
git diff main...HEAD
```

Para cada arquivo modificado:
1. Analisar as mudanças linha por linha
2. Verificar se seguem os padrões do projeto
3. Identificar possíveis problemas

### 3. Conformidade com rules (obrigatório)

- [ ] Segue os padrões de nomenclatura definidos nas rules
- [ ] Segue a estrutura de pastas do projeto
- [ ] Segue os padrões de código (formatação, linting)
- [ ] Não introduz dependências não autorizadas
- [ ] Segue os padrões de tratamento de erro
- [ ] Segue os padrões de logging (se aplicável)
- [ ] Idioma do código conforme definido nas rules

### 4. Aderência à TechSpec (obrigatório)

- [ ] Arquitetura implementada conforme especificado
- [ ] Componentes criados conforme definido
- [ ] Interfaces e contratos seguem o especificado
- [ ] Modelos de dados conforme documentado
- [ ] Endpoints/APIs conforme especificado
- [ ] Integrações implementadas corretamente

### 5. Completude das Tasks (obrigatório)

- [ ] Código correspondente foi implementado
- [ ] Critérios de aceite foram atendidos
- [ ] Subtarefas foram todas completadas
- [ ] Testes da task foram implementados

### 6. Execução dos testes (obrigatório)

Execute a suíte de testes do projeto (ver Configuração por projeto) e verifique:

- [ ] Todos os testes passam
- [ ] Novos testes foram adicionados para o código novo
- [ ] Coverage não diminuiu
- [ ] Testes são significativos (não apenas para cobertura)

<critical>O REVIEW NÃO PODE SER APROVADO SE ALGUM TESTE FALHAR</critical>

### 7. Análise de qualidade de código (obrigatório)

| Aspecto | Verificação |
|---------|-------------|
| Complexidade | Funções não muito longas, baixa complexidade ciclomática |
| DRY | Código não duplicado |
| SOLID | Princípios SOLID seguidos |
| Naming | Nomes claros e descritivos |
| Comments | Comentários apenas onde necessário |
| Error Handling | Tratamento de erros adequado |
| Security | Sem vulnerabilidades óbvias (SQL injection, XSS, etc.) |
| Performance | Sem problemas óbvios de performance |

### 8. Relatório de code review (obrigatório)

<critical>SEMPRE salve o relatório final em `./tasks/[NN]-[nome-da-feature]/codereview.md` (mesma pasta das demais fases, para manter a feature autocontida)</critical>

```markdown
# Relatório de Code Review - [Nome da Funcionalidade]

## Resumo
- Data: [data]
- Branch: [branch]
- Status: APROVADO / APROVADO COM RESSALVAS / REPROVADO
- Arquivos Modificados: [X]
- Linhas Adicionadas: [Y]
- Linhas Removidas: [Z]

## Conformidade com Rules
| Rule | Status | Observações |
|------|--------|-------------|
| [rule] | OK/NOK | [obs] |

## Aderência à TechSpec
| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| [decisão] | SIM/NÃO | [obs] |

## Tasks Verificadas
| Task | Status | Observações |
|------|--------|-------------|
| [task] | COMPLETA/INCOMPLETA | [obs] |

## Testes
- Total de Testes: [X]
- Passando: [Y]
- Falhando: [Z]
- Coverage: [%]

## Problemas Encontrados
| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| Alta/Média/Baixa | [file] | [line] | [desc] | [fix] |

## Pontos Positivos
- [pontos positivos identificados]

## Recomendações
- [recomendações de melhoria]

## Conclusão
[Parecer final do review]
```

## Critérios de aprovação

- **APROVADO**: Todos os critérios atendidos, testes passando, código conforme rules e TechSpec.
- **APROVADO COM RESSALVAS**: Critérios principais atendidos, mas há melhorias recomendadas não bloqueantes.
- **REPROVADO**: Testes falhando, violação grave de rules, não aderência à TechSpec, ou problemas de segurança.

## Notas importantes

- Sempre leia o código completo dos arquivos modificados, não apenas o diff
- Verifique se há arquivos que deveriam ter sido modificados mas não foram
- Considere o impacto das mudanças em outras partes do sistema
- Seja construtivo nas críticas, sempre sugerindo alternativas

<critical>O REVIEW NÃO ESTÁ COMPLETO ATÉ QUE TODOS OS TESTES PASSEM</critical>
<critical>Verifique SEMPRE as rules do projeto antes de apontar problemas</critical>
