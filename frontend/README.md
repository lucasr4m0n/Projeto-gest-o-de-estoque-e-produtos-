# Sistema de Gestão de Estoque e Compras — Frontend (ReactJS)
 
Interface web do sistema de **Gestão de Estoque e Compras (Supply Chain)**, desenvolvida em **ReactJS + Vite**. Consome a API REST em Java (Spring Boot) e cobre telas, regras de UX, autenticação com JWT e uma suíte de testes unitários com cobertura acima de 80%.
 
- **Back-end:** _link do repositório do back-end_
- **Documentação dos testes:** [`docs/TESTES.md`](docs/TESTES.md)
---
 
## 1. Stack técnica
 
| Camada | Tecnologia |
|---|---|
| Biblioteca de UI | ReactJS 18 |
| Build / dev server | Vite 5 |
| Estilização | Tailwind CSS 3 |
| Roteamento | React Router DOM 6 |
| Cliente HTTP | Axios 1 (com interceptors) |
| Gráficos | Recharts 2 |
| Testes | Jest 29 + React Testing Library |
| Estado global | Context API (autenticação e notificações) |
 
> **Decisão de projeto:** a especificação permitia *Tailwind CSS* **ou** *Material UI*. Optou-se por **Tailwind CSS** pela ausência de dependência de biblioteca de componentes e integração direta com o Vite. A troca por MUI, se necessária, afeta apenas a camada de componentes em `src/components/`.
 
---
 
## 2. Pré-requisitos
 
- **Node.js** ≥ 18
- **npm** ≥ 9
- **Back-end em execução** (local ou publicado). Sem ele, as telas de login e de dados não funcionam.
---
 
## 3. Execução local
 
```bash
# 1. Instalar as dependências (usa as versões exatas do package-lock.json)
npm ci
 
# 2. Configurar a URL da API
cp .env.example .env
 
# 3. Iniciar o ambiente de desenvolvimento (http://localhost:5173)
npm run dev
 
# 4. Gerar build de produção
npm run build
 
# 5. Pré-visualizar o build
npm run preview
```
 
### Variáveis de ambiente
 
| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API (incluindo `/api`) | `http://localhost:8090/api` |
 
- Se a variável não for definida, o front usa `http://localhost:8090/api`.
- O Vite lê as variáveis `VITE_*` **na hora do build**. Ao mudar o valor em produção, é preciso gerar um novo deploy.
- Nunca versionar o arquivo `.env`; apenas o `.env.example`.
### Acesso ao sistema
 
Os usuários e perfis (`ADMIN`, `OPERADOR`, `COMPRADOR`) são definidos pelo back-end. Consulte o README do back-end para as credenciais iniciais.
 
---
 
## 4. Testes
 
```bash
# Executar a suíte
npm test
 
# Executar com relatório de cobertura (falha se ficar abaixo de 70%)
npm run test:coverage
```
 
| Indicador | Resultado atual | Mínimo exigido |
|---|---|---|
| Suítes / testes | 25 / 109 (todos passando) | — |
| Statements | 82,53% | 70% |
| Branches | 71,49% | 70% |
| Functions | 77,35% | 70% |
| Lines | 82,69% | 70% |
 
O relatório HTML é gerado em `coverage/lcov-report/index.html`. O limiar está fixado em `jest.config.cjs` (`coverageThreshold`), atendendo ao requisito RNF-F02.
 
Escopo dos testes:
 
- **Regras puras:** validadores (e-mail, CNPJ com dígitos verificadores, RN-F02) e formatadores.
- **Serviços:** CRUDs, autenticação, cálculo de pedidos, consolidação do dashboard e interceptors do Axios (RN-F04), com a camada HTTP mockada.
- **Componentes:** `Button`, `Input`, `Select`, `Table`, `Modal`, `Pagination`, `Badge`, `Spinner`, `ProtectedRoute`, `Layout`.
- **Contextos e hooks:** `AuthContext`, `ToastContext`, `useFetch`.
- **Páginas e formulários:** Login, Dashboard, Produtos, Categorias, Fornecedores, Movimentações e Compras.
Detalhes de estratégia, cenários cobertos e rastreabilidade de requisitos em [`docs/TESTES.md`](docs/TESTES.md).
 
