# Projeto do Vince

O **Projeto do Vince** é uma plataforma de simulação de partidas de RPG de mesa que oferece ferramentas tanto para jogadores quanto para mestres, permitindo um controle mais eficiente e dinâmico do jogo.

## Visão Geral

Este projeto é composto por um servidor HTTP baseado em Express, que disponibiliza uma única rota para o cliente. Nessa rota, o cliente recebe uma página HTML com configurações de meta tags e links para três arquivos JavaScript essenciais:

1. **Socket.io Client**: Este arquivo permite a comunicação em tempo real entre o cliente e o servidor, essencial para jogos de RPG de mesa.

2. **app.js**: Responsável por implementar funções úteis utilizadas nas páginas e componentes do cliente.

3. **components-bundle.js**: Contém um conjunto de componentes personalizados que enriquecem a experiência do usuário.

O projeto utiliza o Prisma como ORM (Object-Relational Mapping) com um banco de dados SQLite3 para armazenar informações.

## Arquitetura

A arquitetura do projeto é centrada na escuta de requisições do cliente. O servidor verifica se o valor do campo "target" na requisição corresponde a um evento reconhecido pelo servidor e, em seguida, chama a função de handler (manipulador) responsável por aquele evento. O servidor, por fim, retorna os dados gerados pelo evento em uma resposta (response) ao cliente.

## Módulos Principais

### Módulo Events.js

O Módulo **Events.js** é responsável por ler os arquivos JavaScript dentro da pasta `/events/` e compilar esses eventos na memória do servidor. Dessa forma, eles estão prontamente disponíveis para consulta rápida quando um cliente faz uma requisição.

### Módulo Pages.js

O Módulo **Pages.js** lê os arquivos dentro da pasta `/pages/{sub-pasta}` e compila os dados de HTML, CSS e JavaScript na memória do servidor. O JavaScript de cada página pode conter duas funções importantes:

- **Load**: Esta função é executada pelo servidor sempre que alguém solicita a página correspondente. Ela retorna os dados processados junto com o HTML em uma variável chamada `page_data`.

- **Mount**: A função `Mount` é incorporada ao HTML servido ao cliente e é executada quando a página é carregada.

### Módulo Components.js

O **Módulo Components.js** é responsável por reunir todos os componentes criados com o Lit (uma biblioteca de desenvolvimento web) e construir um único arquivo com as dependências resolvidas. Esse arquivo é colocado na pasta `/public` e servido ao cliente.

Este README fornece uma visão geral do **Projeto do Vince** e sua arquitetura. Você pode explorar os detalhes de implementação nos arquivos do projeto para entender melhor como cada módulo funciona. Seja bem-vindo ao emocionante mundo do RPG de mesa com a ajuda desta plataforma!
