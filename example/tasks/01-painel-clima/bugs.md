## BUG-01: Timezone exibido como identificador técnico IANA

- **Severidade:** Baixa
- **Componente:** `frontend/src/components/current-weather.tsx:29`
- **Passos para reproduzir:**
  1. Digitar qualquer cidade no campo de busca
  2. Clicar em "Buscar" e selecionar uma cidade da lista
  3. Observar o subtítulo abaixo do nome da cidade no card de clima
- **Resultado atual:** Exibe "America/Sao_Paulo" (identificador técnico IANA) abaixo do nome da cidade
- **Resultado esperado:** Exibir timezone de forma amigável ao usuário (ex.: "UTC-3 (Brasília)") ou simplesmente omitir esse campo, já que cidade/estado/país já estão no título
- **Evidência:** `qa/03-clima-atual.png`
- **Causa raiz:** `current-weather.tsx:29` renderizava diretamente `location.timezone` (string IANA bruta como `America/Sao_Paulo`) sem formatar ou filtrar.
- **Correção aplicada:** removida a tag `<p>` que exibia `location.timezone`. O campo `location.label` já contém cidade + estado + país (ex.: "São Paulo, São Paulo, Brasil"), tornando o timezone redundante.
- **Testes de regressão:** E2E `tests/e2e/painel-clima.spec.ts` — `não deve exibir identificador técnico IANA de timezone no painel de clima` (verifica que nenhum texto no formato `Região/Cidade` aparece no `region[aria-label="clima"]`).
- **Status:** Corrigido
