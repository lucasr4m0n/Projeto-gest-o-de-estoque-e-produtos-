# Documentação de Testes - Gestão de Estoque (Frontend)
 
## 1. Objetivo
 
Garantir que as regras de interface (RN-F01 a RN-F04), a autenticação e sessão, a camada de serviços
e as telas principais funcionem corretamente e continuem funcionando após mudanças, com cobertura
mínima exigida (RNF-F02).
 
## 2. Tecnologias
 
| Ferramenta | Uso |
|---|---|
| Jest 29 | Execução dos testes e medição de cobertura |
| React Testing Library | Renderização e interação com componentes, como o usuário faria |
| `@testing-library/jest-dom` | Matchers de DOM (`toBeInTheDocument`, etc.) |
| `cross-env` | Define `NODE_ENV=test` de forma portável (Windows/Linux) |
 
## 3. Como executar
 
| Comando | O que faz |
|---|---|
| `npm test` | Roda todas as suítes |
| `npm run test:coverage` | Roda os testes, gera o relatório e **valida a meta de cobertura** |
| `npx jest caminho/do/arquivo` | Roda apenas uma suíte (ex.: `npx jest src/pages/Dashboard`) |
| `npx jest --verbose` | Lista cada caso de teste individualmente |
 
Relatório de cobertura: `coverage/lcov-report/index.html`
 
> Use `npm test` (e não `npx test`): o `npx test` baixa um pacote homônimo do registro e não executa a suíte.
 
## 4. Meta de cobertura (quality gate)
 
O comando `npm run test:coverage` falha se qualquer métrica ficar abaixo do limiar definido em
`coverageThreshold` no `jest.config.cjs`:
 
- Cobertura de **statements**: mínimo **70%**
- Cobertura de **branches**: mínimo **70%**
- Cobertura de **functions**: mínimo **70%**
- Cobertura de **lines**: mínimo **70%**
Cobertura atual (último `npm run test:coverage`):
 
| Métrica | Atual | Mínimo |
|---|---|---|
| Statements | 82,53% | 70% |
| Branches | 71,49% | 70% |
| Functions | 77,35% | 70% |
| Lines | 82,69% | 70% |
 
Estado atual da suíte: **25 suítes, 109 testes, todos passando**. A margem de branches é pequena (1,49 ponto), então novas telas ou ramificações sem teste podem fazer o gate falhar.
 
## 5. Estratégia de testes
 
- **Testes de regras puras** (`utils/`): funções sem dependência de React, validadas com entradas válidas, inválidas e limites.
- **Testes de serviços** (`services/`): o cliente Axios (`api.js`) é mockado com `jest.mock`, sem rede real. Validam o método HTTP e a rota chamados (ex.: `GET /produtos`, `PATCH /compras/1/status`), o payload enviado e o dado devolvido. Exceções: o `authService` usa `fetch` global mockado, o `dashboardService` tem os demais serviços mockados (testa só a consolidação) e o `api.test.js` usa o Axios real com o adaptador de rede trocado por uma função falsa, para exercitar os interceptors.
- **Testes de componentes** (`components/`): renderização, estados (loading, vazio, erro) e eventos.
- **Testes de contextos e hooks**: `AuthContext`, `ToastContext` e `useFetch`, incluindo erro de uso fora do provider.
- **Testes de páginas**: fluxo completo da tela (listar, validar, criar), com os serviços mockados via `jest.mock`. Nas telas de Login e no `AuthContext`, o mock é do `authService`.
- **Consultas acessíveis**: elementos localizados por texto, papel (role) e label, não por classe CSS.
- **Convenção de nomes**: descrições em português, no presente, dizendo o comportamento esperado (ex.: "bloqueia saida superior ao saldo disponivel"). Casos ligados a requisitos levam o código no título (ex.: `RF-F06`, `RN-F01`).
- **Padrão**: Arrange (mocks e render), Act (interação do usuário), Assert (o que aparece na tela e quais chamadas foram feitas).
### 5.1 Infraestrutura de teste
 
| Arquivo | Função |
|---|---|
| `jest.config.cjs` | Configuração do Jest, `moduleNameMapper` e `coverageThreshold` |
| `src/test-utils.jsx` | `renderWithProviders(ui, { route })`: renderiza dentro de `MemoryRouter`, `ToastProvider` e `AuthProvider` |
| `src/__mocks__/rechartsMock.jsx` | Substitui o `recharts` nos testes (o `ResponsiveContainer` não renderiza no JSDOM) |
 
> **Atenção:** `src/__mocks__/` é infraestrutura de teste. Não confundir com `src/mocks/`, que guarda os dados fictícios da aplicação.
> O nome do arquivo precisa ser exatamente o apontado no `moduleNameMapper` (`rechartsMock.jsx`), senão o Jest acusa "Could not locate module recharts".
 
## 6. Resumo por suíte
 
