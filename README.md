# Sistema de Gestão de Estoque e Compras

Projeto final desenvolvido em grupo (7 integrantes) para a formação **Full Stack da +praTi**. A aplicação consiste em um sistema interno de controle de estoque e compras, com gestão de cadastros, movimentações de entrada e saída, fluxo de pedidos de compra e dashboard com indicadores.

## Estrutura do monorepo

- **[`backend/`](./backend)** — API REST em **Java 21 + Spring Boot**, autenticação JWT, regras de negócio e documentação via Swagger.
- **[`frontend/`](./frontend)** — Interface web em **React 18 + Vite + Tailwind CSS**, gráficos com Recharts, consumo da API via Axios e testes automatizados com Jest e Testing Library.
- **[`database/`](./database)** — Scripts SQL (`schema.sql` e `seed-dados-ficticios.sql`) para criação das tabelas, enums e carga inicial no PostgreSQL.
- **`docker-compose.yml`** — Configuração do container PostgreSQL 15 para ambiente local[cite: 1].

## Repositórios de deploy e documentação complementar

A versão publicada e a documentação de deploy de cada camada também são mantidas nos repositórios individuais:
- Frontend: [gestao-estoque-frontend](https://github.com/lucasr4m0n/gestao-estoque-frontend)
- Backend: [gestao-estoque-backend](https://github.com/lucasr4m0n/gestao-estoque-backend)

## Como rodar o projeto localmente

1. Na raiz do projeto, suba o banco de dados com `docker compose up -d` e siga as instruções em [`backend/README.md`](./backend/README.md).
2. Instale as dependências e inicie a aplicação web seguindo as instruções em [`frontend/README.md`](./frontend/README.md).
