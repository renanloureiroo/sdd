# Exemplo de feature

`tasks/01-painel-clima/` abaixo é uma **referência viva** de como uma feature fica depois de passar pelo pipeline de SDD. No seu projeto, essa pasta nasceria em `tasks/01-painel-clima/` (não em `examples/`) — aqui ela vive sob `examples/` só para servir de amostra.

Mostra:

- a convenção de pasta `tasks/<NN>-<slug>/` com o contador `01`;
- os artefatos das fases de criação (`prd.md`, `techspec.md`, `tasks.md`) e o `bugs.md`. Num projeto real, `codereview.md`, `qa.md` e `bugfix.md` também aparecem nesta pasta;
- o **formato compartilhado de `bugs.md`** entre `execute-qa` (que abre o bug, ver `BUG-02` com `Status: Aberto`) e `execute-bugfix` (que o fecha, ver `BUG-01` com `Status: Corrigido`).

## Como esta feature foi produzida

[`walkthrough.md`](walkthrough.md) simula o **processo SDD completo** que gera esta pasta: o prompt que aciona cada skill, a finalização de cada etapa e o **reset de contexto** entre uma fase e a próxima (acionadas manualmente, uma por vez).

## Subagent de exemplo

[`agents/task-reviewer.md`](agents/task-reviewer.md) é um **exemplo de subagent** do Claude Code (não faz parte do pipeline padrão): um revisor de task independente, que roda em contexto isolado e gera `[num]_task_review.md`. Copie-o para `.claude/agents/` no seu projeto e adapte às suas convenções — cada projeto cria os subagents que precisa. Veja a seção "Subagents complementares" no [README principal](../README.md).
