# Documentação de Testes - Gestão de Estoque (Backend)

## 1. Objetivo

Garantir que as regras de negócio, a segurança (JWT) e o tratamento de erros da API funcionem
corretamente e continuem funcionando após mudanças, com cobertura mínima exigida no build.

## 2. Tecnologias

| Ferramenta | Uso |
|---|---|
| JUnit 5 | Execução dos testes |
| Mockito | Mock de repositórios e dependências |
| Spring Boot Test / MockMvc | Testes de controllers |
| Spring Security Test | Contexto de segurança |
| JaCoCo 0.8.11 | Medição e exigência de cobertura |

## 3. Como executar

| Comando | O que faz |
|---|---|
| `./mvnw test` | Roda os testes e gera o relatório |
| `./mvnw clean verify` | Roda os testes, gera o relatório e **valida a meta de cobertura** |
| `./mvnw test -Dtest=NomeDaClasse` | Roda apenas uma classe |

Relatório de cobertura: `target/site/jacoco/index.html`

> Os testes de controller que usam `@SpringBootTest` (ex.: `FornecedorControllerTest`) exigem o
> PostgreSQL ativo em `localhost:5433`.

## 4. Meta de cobertura (quality gate)

O build falha na fase `verify` se:

- Cobertura de **instruções** for menor que **70%**
- Cobertura de **branches** for menor que **60%**

Cobertura atual: _82%_.

## 5. Estratégia de testes

- **Testes unitários de service** (`@ExtendWith(MockitoExtension.class)`): sem subir o Spring,
  com repositórios mockados. Cobrem caminho feliz, recurso inexistente e cada regra de negócio.
- **Testes de controller** (`MockMvc`): validam rotas, status HTTP e JSON de resposta.
- **Teste de handler de exceções**: chama cada `@ExceptionHandler` diretamente.
- **Testes de segurança**: filtro JWT com `MockHttpServletRequest` e `JwtService` com token real.
- **Convenção de nomes**: `deve...` para sucesso e `naoDeve...` / `deveFalhar...` para falhas.
- **Padrão**: Arrange (dados e mocks), Act (chamada), Assert (resultado e interações).

## 6. Resumo por classe

| Classe testada | Classe de teste | Testes |
|---|---|---|
| Aplicação | `BackendApplicationTests` | 1 |
| `FornecedorController` | `FornecedorControllerTest` | 4 |
| `FornecedorService` | `FornecedorServiceTest` | 5 |
| `ProdutoController` | `ProdutoControllerTest` | 4 |
| `ProdutoService` | `ProdutoServiceTest` | 7 |
| `PedidoCompraService` | `PedidoCompraServiceTest` | 18 |
| `MovimentacaoEstoqueService` | `MovimentacaoEstoqueServiceTest` | 11 |
| `CategoriaService` | `CategoriaServiceTest` | 12 |
| `AuthService` | `AuthServiceTest` | 2 |
| `JwtService` | `JwtServiceTest` | 7 |
| `UserDetailsServiceImpl` | `UserDetailsServiceImplTest` | 2 |
| `ApiExceptionHandler` | `ApiExceptionHandlerTest` | 11 |
| `JwtAuthenticationFilter` | `JwtAuthenticationFilterTest` | 10 |
| `SecurityConfig` | `SecurityConfigTest` | 3 |
| **Total** | | **97** |

## 7. Cenários cobertos

### 7.1 PedidoCompraService
- Listar pedidos com total calculado (soma de quantidade x preço dos itens)
- Buscar por id; erro se inexistente
- Criar pedido com sucesso (status inicial `RASCUNHO`)
- Erro ao criar com fornecedor inexistente ou inativo
- Erro ao criar com produto inexistente ou inativo
- Entregar pedido: soma o estoque do produto e registra movimentação de `ENTRADA`
- Erro ao entregar pedido sem itens
- Erro ao entregar sem usuário, com usuário inativo ou com perfil diferente de `COMPRADOR`
- Cancelar pedido sem exigir comprador
- Pedido entregue ou cancelado não pode ter o status alterado
- Pedido não pode ser entregue duas vezes

### 7.2 MovimentacaoEstoqueService
- Listar movimentações (geral e por produto); erro se o produto não existe
- Registrar entrada (aumenta o estoque) e saída (diminui o estoque)
- Permitir saída de todo o estoque (saldo zero)
- Erro de estoque insuficiente, sem alterar o saldo nem gravar movimentação
- Erro com usuário nulo ou inativo
- Erro com produto inexistente ou inativo

### 7.3 CategoriaService
- Listar, buscar por id e erro se inexistente
- Criar removendo espaços do nome; erro se o nome já existe
- Atualizar; sem checar duplicidade quando o nome não mudou; erro se o novo nome já existe
- Remover; erro se houver produtos vinculados (`DataIntegrityViolationException`)

### 7.4 AuthService e JwtService
- Autenticação gera token do tipo `Bearer` com nome, e-mail e perfil
- Credenciais inválidas propagam a exceção e não geram token
- Gerar token, extrair username e expiração no futuro
- Validar token do mesmo usuário; recusar token de outro usuário
- Token expirado, assinado com outra chave ou malformado lançam `JwtException`

### 7.5 ApiExceptionHandler

| Exceção | Status |
|---|---|
| `RecursoNaoEncontradoException` | 404 |
| `RegraNegocioException` / `EstoqueInsuficienteException` | 422 |
| `MethodArgumentNotValidException` | 400 (com mapa de campos) |
| JSON malformado / tipo de parâmetro inválido | 400 |
| `AuthenticationException` | 401 |
| `AccessDeniedException` | 403 |
| `UnsupportedOperationException` | 405 |
| Exceções do Spring MVC (`ErrorResponse`) | status original |
| Qualquer outra exceção | 500, sem vazar detalhes internos |

### 7.6 JwtAuthenticationFilter
- Sem header ou com header que não é `Bearer`: segue sem autenticar
- Token válido: popula o `SecurityContext` com as autoridades do usuário
- Token inválido para o usuário, username nulo ou contexto já autenticado: não autentica
- Token expirado, malformado, vazio ou de usuário removido: segue sem autenticar (resposta 401 nas rotas protegidas)

### 7.7 SecurityConfig e controllers
- Hash BCrypt verificável, CORS restrito ao front local, criação do `AuthenticationProvider`
- Controllers de fornecedor e produto: listar, buscar, criar (incluindo erro 400 de validação) e remover

## 8. Pontos de atenção

- `FornecedorControllerTest` usa `@SpringBootTest` com banco real; migrar para `@WebMvcTest`
  ou Testcontainers torna os testes independentes do ambiente.
- Ainda sem testes de controller para Categoria, Movimentação, Pedido de Compra e Auth.