| Área | Arquivo de teste | Testes |
|---|---|---|
| Utils | `utils/validators.test.js` | 11 |
| Utils | `utils/formatters.test.js` | 7 |
| Componentes | `components/BasicComponents.test.jsx` (Button, Input, Select, Badge, Spinner) | 9 |
| Componentes | `components/Table.test.jsx` | 3 |
| Componentes | `components/Modal.test.jsx` | 4 |
| Componentes | `components/Pagination.test.jsx` | 2 |
| Componentes | `components/ProtectedRoute.test.jsx` | 3 |
| Componentes | `components/Layout.test.jsx` | 2 |
| Hooks | `hooks/useFetch.test.jsx` | 4 |
| Contextos | `contexts/AuthContext.test.jsx` | 2 |
| Contextos | `contexts/ToastContext.test.jsx` | 3 |
| Serviços | `services/api.test.js` (interceptors do Axios) | 7 |
| Serviços | `services/authService.test.js` | 4 |
| Serviços | `services/produtoService.test.js` | 5 |
| Serviços | `services/cadastroServices.test.js` (categorias e fornecedores) | 2 |
| Serviços | `services/movimentacaoService.test.js` | 2 |
| Serviços | `services/compraService.test.js` | 6 |
| Serviços | `services/dashboardService.test.js` | 1 |
| Páginas | `pages/Login/Login.test.jsx` | 3 |
| Páginas | `pages/Dashboard/Dashboard.test.jsx` | 3 |
| Páginas | `pages/Produtos/Produtos.test.jsx` | 4 |
| Páginas | `pages/Categorias/Categorias.test.jsx` | 3 |
| Páginas | `pages/Fornecedores/Fornecedores.test.jsx` | 3 |
| Páginas | `pages/Movimentacoes/Movimentacoes.test.jsx` | 3 |
| Páginas | `pages/Compras/Compras.test.jsx` | 13 |
| **Total** | **25 suítes** | **109** |
 
## 7. Cenários cobertos
 
### 7.1 Validadores e formatadores (`utils/`)
- Campo obrigatório: rejeita vazio/nulo, aceita preenchido
- E-mail: aceita formatos corretos, rejeita inválidos
- CNPJ: valida dígitos verificadores; rejeita tamanho ou dígitos inválidos
- Número positivo: aceita apenas valores maiores que zero
- `validarBaixaEstoque` (RN-F02): bloqueia quantidade ≤ 0, bloqueia saída maior que o saldo, permite saída válida
- Máscara visual de CNPJ
- Moeda BRL (valores inválidos viram zero), números no padrão pt-BR, traço para ausentes, datas válidas
- `isEstoqueCritico` (RN-F01): crítico quando saldo ≤ mínimo, não crítico quando saldo > mínimo
### 7.2 Componentes
- **Button:** renderiza rótulo e dispara `onClick`; fica desabilitado em carregamento; aplica variante
- **Input:** renderiza label e propaga alterações; exibe erro e marca `aria-invalid`
- **Select:** renderiza opções e placeholder; exibe erro
- **Badge / Spinner:** aplica tom `danger`; possui papel de status acessível
- **Table (RF-F03):** spinner em loading, mensagem de vazio, dados com colunas customizadas
- **Modal:** não renderiza fechado; mostra título e conteúdo aberto; fecha com Esc e com o botão de fechar
- **Pagination:** exibe faixa e página atual e navega; não renderiza sem itens
- **ProtectedRoute (RF-F02):** redireciona sem sessão para `/login`; permite acesso com sessão; bloqueia perfil fora da lista
- **Layout:** renderiza navegação, dados do usuário e conteúdo (`Outlet`); encerra a sessão ao clicar em Sair
### 7.3 Hooks e contextos
- **useFetch:** resolve dados, captura erros, notifica o consumidor na falha, reexecuta com `refetch`
- **AuthContext (RF-F01):** inicia anônimo, autentica e encerra a sessão; lança erro se `useAuth` for usado fora do provider
- **ToastContext (RN-F03):** exibe notificação de sucesso, remove ao fechar, remove automaticamente após o tempo definido
### 7.4 Serviços
- **api (RN-F04):** injeta `Authorization: Bearer <token>` quando há token e não envia o cabeçalho sem token; em respostas 401 e 403 limpa `TOKEN_KEY` e `USER_KEY` e redireciona para `/login`; não redireciona se já estiver em `/login`; mantém a sessão em outros erros (ex.: 500) e propaga a falha; repassa respostas de sucesso sem alteração
- **authService:** login com `fetch` mockado (resposta `ok` devolve token e usuário com e-mail e perfil; resposta 401 rejeita), persiste/recupera/limpa a sessão no `localStorage` (`TOKEN_KEY`, `USER_KEY`), retorna `null` se o usuário armazenado estiver corrompido
- **produtoService:** `GET /produtos`, `GET /produtos/{id}`, `POST /produtos`, `PUT /produtos/{id}`, `DELETE /produtos/{id}` (inativação)
- **cadastroServices:** ciclo CRUD de categorias (`/categorias`) e de fornecedores (`/fornecedores`), conferindo rota e payload de cada chamada
- **movimentacaoService:** `GET /movimentacoes` e `POST /movimentacoes` (`ENTRADA` ou `SAIDA`)
- **compraService:** `calcularTotal` (soma quantidade x preço; zero para lista vazia/indefinida), `GET /compras`, `POST /compras`, `PATCH /compras/{id}/status` (com cabeçalhos extras), e `STATUS_PEDIDO` contendo `RASCUNHO`, `SOLICITADO` e `ENTREGUE` (valores do enum do Spring Boot)
- **dashboardService:** consolida produtos, categorias, pedidos e movimentações (mockados) em cards, críticos, estoque por categoria e movimentação por dia; confere total estocado (22), produtos críticos (> 0) e pedidos pendentes (1)
### 7.5 Páginas
- **Login (RF-F01):** valida obrigatórios antes de enviar; autentica e notifica sucesso; notifica erro com credenciais inválidas
- **Dashboard (RF-F06):** exibe os quatro cards de indicadores; lista produtos críticos; exibe erro e permite tentar novamente
- **Produtos (RF-F03, RN-F01):** lista e destaca estoque crítico; filtra por nome; abre modal de novo produto; pagina o catálogo
- **Categorias:** lista e abre modal; valida nome obrigatório; cria categoria válida
- **Fornecedores:** lista; valida CNPJ e e-mail inválidos; cria fornecedor válido
- **Movimentações (RF-F04, RN-F02):** bloqueia saída superior ao saldo; bloqueia quantidade zero; registra saída válida
- **Compras (RF-F05):** lista pedidos com status (`SOLICITADO`); aprova pedido; solicita pedido em `RASCUNHO`; marca como entregue um pedido `APROVADO`; cancela pedido; monta pedido com item e cria; exige fornecedor e ao menos um item; avisa ao adicionar item sem produto ou quantidade; remove item antes de criar; exibe erro quando a criação ou a mudança de status falha; usa mensagens padrão quando as cargas falham sem mensagem
## 8. Rastreabilidade (requisito → teste)
 
