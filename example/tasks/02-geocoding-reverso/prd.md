# Documento de Requisitos do Produto (PRD)

## Visão Geral

A feature de **Geocoding Reverso** aprimora o Painel de Clima ao exibir o nome real da cidade detectada pela geolocalização — por exemplo, "Vitória, Espírito Santo, Brasil" — em vez do rótulo genérico "Sua localização".

O problema que resolve: atualmente, quando o usuário concede permissão de localização, o painel carrega o clima corretamente, mas não identifica a cidade pelo nome; o rótulo "Sua localização" é vago e não confirma ao usuário se a cidade detectada é a correta. Isso gera insegurança sobre qual local está sendo exibido.

A feature entrega clareza imediata: o usuário vê o nome completo da cidade sem precisar checar se o painel "acertou" a localidade. Os dados de nome são obtidos do serviço público **Nominatim OpenStreetMap** (gratuito, sem API key), consumido **exclusivamente pelo backend** — o frontend nunca acessa o Nominatim diretamente.

## Objetivos

- Eliminar a ambiguidade do rótulo "Sua localização" exibindo o nome real da cidade em **100% dos casos em que o geocoding reverso tiver sucesso**.
- Manter a experiência fluida em caso de falha do Nominatim: degradar silenciosamente para "Sua localização" sem bloquear o carregamento do clima.
- Não introduzir latência perceptível: o nome da cidade deve ser resolvido dentro do mesmo fluxo de carregamento que os dados de clima, sem etapa extra visível ao usuário.
- Exibir o nome no formato padronizado **Cidade, Estado, País** para desambiguação de cidades homônimas.

Métricas a acompanhar: % de sessões com geolocalização em que o nome real da cidade é exibido com sucesso; taxa de fallback para "Sua localização" por falha no geocoding reverso.

## Histórias de Usuário

- **Como** usuário que concedeu permissão de geolocalização, **quero** ver o nome real da minha cidade no painel, **para que** eu possa confirmar imediatamente que estou vendo o clima do lugar certo.
- **Como** usuário em uma cidade com nome ambíguo (ex.: "Santa Cruz", "São José"), **quero** ver o estado e o país ao lado do nome da cidade, **para que** eu identifique sem dúvida a localidade exibida.
- **Como** usuário em uma área com conectividade limitada, **quero** que o painel continue funcionando mesmo que o geocoding reverso falhe, **para que** a degradação de um serviço auxiliar não bloqueie o clima principal.

## Principais funcionalidades

### 1. Resolução do nome da cidade por coordenadas

- **O que faz:** a partir das coordenadas de latitude e longitude obtidas pelo navegador, o sistema resolve o nome completo da cidade correspondente.
- **Por que é importante:** transforma coordenadas anônimas em um nome legível e verificável pelo usuário.
- **Como funciona (alto nível):** o frontend envia as coordenadas ao backend; o backend chama o Nominatim com os parâmetros de localização e idioma (pt-BR) e extrai o nome formatado da resposta.

Requisitos funcionais:

1. O sistema **deve** receber as coordenadas (latitude e longitude) do navegador e enviá-las ao backend para resolução do nome.
2. O backend **deve** consultar o serviço Nominatim OpenStreetMap com os parâmetros de localização e com o cabeçalho/parâmetro de idioma definido como `pt` (português).
3. O sistema **deve** exibir o nome no formato **Cidade, Estado, País** (ex.: "Vitória, Espírito Santo, Brasil").
4. O sistema **deve** exibir o nome resolvido no mesmo local onde atualmente aparece "Sua localização" — como identificação da cidade no painel de clima.

### 2. Tratamento de falha e fallback

- **O que faz:** garante que uma falha no geocoding reverso não degrade a experiência principal de clima.
- **Por que é importante:** o Nominatim é um serviço externo sobre o qual não há controle de disponibilidade; o clima deve funcionar independentemente.
- **Como funciona (alto nível):** se o backend não obtiver resposta válida do Nominatim (timeout, erro HTTP, resposta sem campos esperados), o label "Sua localização" é mantido; o carregamento do clima não é bloqueado.

