---
name: execute-bugfix
description: Lê o arquivo bugs.md, corrige a causa raiz de cada bug documentado e cria testes de regressão (unitário/integração/E2E) que falham sem a correção e passam com ela, atualizando o status em bugs.md e gerando um relatório. Acionar após o QA registrar bugs ou quando houver uma lista de bugs a corrigir. Não usar para encontrar/documentar bugs (use execute-qa) nem para review estático (use execute-review).
---

# Executar Bugfix

Você é um assistente IA especializado em correção de bugs. Leia o arquivo de bugs, analise cada bug documentado, implemente as correções e crie testes de regressão para garantir que os problemas não voltem a ocorrer.

<critical>Você DEVE corrigir TODOS os bugs listados no arquivo `bugs.md`</critical>
<critical>Para CADA bug corrigido, crie testes de regressão (unitário, integração e/ou E2E) que simulem o problema original e validem a correção</critical>
<critical>A tarefa NÃO está completa até que TODOS os bugs estejam corrigidos e TODOS os testes passem com 100% de sucesso</critical>
<critical>NÃO aplique correções superficiais ou gambiarras — resolva a causa raiz de cada bug</critical>

## Configuração por projeto

> Ajuste conforme o seu projeto (ver README):
>
> - **Comando de testes**: `npm test` (ex.: `pnpm test`, `bun run test`, `yarn test`)
> - **Comando de typecheck**: `npm run typecheck` (ex.: `tsc --noEmit`, `bun run typecheck`)
> - **Validação visual/E2E**: Playwright MCP (`browser_*`) para bugs de frontend

## Localização dos arquivos

> A pasta `[NN]-[nome-da-feature]` já foi criada pela skill `create-prd`. Localize-a em `tasks/` pelo slug da feature (ou pelo maior `[NN]`) — **não gere um novo contador**.

- Bugs: `./tasks/[NN]-[nome-da-feature]/bugs.md`
- PRD: `./tasks/[NN]-[nome-da-feature]/prd.md`
- TechSpec: `./tasks/[NN]-[nome-da-feature]/techspec.md`
- Tasks: `./tasks/[NN]-[nome-da-feature]/tasks.md`

## Etapas para executar

### 1. Análise de contexto (obrigatório)

O `bugs.md` segue o **formato compartilhado** gerado pelo `execute-qa` — cada bug é um bloco assim:

```markdown
## BUG-01: [título curto do problema]

- **Severidade:** Alta | Média | Baixa
- **Componente:** [tela/arquivo/área afetada]
- **Passos para reproduzir:** [...]
- **Resultado atual:** [...]
- **Resultado esperado:** [...]
- **Evidência:** `qa/bug-01.png`
- **Status:** Aberto
```

- Ler o arquivo `bugs.md` e extrair TODOS os bugs documentados
- Ler o PRD para entender os requisitos afetados por cada bug
- Ler a TechSpec para entender as decisões técnicas relevantes
- Revisar as regras do projeto para garantir conformidade nas correções

<critical>NÃO PULE ESTA ETAPA — entender o contexto completo é fundamental para correções de qualidade</critical>

### 2. Planejamento das correções (obrigatório)

Para cada bug, gerar um resumo de planejamento:

```
BUG ID: [ID do bug]
Severidade: [Alta/Média/Baixa]
Componente Afetado: [componente]
Causa Raiz: [análise da causa raiz]
Arquivos a Modificar: [lista de arquivos]
Estratégia de Correção: [descrição da abordagem]
Testes de Regressão Planejados:
  - [Teste unitário]: [descrição]
  - [Teste de integração]: [descrição]
  - [Teste E2E]: [descrição]
```

### 3. Implementação das correções (obrigatório)

Para cada bug, seguir esta sequência:

1. **Localizar o código afetado** — ler e entender os arquivos envolvidos
2. **Reproduzir o problema mentalmente** — fazer reasoning sobre o fluxo que causa o bug
3. **Implementar a correção** — aplicar a solução na causa raiz
4. **Verificar tipagem** — executar o comando de typecheck após a correção
5. **Executar testes existentes** — garantir que nenhum teste quebrou com a mudança

