# Documento de Requisitos do Produto (PRD)

## Visão Geral

O **Painel de Clima** é uma funcionalidade que permite ao usuário consultar, de forma rápida e visualmente clara, as condições meteorológicas atuais e a previsão para as próximas horas de qualquer cidade. O usuário digita o nome de uma cidade (ou aceita a sugestão baseada em sua localização) e vê, em um painel único, a temperatura, a condição do tempo, a sensação térmica, o vento, a umidade e a precipitação — além de uma faixa com a previsão hora a hora do dia.

O problema que resolve: hoje não há, no produto, nenhuma forma de o usuário obter informação climática sem sair para um serviço externo. A feature entrega esse valor dentro da própria aplicação, com uma experiência enxuta, em português e no sistema métrico.

É direcionada ao usuário final da aplicação (público geral, pt-BR) que quer uma resposta imediata para "como está o tempo agora e nas próximas horas?". Os dados climáticos vêm da API pública **Open-Meteo** (gratuita, sem chave), consumida **exclusivamente pelo backend** — o frontend nunca chama o provedor externo diretamente.

## Objetivos

- Permitir que o usuário obtenha o clima atual de uma cidade em **até 2 interações** (digitar + selecionar) a partir da tela do painel.
- Exibir, em uma única visualização, os indicadores essenciais: temperatura, condição, sensação térmica, vento, umidade e precipitação.
- Oferecer **previsão horária** do dia corrente de forma navegável/visível no painel.
- Sugerir automaticamente a cidade do usuário via geolocalização do navegador, **reduzindo a fricção inicial** quando a permissão for concedida.
- Garantir que **100% das chamadas a provedores externos** passem pelo backend (nenhuma chamada direta do navegador ao Open-Meteo).
- Resposta do painel percebida como rápida: dados visíveis em **até ~2s** em condições normais de rede após a seleção da cidade.

Métricas a acompanhar: taxa de buscas com resultado válido, taxa de erro retornada ao usuário, % de sessões que usam a sugestão por geolocalização.

## Histórias de Usuário

- **Como** visitante da aplicação, **quero** digitar o nome de uma cidade e ver o clima atual, **para que** eu saiba como está o tempo sem abrir outro site.
- **Como** usuário, **quero** ver a previsão para as próximas horas, **para que** eu possa me planejar para o restante do dia.
- **Como** usuário, **quero** que o painel sugira minha cidade automaticamente ao abrir, **para que** eu veja o clima local sem precisar digitar.
- **Como** usuário que digitou um nome ambíguo (ex.: "Springfield", "Santa Cruz"), **quero** escolher entre as cidades correspondentes, **para que** eu veja o clima do lugar certo.
- **Como** usuário, **quero** uma mensagem clara quando a cidade não for encontrada ou o serviço estiver indisponível, **para que** eu saiba o que aconteceu e possa tentar de novo.
- **Como** usuário que negou a permissão de localização, **quero** continuar usando o painel normalmente por busca manual, **para que** a recusa não bloqueie a funcionalidade.

## Principais funcionalidades

### 1. Busca de cidade

- **O que faz:** o usuário digita o nome de uma cidade e o sistema resolve para uma localidade real (com país/região para desambiguar).
- **Por que é importante:** é o ponto de entrada da feature; precisa lidar com nomes ambíguos e entradas inexistentes.
- **Como funciona (alto nível):** o frontend envia o termo ao backend, que consulta o serviço de geocoding e retorna candidatos de cidade; o usuário seleciona a cidade desejada.

Requisitos funcionais:

1. O sistema **deve** permitir que o usuário digite o nome de uma cidade em um campo de busca.
2. Quando a busca retornar **mais de uma** localidade correspondente, o sistema **deve** apresentar as opções com informação suficiente para desambiguar (ex.: cidade, região/estado, país).
3. Quando a busca **não retornar** nenhuma localidade, o sistema **deve** exibir uma mensagem clara de "cidade não encontrada" sem quebrar a interface.
4. O sistema **deve** tratar entradas vazias ou inválidas sem realizar consulta desnecessária.

### 2. Exibição do clima atual

- **O que faz:** mostra as condições meteorológicas do momento para a cidade selecionada.
- **Por que é importante:** é o valor central da feature.
- **Como funciona (alto nível):** com a cidade resolvida, o backend obtém os dados atuais e os entrega prontos para exibição.

Requisitos funcionais:

5. O sistema **deve** exibir a **temperatura atual** em graus Celsius (°C).
6. O sistema **deve** exibir a **condição do tempo** atual de forma legível (ex.: ensolarado, nublado, chuva) com indicação visual/ícone correspondente.
7. O sistema **deve** exibir a **sensação térmica** (apparent temperature) em °C.
8. O sistema **deve** exibir o **vento** (velocidade em km/h).
9. O sistema **deve** exibir a **umidade relativa** (%) e a **precipitação** (mm e/ou probabilidade).
10. O sistema **deve** identificar claramente a **cidade** (e região/país) à qual os dados se referem.

### 3. Previsão horária

