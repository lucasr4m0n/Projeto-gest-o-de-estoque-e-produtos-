-- Criação dos Enums
CREATE TYPE tipo_perfil_enum AS ENUM ('ADMIN', 'OPERADOR', 'COMPRADOR');
CREATE TYPE tipo_movimentacao_enum AS ENUM ('ENTRADA', 'SAIDA');
CREATE TYPE status_pedido_enum AS ENUM ('RASCUNHO', 'SOLICITADO', 'APROVADO', 'CANCELADO', 'ENTREGUE');

-- Tabela de Usuários
CREATE TABLE tb_usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil tipo_perfil_enum NOT NULL DEFAULT 'OPERADOR',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE tb_categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL UNIQUE,
    descricao VARCHAR(255)
);

-- Tabela de Fornecedores
CREATE TABLE tb_fornecedores (
    id BIGSERIAL PRIMARY KEY,
    razao_social VARCHAR(120) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(120),
    telefone VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de Produtos
CREATE TABLE tb_produtos (
    id BIGSERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria_id BIGINT NOT NULL,
    preco_custo NUMERIC(12,2) NOT NULL CHECK (preco_custo >= 0),
    quantidade_estoque INT NOT NULL DEFAULT 0 CHECK (quantidade_estoque >= 0),
    estoque_minimo INT NOT NULL DEFAULT 5 CHECK (estoque_minimo >= 0),
    unidade_medida VARCHAR(10) NOT NULL DEFAULT 'UN',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) REFERENCES tb_categorias(id)
);

-- Tabela de Movimentação de Estoque
CREATE TABLE tb_movimentacao_estoque (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    tipo_movimentacao tipo_movimentacao_enum NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observacao VARCHAR(255),
    CONSTRAINT fk_movimentacao_produto FOREIGN KEY (produto_id) REFERENCES tb_produtos(id),
    CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (usuario_id) REFERENCES tb_usuarios(id)
);

-- Tabela de Pedidos de Compra
CREATE TABLE tb_pedido_compra (
    id BIGSERIAL PRIMARY KEY,
    fornecedor_id BIGINT NOT NULL,
    status status_pedido_enum NOT NULL DEFAULT 'RASCUNHO',
    data_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES tb_fornecedores(id)
);

-- Tabela de Itens do Pedido de Compra
CREATE TABLE tb_items_pedido_compra (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(12,2) NOT NULL CHECK (preco_unitario >= 0),
    CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id) REFERENCES tb_pedido_compra(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES tb_produtos(id)
);

-- Índices para Otimização de Consultas
CREATE INDEX idx_produto_categoria ON tb_produtos(categoria_id);
CREATE INDEX idx_produto_codigo_barras ON tb_produtos(codigo_barras);
CREATE INDEX idx_movimentacao_produto_data ON tb_movimentacao_estoque(produto_id, data_hora DESC);
CREATE INDEX idx_pedido_fornecedor ON tb_pedido_compra(fornecedor_id);
CREATE INDEX idx_pedido_status ON tb_pedido_compra(status);