# Sistema de Gestão de Estoque e Compras — Frontend (ReactJS)

Interface web do sistema de **Gestão de Estoque e Compras (Supply Chain)**, desenvolvida em **ReactJS + Vite**. O projeto cobre o escopo exclusivo de frontend descrito na especificação: telas, regras de UX, integração preparada com a API Java (Spring Boot) e suíte de testes unitários com meta de cobertura ≥ 70%.

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

---

## 3. Execução local (passo a passo)

```bash
# 1. Instalar as dependências
npm install

# 2. Configurar a URL da API (opcional na Fase 1 de mocks)
cp .env.example .env

# 3. Iniciar o ambiente de desenvolvimento (http://localhost:5173)
npm run dev

# 4. Gerar build de produção
npm run build

# 5. Pré-visualizar o build
npm run preview
```

### Credenciais de teste (dados mockados)

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | `admin@estoque.com` | `admin123` |
| OPERADOR | `operador@estoque.com` | `operador123` |

---

## 4. Testes unitários

```bash
# Executar a suíte
npm test

# Executar com relatório de cobertura
npm run test:coverage
```

O relatório HTML é gerado em `coverage/lcov-report/index.html`. O limiar de cobertura (statements, branches, functions, lines) está fixado em **70%** em `jest.config.cjs` (`coverageThreshold`), atendendo ao requisito RNF-F02.

Escopo dos testes:

- **Regras puras** — validadores (e-mail, CNPJ com dígitos verificadores, RN-F02) e formatadores.
- **Serviços** — CRUDs, autenticação e regra transacional de estoque.
- **Componentes** — `Button`, `Input`, `Select`, `Table`, `Modal`, `Badge`, `Spinner`, `ProtectedRoute`, `Layout`.
- **Contextos e hooks** — `AuthContext`, `ToastContext`, `useFetch`.
- **Páginas / formulários** — Login, Movimentações (RN-F02), Produtos (RN-F01), Fornecedores, Categorias, Compras e Dashboard.

---

## 5. Arquitetura e estrutura de pastas

Estrutura modular por responsabilidade, conforme a Especificação Técnica:

```
frontend/
├── public/
├── src/
│   ├── assets/            # Imagens, ícones e estilos globais
│   ├── components/        # Componentes reutilizáveis (Button, Modal, Table, ...)
│   │   └── ProtectedRoute.jsx
│   ├── contexts/          # Contextos globais (AuthContext, ToastContext)
│   ├── hooks/             # Custom hooks (useAuth, useToast, useFetch)
│   ├── mocks/             # Dados fictícios em JSON (Fase 1 — Semanas 1 e 2)
│   ├── pages/             # Telas (Login, Dashboard, Produtos, ...)
│   ├── services/          # Comunicação com a API (Axios + interceptors)
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── produtoService.js
│   ├── routes/            # Configuração de rotas (AppRoutes.jsx)
│   ├── utils/             # Validadores e formatadores
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── jest.config.cjs
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### Diagrama de camadas

```
 Pages (telas)
     │  consomem
     ▼
 Hooks (useFetch, useAuth, useToast)  ◄── Contexts (Auth, Toast)
     │
     ▼
 Services (produtoService, compraService, ...)
     │  Fase 1: mockAdapter (JSON + atraso simulado)
     │  Fase 2: api.js (Axios → Spring Boot)
     ▼
 Backend REST (http://localhost:8080/api)
```

---

## 6. Autenticação e sessão (Context API)

- **Persistência:** o token JWT é armazenado no `localStorage` sob a chave **`@EstoqueApp:token`**; os dados do usuário sob `@EstoqueApp:user`.
- **Estado do usuário:** o `AuthContext` mantém `nome`, `email` e `perfil`, restaurando a sessão ao carregar a aplicação.
- **Proteção de rotas:** o componente `ProtectedRoute` bloqueia o acesso a páginas privadas sem token válido e suporta restrição por perfil.

## 7. Cliente HTTP e interceptors (Axios)

Centralizado em `src/services/api.js` (URL base `http://localhost:8080/api`):

- **Interceptor de requisição:** injeta `Authorization: Bearer <TOKEN_JWT>` em todas as chamadas privadas.
- **Interceptor de resposta:** captura `401 Unauthorized` / `403 Forbidden`, limpa a sessão e redireciona para `/login` (RN-F04).

## 8. Estratégia de mocks (Fase 1)

Nas Semanas 1 e 2, os dados vêm de arquivos JSON em `src/mocks/`. O adaptador `src/services/mockAdapter.js` simula um atraso de rede (300–500 ms) e resolve Promessas com cópias dos dados. Na **Semana 5**, cada função de serviço passa a usar a instância real do Axios — sem alterar as páginas.

---

## 9. Mapa de rotas

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

## 10. Matriz de atendimento aos requisitos

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
| RNF-F03 | Organização & Mocks | Estrutura modular e `src/mocks/` |

---

## 11. Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualização do build |
| `npm test` | Executa os testes |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run lint` | Análise estática (ESLint) |

---

## 12. Integração com o backend (Semana 5)

1. Definir `VITE_API_URL` no arquivo `.env`.
2. Em cada arquivo de `src/services/`, substituir as chamadas ao `mockAdapter` por chamadas via `api` (Axios). Exemplo:

```js
// Fase 1 (mock)
export async function listarProdutos() {
  return mockResponse(produtos);
}

// Fase 2 (API real)
export async function listarProdutos() {
  const { data } = await api.get('/produtos');
  return data;
}
```

3. As páginas e componentes não requerem alteração, pois consomem apenas a interface dos serviços.

---

## 13. Status da entrega e revisão técnica

A versão deste pacote foi revisada contra o Plano de Execução, a Especificação Técnica e a Especificação de Requisitos do Frontend. O detalhamento de conformidade, ajustes aplicados e pontos dependentes da equipe/backend está em [`docs/REVISAO_TECNICA.md`](docs/REVISAO_TECNICA.md).

> **Importante:** a aplicação permanece operando com dados mockados. `src/services/api.js` já contém a instância Axios e os interceptors JWT/401/403, porém os documentos recebidos não especificam o contrato completo dos endpoints reais. A troca para a API deve ser feita quando o backend fornecer paths, DTOs e payloads definitivos.

Antes do push/PR, execute:

```bash
npm ci
npm run lint
npm run test:coverage
npm run build
```