---
 
## 5. Arquitetura e estrutura de pastas
 
```
frontend/
├── docs/
│   └── TESTES.md          # Documentação dos testes
├── public/
├── src/
│   ├── __mocks__/         # Mocks de infraestrutura de teste (Recharts, arquivos estáticos)
│   ├── assets/            # Imagens, ícones e estilos globais
│   ├── components/        # Componentes reutilizáveis (Button, Modal, Table, ProtectedRoute, ...)
│   ├── contexts/          # Contextos globais (AuthContext, ToastContext)
│   ├── hooks/             # Custom hooks (useAuth, useToast, useFetch)
│   ├── pages/             # Telas (Login, Dashboard, Produtos, ...)
│   ├── routes/            # Configuração de rotas (AppRoutes.jsx)
│   ├── services/          # Comunicação com a API
│   │   ├── api.js                 # Instância Axios + interceptors
│   │   ├── authService.js
│   │   ├── produtoService.js
│   │   ├── categoriaService.js
│   │   ├── fornecedorService.js
│   │   ├── movimentacaoService.js
│   │   ├── compraService.js
│   │   ├── dashboardService.js
│   │   └── storageKeys.js         # Chaves do localStorage
│   ├── utils/             # Validadores e formatadores
│   ├── App.jsx
│   ├── main.jsx
│   ├── setupTests.js      # Configuração global do Jest
│   └── test-utils.jsx     # renderWithProviders (Router + Toast + Auth)
├── index.html
├── jest.config.cjs
├── tailwind.config.js
├── vite.config.js
└── package.json
```
 
Os testes ficam ao lado do código que testam (`Componente.test.jsx`).
 
### Diagrama de camadas
 
```
 Pages (telas)
     │  consomem
     ▼
 Hooks (useFetch, useAuth, useToast)  ◄── Contexts (Auth, Toast)
     │
     ▼
 Services (produtoService, compraService, ...)
     │
     ▼
 api.js (Axios + interceptors)
     │
     ▼
 Back-end REST (Spring Boot)
```
 
---
 
## 6. Autenticação e sessão (Context API)
 
- **Persistência:** o token JWT e os dados do usuário ficam no `localStorage` (chaves definidas em `src/services/storageKeys.js`).
- **Estado do usuário:** o `AuthContext` mantém `nome`, `email` e `perfil`, restaurando a sessão ao carregar a aplicação.
- **Proteção de rotas:** o `ProtectedRoute` bloqueia o acesso a páginas privadas sem token válido e suporta restrição por perfil.
## 7. Cliente HTTP e interceptors (Axios)
 
Centralizado em `src/services/api.js`:
 
- **Interceptor de requisição:** injeta `Authorization: Bearer <TOKEN_JWT>` nas chamadas quando há token.
- **Interceptor de resposta:** captura `401 Unauthorized` / `403 Forbidden`, limpa a sessão e redireciona para `/login` (RN-F04).
---
 
## 8. Mapa de rotas
 
| Rota | Página | Acesso |
|---|---|---|
| `/login` | Login | Pública |
| `/dashboard` | Dashboard | Protegida |
| `/produtos` | Catálogo de Produtos | Protegida |
| `/categorias` | Categorias | Protegida |
| `/fornecedores` | Fornecedores | Protegida |
| `/movimentacoes` | Movimentação de Estoque | Protegida |
| `/compras` | Pedidos de Compra | Protegida |
| `*` | NotFound (404) | — |
 
---
 
## 9. Matriz de atendimento aos requisitos
 
### Funcionais (RF-FRONT)
 