- **O que faz:** apresenta a previsão para as próximas horas do dia corrente.
- **Por que é importante:** ajuda o usuário a se planejar para o restante do dia.
- **Como funciona (alto nível):** o backend retorna uma série horária que o painel exibe de forma navegável/rolável.

Requisitos funcionais:

11. O sistema **deve** exibir uma faixa de **previsão horária** com, no mínimo, temperatura e condição por hora.
12. A previsão horária **deve** indicar claramente o horário de cada ponto e destacar a hora atual.
13. A faixa horária **deve** permanecer legível e navegável em telas pequenas (rolagem horizontal ou equivalente).

### 4. Sugestão por geolocalização

- **O que faz:** ao abrir o painel, tenta detectar a localização do usuário e pré-carregar o clima da cidade correspondente.
- **Por que é importante:** elimina a fricção inicial de digitar quando a permissão é concedida.
- **Como funciona (alto nível):** o navegador solicita a localização; com as coordenadas, o backend resolve a cidade e retorna o clima.

Requisitos funcionais:

14. Ao carregar o painel, o sistema **deve** oferecer/solicitar a obtenção da localização do usuário pelo navegador.
15. Se a permissão for **concedida**, o sistema **deve** carregar automaticamente o clima da localidade detectada.
16. Se a permissão for **negada**, indisponível ou falhar, o sistema **deve** apresentar o estado inicial para busca manual, **sem bloquear** o uso e sem erro intrusivo.

### 5. Tratamento de erros e estados

Requisitos funcionais:

17. O sistema **deve** exibir um **estado de carregamento** enquanto os dados são buscados.
18. O sistema **deve** exibir mensagens de erro claras e em pt-BR para falhas de rede, indisponibilidade do provedor ou cidade não encontrada, oferecendo a possibilidade de **tentar novamente**.
19. O frontend **deve** consumir dados **somente do backend** da aplicação; nenhuma chamada direta ao provedor externo é feita pelo navegador.

## Experiência do usuário

**Personas e necessidades:** público geral pt-BR que quer uma resposta imediata sobre o tempo, em qualquer dispositivo. Necessita de clareza, rapidez e nenhuma curva de aprendizado.

**Fluxos principais:**

- *Fluxo com geolocalização:* usuário abre o painel → concede permissão → vê o clima da sua cidade já carregado → pode trocar a cidade na busca.
- *Fluxo de busca manual:* usuário abre o painel → digita a cidade → seleciona entre os resultados (se houver ambiguidade) → vê o clima atual + previsão horária.
- *Fluxo de erro:* cidade não encontrada ou serviço indisponível → mensagem clara → opção de tentar novamente.

**Considerações de UI/UX:**

- A interface segue integralmente o **`DESIGN.md`** do projeto (estética, cores, tipografia e espaçamento), em pt-BR e sistema métrico.
- Hierarquia visual com destaque para a temperatura e a condição atuais; indicadores secundários (sensação, vento, umidade, precipitação) organizados de forma escaneável.
- Previsão horária apresentada como faixa navegável, com a hora atual destacada.
- Layout responsivo (desktop e mobile).

**Requisitos de acessibilidade:**

- Contraste adequado e textos legíveis conforme as diretrizes de design.
- Campo de busca e seleção de cidade operáveis por teclado.
- Ícones de condição acompanhados de **texto alternativo/rótulo** descritivo (não depender só de cor/ícone).
- Estados de carregamento e erro anunciáveis por leitores de tela.

## Restrições técnicas de alto nível

- **Integração externa obrigatória:** API pública **Open-Meteo** — Geocoding (`https://geocoding-api.open-meteo.com/v1/search`) e Weather/Forecast (`https://api.open-meteo.com/v1/forecast`). Gratuita e **sem necessidade de API key**.
- **Arquitetura de acesso:** o frontend consome **exclusivamente** um endpoint do **backend** da aplicação; o backend é o único a falar com o Open-Meteo.
- **Unidades e idioma:** dados e UI em **sistema métrico** (°C, km/h, mm) e **pt-BR**.
- **Privacidade:** a localização do usuário (quando concedida) é usada apenas para resolver a cidade e obter o clima; não há requisito de persistência/armazenamento dessa informação.
- **Conformidade de uso:** respeitar os termos e limites de uso da API gratuita Open-Meteo.
- **Desempenho:** painel utilizável em condições normais de rede com retorno de dados em ~2s após a seleção da cidade.

Os detalhes de implementação (endpoints, contratos, cache, parsing de weather codes, bibliotecas) serão tratados na Especificação Técnica.

## Fora do escopo

- **Persistência de dados:** histórico de buscas, cidades favoritas/salvas ou contas de usuário.
- **Previsão de múltiplos dias** (diária estendida) — esta versão cobre clima atual + previsão **horária** do dia.
- **Alternância de unidades** (°C/°F, km/h/mph) — fixado em métrico nesta versão.
- **Múltiplos idiomas** — apenas pt-BR.
- **Mapas, radares, alertas meteorológicos** e dados de qualidade do ar.
- **Notificações** (push/e-mail) e atualização automática em tempo real do painel.
- **Comparação entre cidades** ou múltiplos painéis simultâneos.

> Nota: riscos e decisões técnicas de implementação serão detalhados na Especificação Técnica.