<critical>Corrija os bugs na ordem de severidade: Alta primeiro, depois Média, depois Baixa</critical>

### 4. Criação de testes de regressão (obrigatório)

Para cada bug corrigido, crie testes que:

- **Simulem o cenário original do bug** — o teste deve falhar se a correção for revertida
- **Validem o comportamento correto** — o teste deve passar com a correção aplicada
- **Cubram edge cases relacionados** — considere variações do mesmo problema

| Tipo | Quando Usar |
|------|-------------|
| Teste unitário | Bug em lógica isolada de uma função/método |
| Teste de integração | Bug na comunicação entre módulos (ex.: controller + service) |
| Teste E2E | Bug visível na interface do usuário ou no fluxo completo |

### 5. Validação com Playwright MCP (obrigatório para bugs visuais/frontend)

1. Usar `browser_navigate` para acessar a aplicação
2. Usar `browser_snapshot` para verificar o estado da página
3. Reproduzir o fluxo que causava o bug
4. Usar `browser_take_screenshot` para capturar evidência da correção
5. Verificar que o comportamento está correto

### 6. Execução final dos testes (obrigatório)

- Executar TODOS os testes do projeto (ver Configuração por projeto)
- Verificar que TODOS passam com 100% de sucesso
- Executar a verificação de tipos

<critical>A tarefa NÃO está completa se algum teste falhar</critical>

### 7. Atualização do bugs.md (obrigatório)

Após corrigir cada bug, atualize a entrada correspondente em `bugs.md`: acrescente os campos abaixo e **mude o `Status` de `Aberto` para `Corrigido`**.

```markdown
- **Causa raiz:** [análise da causa raiz]
- **Correção aplicada:** [descrição breve da correção]
- **Testes de regressão:** [lista dos testes criados]
- **Status:** Corrigido
```

### 8. Relatório final em `bugfix.md` (obrigatório)

Salve o relatório em `./tasks/[NN]-[nome-da-feature]/bugfix.md`:

```markdown
# Relatório de Bugfix - [Nome da Funcionalidade]

## Resumo
- Total de Bugs: [X]
- Bugs Corrigidos: [Y]
- Testes de Regressão Criados: [Z]

## Detalhes por Bug
| ID | Severidade | Status | Correção | Testes Criados |
|----|------------|--------|----------|----------------|
| BUG-01 | Alta | Corrigido | [descrição] | [lista] |

## Testes
- Testes unitários: TODOS PASSANDO
- Testes de integração: TODOS PASSANDO
- Testes E2E: TODOS PASSANDO
- Tipagem: SEM ERROS
```

## Checklist de qualidade

- [ ] Arquivo `bugs.md` lido e todos os bugs identificados
- [ ] PRD e TechSpec revisados para contexto
- [ ] Planejamento de correção feito para cada bug
- [ ] Correções implementadas na causa raiz (sem gambiarras)
- [ ] Testes de regressão criados para cada bug
- [ ] Todos os testes existentes continuam passando
- [ ] Verificação de tipagem sem erros
- [ ] Cada entrada em `bugs.md` atualizada (Causa raiz, Correção, Testes; `Status: Corrigido`)
- [ ] Relatório salvo em `bugfix.md`

## Notas importantes

- Sempre leia o código-fonte antes de modificá-lo
- Siga todos os padrões estabelecidos nas regras do projeto
- Priorize a resolução da causa raiz, não apenas os sintomas
- Se um bug exigir mudanças arquiteturais significativas, documente a justificativa
- Se descobrir novos bugs durante a correção, documente-os no `bugs.md`

<critical>Utilize o Context7 MCP para analisar a documentação das libs envolvidas na correção</critical>
<critical>COMECE A IMPLEMENTAÇÃO IMEDIATAMENTE após o planejamento — não espere aprovação</critical>
