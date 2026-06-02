# Tarefa 3.0: Integração e testes E2E

## Visão geral

Validar a jornada completa do Painel de Clima ponta a ponta com Playwright, integrando o backend (Tarefa 1.0) e o frontend (Tarefa 2.0). Reativar o teste `fixme` existente e estender a interceptação de hosts externos para devolver fixtures determinísticas de geocoding/forecast do Open-Meteo, cobrindo os caminhos feliz e de erro, além da geolocalização concedida e negada.

<skills>
### Conformidade com skills

- Nenhuma skill de convenção de código se aplica diretamente (tarefa de teste E2E). Seguir as **"Notas de testes E2E"** do `AGENTS.md` e o padrão de specs do projeto.
- **MCP Playwright** (`browser_*`) disponível para depuração/validação visual e de acessibilidade durante o desenvolvimento dos cenários.
</skills>

<requirements>
- Reativar o teste `fixme` em `tests/e2e/painel-clima.spec.ts`: `searchbox` rotulado "cidade" → preencher → `button` "Buscar" → `region` "clima" visível.
- **Determinismo:** estender o `page.route` do `beforeEach` (que já intercepta hosts externos) para responder com fixtures de geocoding e forecast do Open-Meteo — nenhuma chamada real a terceiros.
- Cenários cobertos: (a) busca feliz → painel visível; (b) cidade não encontrada → mensagem clara; (c) erro do provedor → mensagem + "tentar novamente"; (d) geolocalização **concedida** (`context.grantPermissions(['geolocation'])` + `setGeolocation`) → clima pré-carregado; (e) geolocalização **negada** → estado de busca manual sem bloqueio.
- Descrições `describe`/`it` em pt-BR, padrão imperativo "deve…".
- Remover o comentário `TODO`/`fixme` quando a feature estiver coberta.
</requirements>

## Subtarefas

- [ ] 3.1 Garantir `npm install` na raiz e `npx playwright install chromium` (1ª vez); confirmar que `playwright.config.ts` sobe back+front via `webServer`.
- [ ] 3.2 Criar fixtures de geocoding e forecast (payloads Open-Meteo) e estender o `page.route` para servi-las de forma determinística.
- [ ] 3.3 Reativar e implementar o cenário de busca feliz (digitar → "Buscar" → `region` "clima").
- [ ] 3.4 Adicionar cenários de erro: cidade não encontrada e indisponibilidade do provedor (com "tentar novamente").
- [ ] 3.5 Adicionar cenários de geolocalização concedida (clima pré-carregado) e negada (busca manual).
- [ ] 3.6 Rodar a suíte completa (`npm run test:e2e`) e estabilizar.

## Detalhes de implementação

Ver `techspec.md` → "Abordagem de testes" → "Testes E2E" e "Notas de testes E2E" do `AGENTS.md`. Reaproveitar o `beforeEach` existente que intercepta hosts não-localhost. Não reproduzir os payloads aqui — montar as fixtures a partir dos contratos definidos na techspec (modelos `CityCandidate`/`WeatherResponse`).

## Critérios de sucesso

- `npm run test:e2e` (raiz) verde, sem flakiness, sem nenhuma requisição real a APIs externas.
- Os cinco cenários (busca feliz, não encontrada, erro do provedor, geolocalização concedida e negada) cobertos e passando.
- O teste `fixme` original reativado e sem o `TODO` de pendência.

## Testes da tarefa

- [ ] Testes unitários — N/A (cobertos nas Tarefas 1.0 e 2.0).
- [ ] Testes de integração — N/A (contrato HTTP coberto na 1.0).
- [ ] **Testes E2E** — Playwright em `tests/e2e/painel-clima.spec.ts` cobrindo os cinco cenários acima.

## Arquivos relevantes

- `tests/e2e/painel-clima.spec.ts` (mod.)
- `playwright.config.ts`, fixtures de geocoding/forecast (em `tests/`)
- `AGENTS.md` (notas de E2E)
</content>