| Código | Requisito | Implementação |
|---|---|---|
| RF-F01 | Autenticação & Sessão | `pages/Login`, `AuthContext`, token em `localStorage` |
| RF-F02 | Rotas protegidas | `components/ProtectedRoute` |
| RF-F03 | Catálogo de produtos | `pages/Produtos` (busca/filtro, paginação, badge crítico, editar/inativar) |
| RF-F04 | Formulário de movimentação | `pages/Movimentacoes` (tipo, quantidade, validações) |
| RF-F05 | Gestão de pedidos | `pages/Compras` (itens dinâmicos e transição de status) |
| RF-F06 | Dashboard de indicadores | `pages/Dashboard` (cards + gráficos Recharts) |
 
### Regras de interface (RN-FRONT)
 
| Código | Regra | Implementação |
|---|---|---|
| RN-F01 | Destaque de estoque crítico | `Badge` vermelho quando saldo ≤ mínimo (`isEstoqueCritico`) |
| RN-F02 | Validação prévia de baixa | `validarBaixaEstoque` (bloqueia ≤ 0 e > saldo) |
| RN-F03 | Feedback (Toasts & Spinners) | `ToastContext` e `Spinner` |
| RN-F04 | Tratamento de sessão expirada | Interceptor de resposta em `api.js` |
 
### Não funcionais (RNF-FRONT)
 
| Código | Categoria | Implementação |
|---|---|---|
| RNF-F01 | Responsividade | Layout adaptável (Tailwind) e tabelas com rolagem horizontal |
| RNF-F02 | Cobertura de testes ≥ 70% | Jest + RTL com `coverageThreshold` |
| RNF-F03 | Organização | Estrutura modular por responsabilidade |
 
---
 
## 10. Scripts disponíveis
 
| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualização do build |
| `npm test` | Executa os testes |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run lint` | Análise estática (ESLint) |
 
---
 
## 11. Integração com o back-end
 
Rotas consumidas (relativas a `VITE_API_URL`):
 
| Recurso | Rotas |
|---|---|
| Produtos | `/produtos`, `/produtos/{id}` |
| Categorias | `/categorias`, `/categorias/{id}` |
| Fornecedores | `/fornecedores`, `/fornecedores/{id}` |
| Movimentações | `/movimentacoes` |
| Pedidos de compra | `/compras`, `/compras/{id}/status` |
 
Observações:
 
- A atualização de status de um pedido envia o cabeçalho `X-Usuario-Id` com o id do usuário logado, exigido pelo back-end.
- Os status de pedido usados pela tela são `RASCUNHO`, `SOLICITADO`, `APROVADO`, `ENTREGUE` e `CANCELADO`.
- O back-end precisa liberar no **CORS** a origem do front (em desenvolvimento, `http://localhost:5173`; em produção, o domínio da Vercel).
---
 
## 12. Deploy
 
O front é publicado na **Vercel** e o back-end no **Render**, em repositórios separados.
 
### Vercel (front-end)
 
1. Importar o repositório e manter o preset **Vite** (comando `npm run build`, saída `dist`).
2. Em *Environment Variables*, definir `VITE_API_URL` com a URL do back-end no Render, por exemplo `https://seu-servico.onrender.com/api`.
3. Manter o arquivo `vercel.json` na raiz, para que o recarregamento de páginas como `/produtos` não retorne 404:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
 
### Render (back-end)
 
- Adicionar a URL da Vercel às origens permitidas no CORS do back-end.
- Em planos gratuitos, o serviço pode "dormir" por inatividade, e a primeira requisição leva mais tempo. As telas exibem o `Spinner` durante o carregamento.
---
 
## 13. Checklist antes do push ou PR
 
```bash
npm ci
npm run lint
npm run test:coverage
npm run build
```
 
### Problemas comuns
 
- **`EBUSY` no `npm ci` (Windows):** um processo Node, o editor ou o antivírus está segurando `node_modules`. Encerre os processos, apague a pasta `node_modules` e rode `npm ci` de novo.
- **Chamadas indo para `localhost` em produção:** `VITE_API_URL` não foi definida no ambiente de build. Defina e faça um novo deploy.
- **Erro de CORS no navegador:** o back-end não liberou a origem do front. Veja a seção 11.
 