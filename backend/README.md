# Gestão de Estoque - Backend

API REST para controle de estoque de uso interno: produtos, categorias, fornecedores, movimentações de estoque e pedidos de compra, com dashboard de indicadores.

## Tecnologias

- Java 21
- Spring Boot 4.1.1 (Web MVC, Data JPA, Validation, Security)
- Hibernate 7
- PostgreSQL 15 (via Docker)
- Autenticação JWT (jjwt 0.12)
- Documentação com springdoc-openapi (Swagger UI)
- Lombok
- Maven
## Pré-requisitos

- JDK 21
- Maven 3.9+ (ou o wrapper `mvnw`, se o projeto o incluir)
- Docker e Docker Compose
## Como executar

### 1. Subir o banco

Na pasta que contém o `docker-compose.yml`:

```bash
docker compose up -d
```

Isso cria o container `gestao_estoque_db` (PostgreSQL 15) na porta **5433** do host, com o banco `gestao_estoque`. Na primeira inicialização, o script `database/schema.sql` é executado automaticamente e cria os enums, as tabelas e os índices.

> O script de schema só roda quando o volume `pgdata` está vazio. Se você alterar o `schema.sql` e quiser recriar tudo, apague o volume (isso **apaga todos os dados**):
> ```bash
> docker compose down -v
> docker compose up -d
> ```

### 2. (Opcional) Carregar dados fictícios

O arquivo `database/seed-dados-ficticios.sql` popula o banco com usuários, categorias, fornecedores, produtos, movimentações e pedidos de exemplo.

> **Atenção:** o seed começa com `TRUNCATE ... RESTART IDENTITY CASCADE` e **apaga os dados existentes** nas tabelas. Use apenas em ambiente de desenvolvimento.

```bash
docker cp database/seed-dados-ficticios.sql gestao_estoque_db:/seed.sql
docker exec gestao_estoque_db psql -U postgres -d gestao_estoque -f /seed.sql
```

Usuários criados pelo seed (senha de todos: `password`):

| E-mail | Perfil | Ativo |
|---|---|---|
| admin@estoque.com | ADMIN | sim |
| operador@estoque.com | OPERADOR | sim |
| comprador@estoque.com | COMPRADOR | sim |
| comprador.inativo@estoque.com | COMPRADOR | não |

### 3. Configurar as variáveis de ambiente

A aplicação lê as configurações de variáveis de ambiente, com valores padrão para desenvolvimento local:

| Variável | Padrão | Descrição |
|---|---|---|
| `JWT_SECRET` | **sem padrão (obrigatória)** | Segredo usado para assinar os tokens JWT |
| `DB_URL` | `jdbc:postgresql://localhost:5433/gestao_estoque` | URL do banco |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `postgrespassword` | Senha do banco |
| `SERVER_PORT` | `8090` | Porta da API |
| `SHOW_SQL` | `true` | Loga o SQL gerado pelo Hibernate |
| `ADMIN_EMAIL` | `admin@gestao.com` | E-mail do administrador inicial (veja abaixo) |
| `ADMIN_SENHA` | `123456` | Senha do administrador inicial |

A aplicação **não inicia sem `JWT_SECRET`**. Para gerar um segredo (PowerShell):

```powershell
$b = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
[Convert]::ToBase64String($b)
```

Defina a variável no terminal antes de executar:

```powershell
$env:JWT_SECRET = "valor_gerado_acima"
```

Ou, no IntelliJ: `Run > Edit Configurations > Modify options > Environment variables`.

### Administrador inicial

Na inicialização, a classe `DataInitializer` cria um usuário `ADMIN` (nome "Administrador do Sistema") com `ADMIN_EMAIL` e `ADMIN_SENHA`, **somente se ainda não existir usuário com esse e-mail**. Assim, mesmo com o banco vazio, é possível fazer o primeiro login. Se você carregar o seed e reiniciar a aplicação, esse usuário também será criado, além dos usuários do seed.

> **Produção:** troque obrigatoriamente `DB_PASSWORD`, `ADMIN_SENHA` e `JWT_SECRET`, remova os usuários de teste do seed, restrinja o acesso ao Swagger (hoje é público) e libere no CORS apenas o domínio do frontend. Nunca versione segredos reais.

### 4. Iniciar a API

```bash
./mvnw spring-boot:run
```

No Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8090`. O frontend (Vite) roda em `http://localhost:5173` e precisa estar liberado no CORS.

### Documentação interativa

Com a aplicação rodando: `http://localhost:8090/swagger-ui.html`

O JSON da especificação OpenAPI fica em `http://localhost:8090/v3/api-docs`.

## Banco de dados

O Hibernate roda com `ddl-auto=validate`: ele **não cria nem altera tabelas**, só confere se o schema bate com as entidades. Toda mudança de estrutura deve ser feita em `database/schema.sql` (ou em migrations).

Tabelas: `tb_usuarios`, `tb_categorias`, `tb_fornecedores`, `tb_produtos`, `tb_movimentacao_estoque`, `tb_pedido_compra`, `tb_items_pedido_compra`.

### Enums nativos do PostgreSQL

| Enum | Valores |
|---|---|
| `tipo_perfil_enum` | `ADMIN`, `OPERADOR`, `COMPRADOR` |
| `tipo_movimentacao_enum` | `ENTRADA`, `SAIDA` |
| `status_pedido_enum` | `RASCUNHO`, `SOLICITADO`, `APROVADO`, `CANCELADO`, `ENTREGUE` |

Como são enums nativos, as entidades precisam mapear esses campos com:

