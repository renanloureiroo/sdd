# Walkthrough — processo SDD completo (simulado)

Simulação ponta a ponta de uma feature (`Painel de Clima`) passando por todas as fases. Mostra, para cada etapa: o **prompt** que aciona a skill, o que a skill faz, o **artefato** que finaliza a etapa, e o **reset de contexto** antes da próxima.

> O resultado final desta simulação é a pasta [`tasks/01-painel-clima/`](tasks/01-painel-clima/) deste diretório de exemplos.

## Princípios deste fluxo

- **Uma skill por vez, manualmente.** As skills não se encadeiam sozinhas — você aciona a próxima só depois de revisar o artefato da anterior.
- **Reset de contexto a cada etapa concluída.** Quando uma fase termina e grava seu artefato em `tasks/01-painel-clima/`, **limpe o contexto** antes da próxima (no Claude Code, `/clear`; em outros harnesses, comece uma nova sessão/conversa). Cada fase relê o que precisa do disco — não há dependência do histórico da conversa anterior. Isso mantém o contexto enxuto, barato e focado.

```
[create-prd] → 🧹 reset → [create-techspec] → 🧹 reset → [create-tasks] → 🧹 reset →
[execute-task]×N (🧹 reset entre tarefas) → 🧹 reset → [execute-review] → 🧹 reset →
[execute-qa] → 🧹 reset → [execute-bugfix] → 🧹 reset → [execute-qa] (revalida) …
```

---

## 1. `create-prd` — requisitos

💬 **Prompt** — seedando com requisitos base (quanto mais contexto, menos perguntas a skill precisa fazer):

> Use a skill `create-prd` para a feature **"Painel de Clima"**.
>
> Implemente um painel de clima no frontend e backend existente.
>
> O usuário deve poder digitar uma cidade e ver o clima atual.
>
> Para obter os dados, utilize a API Open-Meteo (gratuita, sem necessidade de API key):
>
> - Geocoding API: `https://geocoding-api.open-meteo.com/v1/search` (converter cidade em coordenadas)
> - Weather API: `https://api.open-meteo.com/v1/forecast` (obter dados do clima)
>
> O frontend deve buscar os dados somente do backend. Opcionalmente, o frontend pode tentar obter a localização do usuário pelo navegador (geolocation) e sugerir a cidade automaticamente.
>
> Crie um endpoint no backend para o frontend consumir e exiba os dados no painel.

⚙️ **O que acontece**

- A skill usa o prompt como ponto de partida e **faz perguntas só para preencher as lacunas** (ex.: métricas de sucesso, personas, comportamento dos estados de vazio/erro, prioridade da geolocalização). Você responde.
- Aqui, na clarificação, decidiu-se manter a **geolocalização fora do escopo do v1** (fica como consideração futura) — por isso ela aparece em "Fora do escopo" no `prd.md`.
- Detalhes de implementação (qual API, o BFF) **não entram no PRD** — viram entrada para a `create-techspec`. O PRD foca no o quê/por quê.
- Calcula o contador automaticamente → não há features ainda, então `01`.
- Gera o PRD no template padrão, com requisitos funcionais numerados.

✅ **Finaliza com:** `tasks/01-painel-clima/prd.md`

🧹 **Reset de contexto.** A próxima fase relê o PRD do disco.

---

## 2. `create-techspec` — arquitetura

💬 **Prompt**

> Use a skill `create-techspec` para a feature em `tasks/01-painel-clima`.

⚙️ **O que acontece**

- Lê `prd.md`, **explora o projeto** e consulta docs (Context7/web).
- Faz perguntas técnicas (fluxo de dados, dependências, interfaces, testes).
- Decide a arquitetura (ex.: BFF em Express encapsulando a API pública).

✅ **Finaliza com:** `tasks/01-painel-clima/techspec.md`

🧹 **Reset de contexto.**

---

## 3. `create-tasks` — plano

💬 **Prompt**

> Use a skill `create-tasks` para `tasks/01-painel-clima`.

⚙️ **O que acontece**

- Lê PRD + TechSpec e **mostra a lista de tarefas de alto nível para você aprovar**.
- Após o ok, gera a lista e os arquivos individuais de tarefa (cada uma com seus testes).

✅ **Finaliza com:** `tasks/01-painel-clima/tasks.md` + `1.0_task.md`, `2.0_task.md`, …

🧹 **Reset de contexto.**

---

## 4. `execute-task` — implementação (repetir por tarefa)

💬 **Prompt**

> Use a skill `execute-task` em `tasks/01-painel-clima` para a próxima tarefa pendente.

⚙️ **O que acontece**

- Pega a próxima tarefa não marcada em `tasks.md` (ex.: `1.0 Endpoint de busca de cidades`).
- Carrega as skills de convenção do projeto, implementa de fato + testes, faz o auto-review da tarefa.
- Marca a tarefa como concluída em `tasks.md`.

✅ **Finaliza com:** código + testes da tarefa; `tasks.md` atualizado.

🧹 **Reset de contexto** e repita o passo 4 para a próxima tarefa, até todas estarem `[x]`.

---

## 5. `execute-review` — review da feature

💬 **Prompt**

> Use a skill `execute-review` para a feature em `tasks/01-painel-clima`.

⚙️ **O que acontece**

- Analisa o `git diff` da feature contra a branch base, confere aderência à TechSpec/Tasks e às rules, roda a suíte de testes.

✅ **Finaliza com:** `tasks/01-painel-clima/codereview.md` (APROVADO / com ressalvas / reprovado).

🧹 **Reset de contexto.** (Se reprovado, corrija e rode o review de novo antes de seguir.)

---

## 6. `execute-qa` — QA funcional

💬 **Prompt**

> Use a skill `execute-qa` para `tasks/01-painel-clima`. App em `http://localhost:5173`.

⚙️ **O que acontece**

- Sobe/usa o ambiente, roda E2E via Playwright MCP, checa acessibilidade e visual contra cada requisito do PRD.
- **Abre os bugs encontrados** em `bugs.md` no formato compartilhado (ex.: `BUG-01`, `BUG-02` com `Status: Aberto`).

✅ **Finaliza com:** `tasks/01-painel-clima/qa.md` + `tasks/01-painel-clima/bugs.md`.

🧹 **Reset de contexto.** Se o QA passou sem bugs, a feature está homologada — fim. Se há bugs, siga para o passo 7.

---

## 7. `execute-bugfix` — correção

💬 **Prompt**

> Use a skill `execute-bugfix` para `tasks/01-painel-clima`.

⚙️ **O que acontece**

- Lê cada bug `Aberto` em `bugs.md`, corrige a **causa raiz** e cria testes de regressão.
- Atualiza cada entrada (Causa raiz, Correção, Testes) e muda o `Status` para `Corrigido`.

✅ **Finaliza com:** correções + testes; `bugs.md` atualizado; `tasks/01-painel-clima/bugfix.md`.

🧹 **Reset de contexto** e **volte ao passo 6 (`execute-qa`)** para revalidar. Repita o ciclo QA ↔ bugfix até o QA aprovar sem bugs abertos.

---

## Resultado

A pasta `tasks/01-painel-clima/` fica autocontida com todo o rastro da feature:

```
tasks/01-painel-clima/
├── prd.md          # fase 1
├── techspec.md     # fase 2
├── tasks.md        # fase 3 (+ N.N_task.md)
├── codereview.md   # fase 5
├── qa.md           # fase 6
├── bugs.md         # fase 6 (aberto) → fase 7 (corrigido)
└── bugfix.md       # fase 7
```
