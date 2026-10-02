# Teste rápido da API — camada temporária para desenvolvimento

Esta versão adiciona Controllers apenas para permitir testar os Services do Dev 2 antes da implementação definitiva do Dev 3.

## Configuração

O backend usa:

- Porta: `8090`
- Base da API: `http://localhost:8090/api`
- PostgreSQL: `localhost:5433/gestao_estoque`

Execute primeiro o seed `seed-dados-ficticios.sql` no banco de desenvolvimento.

## Navegador

Endpoints GET que podem ser testados diretamente no navegador:

```text
http://localhost:8090/api/test/health
http://localhost:8090/api/categorias
http://localhost:8090/api/fornecedores
http://localhost:8090/api/produtos
http://localhost:8090/api/produtos/ativos
http://localhost:8090/api/movimentacoes
http://localhost:8090/api/compras
http://localhost:8090/api/compras/1
```

## Postman — Produtos

### Listar

```http
GET http://localhost:8090/api/produtos
```

### Criar

```http
POST http://localhost:8090/api/produtos
Content-Type: application/json

{
  "codigoBarras": "7891000000999",
  "nome": "Produto de Teste",
  "descricao": "Produto criado pelo Postman",
  "categoriaId": 1,
  "precoCusto": 99.90,
  "estoqueMinimo": 5,
  "unidadeMedida": "UN"
}
```

### Atualizar

```http
PUT http://localhost:8090/api/produtos/1
Content-Type: application/json

{
  "codigoBarras": "7891000000011",
  "nome": "Notebook Pro 14 - Atualizado",
  "descricao": "Descrição atualizada",
  "categoriaId": 1,
  "precoCusto": 3550.00,
  "estoqueMinimo": 5,
  "unidadeMedida": "UN"
}
```

## Postman — Categorias

```http
GET http://localhost:8090/api/categorias
```

```http
POST http://localhost:8090/api/categorias
Content-Type: application/json

{
  "nome": "Testes",
  "descricao": "Categoria criada para testes"
}
```

```http
PUT http://localhost:8090/api/categorias/1
Content-Type: application/json

{
  "nome": "Informática e Tecnologia",
  "descricao": "Categoria atualizada"
}
```

## Postman — Fornecedores

```http
GET http://localhost:8090/api/fornecedores
```

```http
POST http://localhost:8090/api/fornecedores
Content-Type: application/json

{
  "razaoSocial": "Fornecedor Teste Ltda",
  "cnpj": "78901234000107",
  "email": "teste@fornecedor.com.br",
  "telefone": "51999999999"
}
```

## Postman — Movimentação

### Entrada

O header `X-Usuario-Id` é temporário. Ele simula o usuário autenticado enquanto o Spring Security/JWT ainda não foi implementado pelo Dev 3.

```http
POST http://localhost:8090/api/movimentacoes
X-Usuario-Id: 3
Content-Type: application/json

{
  "produtoId": 1,
  "tipoMovimentacao": "ENTRADA",
  "quantidade": 5,
  "observacao": "Entrada manual para teste"
}
```

### Saída válida

```http
POST http://localhost:8090/api/movimentacoes
X-Usuario-Id: 2
Content-Type: application/json

{
  "produtoId": 2,
  "tipoMovimentacao": "SAIDA",
  "quantidade": 3,
  "observacao": "Saída manual para teste"
}
```

### Saída maior que o estoque

Use uma quantidade maior que o saldo atual. A API deve responder erro de regra de negócio e o estoque não deve ficar negativo.

```http
POST http://localhost:8090/api/movimentacoes
X-Usuario-Id: 2
Content-Type: application/json

{
  "produtoId": 2,
  "tipoMovimentacao": "SAIDA",
  "quantidade": 99999,
  "observacao": "Teste de estoque insuficiente"
}
```

### Histórico por produto

```http
GET http://localhost:8090/api/movimentacoes/produto/2
```

## Postman — Pedidos de compra

### Criar pedido

```http
POST http://localhost:8090/api/compras
Content-Type: application/json

{
  "fornecedorId": 1,
  "itens": [
    {
      "produtoId": 2,
      "quantidade": 10,
      "precoUnitario": 43.50
    },
    {
      "produtoId": 3,
      "quantidade": 5,
      "precoUnitario": 85.00
    }
  ]
}
```

O pedido nasce como `RASCUNHO`.

### Alterar status

```http
PATCH http://localhost:8090/api/compras/1/status
X-Usuario-Id: 3
Content-Type: application/json

{
  "status": "SOLICITADO"
}
```

### Entregar pedido

Para testar a regra definida no Dev 2, use um usuário `COMPRADOR` ativo. No seed, o usuário `3` é o comprador.

```http
PATCH http://localhost:8090/api/compras/1/status
X-Usuario-Id: 3
Content-Type: application/json

{
  "status": "ENTREGUE"
}
```

Ao entregar, o Service deve:

1. localizar os itens;
2. aumentar o estoque de cada produto;
3. registrar uma movimentação `ENTRADA` para cada item;
4. vincular as movimentações ao usuário 3;
5. alterar o pedido para `ENTREGUE`.

Tentar entregar novamente um pedido já entregue deve gerar erro de regra de negócio.

Usar `X-Usuario-Id: 2` para entregar deve falhar porque o usuário 2 é `OPERADOR`, não `COMPRADOR`.

## Observação sobre autenticação

Não existe autenticação JWT nesta versão de teste. O header `X-Usuario-Id` é deliberadamente um mecanismo temporário para permitir testar a regra de negócio que depende do usuário.

Quando o Dev 3 implementar Spring Security/JWT, o Controller deverá obter o usuário a partir do contexto de autenticação em vez desse header.