```java
@Enumerated(EnumType.STRING)
@JdbcTypeCode(SqlTypes.NAMED_ENUM)
```

Sem o `@JdbcTypeCode(SqlTypes.NAMED_ENUM)`, o Hibernate envia o valor como `varchar` e o PostgreSQL recusa o insert. Ao criar um novo enum nativo no banco, aplique a mesma anotação no campo da entidade.

## Endpoints principais

Todas as rotas ficam sob `/api` e exigem token JWT, exceto `/api/auth/**` (login).

| Recurso | Rota base | Operações |
|---|---|---|
| Autenticação | `/api/auth` | `POST /login` |
| Produtos | `/api/produtos` | `GET`, `GET /ativos`, `GET /{id}`, `POST`, `PUT /{id}`, `PATCH /{id}/inativar`, `PATCH /{id}/ativar` |
| Categorias | `/api/categorias` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` |
| Fornecedores | `/api/fornecedores` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `PATCH /{id}/inativar`, `PATCH /{id}/ativar`, `DELETE /{id}` |
| Movimentações | `/api/movimentacoes` | `GET`, `GET /produto/{produtoId}`, `POST` |
| Pedidos de compra | `/api/compras` | `GET`, `GET /{id}`, `POST`, `PATCH /{id}/status` |
| Health check | `/api/test/health` | `GET` (exige token) |

O dashboard não possui endpoint próprio: os indicadores são montados no frontend a partir dos endpoints acima.

Consulte o Swagger para os contratos completos de request e response.

## Regras de negócio

### Produtos
- Produto inativo não pode ser adicionado a pedido de compra.
- Código de barras é único.
- O saldo em estoque é alterado por movimentações e pela entrega de pedidos; o cadastro sempre começa com saldo 0.
- O banco impede saldo negativo (`CHECK quantidade_estoque >= 0`).
### Pedidos de compra
- Fluxo usual: `RASCUNHO` → `SOLICITADO` → `APROVADO` → `ENTREGUE`, com `CANCELADO` como alternativa.
- Não é possível criar pedido para fornecedor inativo.
- Pedido `ENTREGUE` ou `CANCELADO` não pode ter o status alterado.
- **A entrega só pode ser realizada por usuário ativo com perfil `ADMIN`.** Ao entregar, o sistema soma a quantidade de cada item ao estoque do produto e registra uma movimentação de `ENTRADA` com o usuário que realizou a entrega.
- Não é possível entregar pedido sem itens.
### Perfis e autorização
- A API é stateless: cada requisição precisa do header `Authorization: Bearer <token>`. Sem token válido, a resposta é `401`.
- **Não há restrição de acesso por perfil nas rotas.** Qualquer usuário autenticado (`ADMIN`, `OPERADOR` ou `COMPRADOR`) pode consultar, criar, editar e excluir produtos, categorias, fornecedores, movimentações e pedidos.
- A única regra por perfil está no service: a entrega de pedido exige `ADMIN` ativo (veja "Pedidos de compra").
- Rotas públicas: `/api/auth/**` e a documentação (`/swagger-ui.html`, `/swagger-ui/**`, `/v3/api-docs/**`). O `/api/test/health` exige autenticação.
### CORS
Apenas a origem `http://localhost:5173` (frontend em desenvolvimento) é liberada. Para outro domínio, ajuste `corsConfigurationSource` em `SecurityConfig`.

## Tratamento de erros

Os erros seguem um formato único:

```json
{
  "timestamp": "2026-11-12T23:06:19-03:00",
  "status": 422,
  "error": "Unprocessable Content",
  "mensagem": "Descrição do problema.",
  "path": "/api/compras"
}
```

- `404`: recurso não encontrado
- `422`: regra de negócio violada
- `500`: erro inesperado (a causa completa é registrada no log do servidor)
## Estrutura do projeto

```
backend/
├── database/
│   ├── schema.sql                  # enums, tabelas e índices
│   └── seed-dados-ficticios.sql    # dados de exemplo (apaga os dados existentes)
└── src/main/java/com/gestaoestoque/backend
    ├── controller     # endpoints REST
    ├── service        # regras de negócio
    ├── repository     # acesso a dados (Spring Data JPA)
    ├── model          # entidades JPA
    ├── dto            # objetos de request/response
    ├── enums          # enums de domínio
    ├── exception      # exceções e handler global
    └── security       # JWT e configuração do Spring Security
```

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Could not resolve placeholder 'JWT_SECRET'` | Variável `JWT_SECRET` não definida |
| `Connection to localhost:5433 refused` | Container do PostgreSQL parado (`docker compose up -d`) |
| `Schema-validation: missing table/column` | Banco criado com um `schema.sql` desatualizado; recrie o volume |
| `column "..." is of type ..._enum but expression is of type character varying` | Falta `@JdbcTypeCode(SqlTypes.NAMED_ENUM)` no campo da entidade |
| Erro 401/403 depois de trocar o `JWT_SECRET` | Token antigo no navegador; faça logout e login novamente |
| `422` ao entregar pedido | Usuário logado não é `ADMIN` ativo |
| `422` ao criar pedido | Produto ou fornecedor inativo |

## Melhorias planejadas

- Dashboard: preencher dias sem movimentação e agrupar as datas no fuso `America/Sao_Paulo`
- Pedidos de compra: listar apenas produtos ativos no formulário (usar `GET /api/produtos/ativos`)
- Validar produtos e fornecedor antes de salvar o pedido
- Autorização por perfil nas rotas (hoje qualquer usuário autenticado acessa tudo, exceto a entrega de pedidos)
- Substituir o `schema.sql` por migrations (Flyway) para versionar mudanças no banco
 