Requisitos funcionais:

5. Se o Nominatim retornar erro ou timeout, o sistema **deve** manter o rótulo "Sua localização" **sem exibir mensagem de erro ao usuário** e **sem bloquear** o carregamento dos dados de clima.
6. A falha no geocoding reverso **não deve** impedir nem atrasar a exibição das informações climáticas.
7. O backend **deve** aplicar um **timeout** máximo na chamada ao Nominatim, garantindo que uma demora excessiva não afete a resposta ao frontend.

## Experiência do usuário

**Personas e necessidades:** usuário pt-BR que já concedeu permissão de localização e espera ver "sua cidade" identificada com clareza no painel — especialmente relevante para quem mora em cidades com nomes comuns em múltiplos estados.

**Fluxo principal:**

1. Usuário abre o painel e concede permissão de geolocalização.
2. O painel inicia o carregamento: exibe estado de loading.
3. O backend resolve as coordenadas em nome de cidade (via Nominatim) **e** obtém os dados de clima (via Open-Meteo) de forma paralela ou sequencial.
4. O painel exibe os dados de clima com o nome real da cidade no formato "Cidade, Estado, País".

**Fluxo de fallback:**

1. Usuário concede permissão → backend tenta Nominatim → falha (timeout/erro).
2. Painel exibe os dados de clima com o rótulo "Sua localização" (sem erro visível).

**Considerações de UI/UX:**

- O nome exibido ocupa o mesmo espaço visual do rótulo atual "Sua localização"; o formato "Cidade, Estado, País" pode ser mais longo — o layout deve acomodar o texto sem quebrar a hierarquia visual nem truncar o nome de forma abrupta.
- A interface segue integralmente o **`DESIGN.md`** do projeto.
- Não há nova etapa de interação: a resolução ocorre de forma transparente, sem input adicional do usuário.

**Requisitos de acessibilidade:**

- O nome da cidade exibido deve ser lido por leitores de tela como texto comum (sem abreviações não pronunciáveis).
- O estado de loading existente cobre adequadamente o período de resolução; nenhum estado de loading adicional é necessário exclusivamente para o geocoding reverso.

## Restrições técnicas de alto nível

- **Integração externa obrigatória:** API pública **Nominatim OpenStreetMap** — endpoint de geocoding reverso (`https://nominatim.openstreetmap.org/reverse`), com parâmetros `lat`, `lon`, `format=json` e `accept-language=pt`. Gratuita e **sem API key**.
- **Arquitetura de acesso:** o frontend **não chama** o Nominatim diretamente; as coordenadas são enviadas ao backend, que realiza a chamada e retorna o nome resolvido.
- **Idioma:** nome da cidade retornado em **pt-BR** (`accept-language: pt`).
- **Termos de uso:** respeitar a [Política de Uso do Nominatim](https://operations.osmfoundation.org/policies/nominatim/), incluindo o header `User-Agent` identificando a aplicação e evitando chamadas em volume excessivo.
- **Privacidade:** as coordenadas do usuário são usadas exclusivamente para resolver o nome da cidade; não são armazenadas nem registradas além do necessário para o processamento da requisição.

Os detalhes de implementação (contrato de endpoint, campos extraídos da resposta Nominatim, valor de timeout, estratégia de paralelismo com o Open-Meteo) serão tratados na Especificação Técnica.

## Fora do escopo

- **Cache persistente** do nome resolvido entre sessões ou por coordenada.
- **Geocoding direto** (nome → coordenadas) — essa responsabilidade já pertence ao Open-Meteo Geocoding no 01-painel-clima.
- **Atualização automática** do nome da cidade durante a sessão (ex.: se o usuário se mover de cidade).
- **Seleção manual** do nome caso o Nominatim retorne um nome considerado errado pelo usuário — o usuário pode usar a busca manual existente para corrigir.
- **Suporte a múltiplos idiomas** no nome da cidade — apenas pt-BR.
- **Exibição de endereço completo** (rua, bairro, CEP) — apenas Cidade, Estado, País.

> Nota: riscos e decisões técnicas de implementação serão detalhados na Especificação Técnica.