| Requisito | Onde é verificado |
|---|---|
| RF-F01 Autenticação e sessão | `Login.test`, `AuthContext.test`, `authService.test` |
| RF-F02 Rotas protegidas | `ProtectedRoute.test` |
| RF-F03 Catálogo de produtos | `Produtos.test`, `Table.test`, `Pagination.test`, `produtoService.test` |
| RF-F04 Movimentação de estoque | `Movimentacoes.test`, `movimentacaoService.test` |
| RF-F05 Pedidos de compra | `Compras.test`, `compraService.test` |
| RF-F06 Dashboard | `Dashboard.test`, `dashboardService.test` |
| RN-F01 Destaque de estoque crítico | `formatters.test` (`isEstoqueCritico`), `Produtos.test`, `Dashboard.test` |
| RN-F02 Validação prévia de baixa | `validators.test` (`validarBaixaEstoque`), `Movimentacoes.test` |
| RN-F03 Toasts e Spinners | `ToastContext.test`, `BasicComponents.test`, `Table.test` |
| RN-F04 Sessão expirada (interceptor) | `api.test` |
 
## 9. Pontos de atenção
 
- **Telas com menor cobertura:** `Produtos.jsx` (cerca de 47% de statements), `Categorias.jsx` (58%) e `Fornecedores.jsx` (64%). Editar, inativar e remover registros ainda não têm teste. `App.jsx`, `NotFound.jsx` e `AppRoutes.jsx` estão em 0%. São os próximos candidatos para ganhar margem sobre o limiar de branches.
- **`VITE_API_URL` e `api.js`:** as linhas sem cobertura do `api.js` (10 e 15-17) são o bloco que lê a URL base. Esse bloco usa `new Function` para ler `import.meta`, o que não funciona no navegador, então a URL do `.env` pode ser ignorada no build e a base cair no valor padrão. Vale isolar a leitura de `import.meta.env` em um módulo próprio, substituído por um stub nos testes.
- **Status de pedidos:** a tela de Compras usa `RASCUNHO`, `SOLICITADO`, `APROVADO`, `ENTREGUE` e `CANCELADO`. As transições (rascunho → solicitado → aprovado → entregue) devem ser confirmadas com o `StatusPedido` do back-end, que tem regras próprias (por exemplo, entregar exige usuário com perfil `COMPRADOR`).
- **Credenciais divergentes:** os testes usam `admin@estoque.com` / `admin123` (Login) e `admin@gestao.com` / `123456` (`AuthContext`, `authService`). Como são mocks, não quebram nada, mas convém unificar.
- **Asserções fracas:** alguns testes só conferem que o serviço foi chamado (`criarPedido`) sem validar o payload completo.
- **Warnings do React Router:** os avisos de "Future Flag" (v7) aparecem no console, mas não afetam o resultado. Para silenciar, passe `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` ao `MemoryRouter` em `test-utils.jsx`, `ProtectedRoute.test.jsx`, `AuthContext.test.jsx` e `Layout.test.jsx`.
- **Windows (`EBUSY` no `npm ci`):** geralmente é processo Node, editor ou antivírus segurando `node_modules`. Encerre os processos, apague a pasta e rode `npm ci` de novo.
- **Mock do Recharts:** se o `Dashboard` passar a importar outro componente do `recharts`, adicione a exportação correspondente em `src/__mocks__/rechartsMock.jsx`.
 