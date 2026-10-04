-- ============================================================
-- SEED / DADOS FICTÍCIOS
-- Sistema de Gestão de Estoque e Compras
-- PostgreSQL
--
-- ATENÇÃO:
-- O TRUNCATE abaixo apaga os dados atuais dessas tabelas.
-- Remova/comente o bloco TRUNCATE se quiser apenas adicionar dados.
--
-- Usuários de teste:
-- admin@estoque.com     / password
-- operador@estoque.com  / password
-- comprador@estoque.com / password
--
-- O hash abaixo é BCrypt para a senha "password".
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Limpeza opcional para ambiente de desenvolvimento
-- ------------------------------------------------------------
TRUNCATE TABLE
    tb_items_pedido_compra,
    tb_pedido_compra,
    tb_movimentacao_estoque,
    tb_produtos,
    tb_fornecedores,
    tb_categorias,
    tb_usuarios
RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------
-- 2. USUÁRIOS
-- ------------------------------------------------------------
INSERT INTO tb_usuarios
    (id, nome, email, senha_hash, perfil, ativo)
VALUES
    (1, 'Administrador do Sistema', 'admin@estoque.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'ADMIN', TRUE),

    (2, 'João Operador', 'operador@estoque.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'OPERADOR', TRUE),

    (3, 'Mariana Compradora', 'comprador@estoque.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'COMPRADOR', TRUE),

    (4, 'Carlos Comprador Inativo', 'comprador.inativo@estoque.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'COMPRADOR', FALSE);

-- ------------------------------------------------------------
-- 3. CATEGORIAS
-- ------------------------------------------------------------
INSERT INTO tb_categorias
    (id, nome, descricao)
VALUES
    (1, 'Informática', 'Computadores, periféricos e acessórios'),
    (2, 'Escritório', 'Materiais e equipamentos para escritório'),
    (3, 'Eletrônicos', 'Equipamentos eletrônicos em geral'),
    (4, 'Limpeza', 'Produtos e materiais de limpeza'),
    (5, 'Mobiliário', 'Móveis e equipamentos para ambientes');

-- ------------------------------------------------------------
-- 4. FORNECEDORES
-- ------------------------------------------------------------
INSERT INTO tb_fornecedores
    (id, razao_social, cnpj, email, telefone, ativo)
VALUES
    (1, 'Tech Solutions Comércio Ltda', '12345678000101',
     'contato@techsolutions.com.br', '51999990001', TRUE),

    (2, 'Office Mais Distribuidora Ltda', '23456789000102',
     'vendas@officemais.com.br', '51333340002', TRUE),

    (3, 'Eletrônica Sul Comércio Ltda', '34567890000103',
     'comercial@eletronicasul.com.br', '51333350003', TRUE),

    (4, 'Limpa Fácil Produtos Ltda', '45678901000104',
     'contato@limpafacil.com.br', '51333360004', TRUE),

    (5, 'Móveis Corporativos Brasil Ltda', '56789012000105',
     'vendas@moveiscorporativos.com.br', '51333370005', TRUE),

    (6, 'Fornecedor Inativo Ltda', '67890123000106',
     'contato@fornecedorinativo.com.br', '51333380006', FALSE);

-- ------------------------------------------------------------
-- 5. PRODUTOS
-- ------------------------------------------------------------
INSERT INTO tb_produtos
    (id, codigo_barras, nome, descricao, categoria_id,
     preco_custo, quantidade_estoque, estoque_minimo,
     unidade_medida, ativo)
VALUES
    (1, '7891000000011', 'Notebook Pro 14',
     'Notebook corporativo 14 polegadas', 1,
     3500.00, 12, 5, 'UN', TRUE),

    (2, '7891000000028', 'Mouse Óptico USB',
     'Mouse óptico USB com 3 botões', 1,
     45.90, 35, 10, 'UN', TRUE),

    (3, '7891000000035', 'Teclado USB ABNT2',
     'Teclado USB padrão ABNT2', 1,
     89.90, 8, 10, 'UN', TRUE),

    (4, '7891000000042', 'Monitor LED 24',
     'Monitor LED Full HD 24 polegadas', 3,
     780.00, 6, 5, 'UN', TRUE),

    (5, '7891000000059', 'Cabo HDMI 2m',
     'Cabo HDMI de alta velocidade', 3,
     35.50, 40, 15, 'UN', TRUE),

    (6, '7891000000066', 'Impressora Multifuncional',
     'Impressora multifuncional laser', 1,
     1250.00, 3, 5, 'UN', TRUE),

    (7, '7891000000073', 'Papel A4 500 folhas',
     'Papel sulfite A4 branco', 2,
     28.90, 18, 10, 'PCT', TRUE),

    (8, '7891000000080', 'Caneta Esferográfica Azul',
     'Caneta esferográfica ponta média', 2,
     2.50, 120, 30, 'UN', TRUE),

    (9, '7891000000097', 'Caderno Executivo',
     'Caderno capa dura 100 folhas', 2,
     24.90, 22, 10, 'UN', TRUE),

    (10, '7891000000103', 'Álcool Líquido 70%',
     'Álcool para limpeza de superfícies', 4,
     12.90, 25, 10, 'UN', TRUE),

    (11, '7891000000110', 'Papel Toalha',
     'Papel toalha interfolhado', 4,
     18.50, 7, 10, 'PCT', TRUE),

    (12, '7891000000127', 'Cadeira de Escritório',
     'Cadeira ergonômica com apoio de braço', 5,
     650.00, 4, 3, 'UN', TRUE),

    (13, '7891000000134', 'Mesa de Escritório',
     'Mesa de escritório 120cm', 5,
     480.00, 5, 3, 'UN', TRUE),

    (14, '7891000000141', 'Webcam Full HD',
     'Webcam USB Full HD com microfone', 3,
     210.00, 2, 5, 'UN', TRUE),

    (15, '7891000000158', 'Headset USB',
     'Headset USB para atendimento e reuniões', 1,
     160.00, 14, 5, 'UN', TRUE),

    (16, '7891000000165', 'Produto Descontinuado',
     'Produto fictício utilizado para testar inativação', 2,
     50.00, 0, 5, 'UN', FALSE);

-- ------------------------------------------------------------
-- 6. MOVIMENTAÇÕES DE ESTOQUE
--
-- O histórico abaixo representa movimentações fictícias.
-- As quantidades atuais dos produtos acima já foram preparadas
-- para permitir testes independentes.
-- ------------------------------------------------------------
INSERT INTO tb_movimentacao_estoque
    (id, produto_id, usuario_id, tipo_movimentacao,
     quantidade, data_hora, observacao)
VALUES
    (1, 1, 3, 'ENTRADA', 15,
     '2026-09-20 09:00:00-03',
     'Entrada referente à compra de notebooks'),

    (2, 1, 2, 'SAIDA', 3,
     '2026-09-21 10:30:00-03',
     'Entrega de equipamento para colaborador'),

    (3, 2, 3, 'ENTRADA', 50,
     '2026-09-20 09:15:00-03',
     'Reposição de mouses'),

    (4, 2, 2, 'SAIDA', 15,
     '2026-09-22 14:00:00-03',
     'Distribuição para setor administrativo'),

    (5, 3, 3, 'ENTRADA', 20,
     '2026-09-20 09:20:00-03',
     'Entrada de teclados'),

    (6, 3, 2, 'SAIDA', 12,
     '2026-09-23 08:45:00-03',
     'Distribuição para novos postos de trabalho'),

    (7, 4, 3, 'ENTRADA', 10,
     '2026-09-21 11:00:00-03',
     'Entrada de monitores'),

    (8, 4, 2, 'SAIDA', 4,
     '2026-09-24 15:20:00-03',
     'Instalação em estações de trabalho'),

    (9, 7, 3, 'ENTRADA', 30,
     '2026-09-22 09:00:00-03',
     'Reposição de papel A4'),

    (10, 7, 2, 'SAIDA', 12,
     '2026-09-25 16:00:00-03',
     'Consumo do setor administrativo'),

    (11, 11, 3, 'ENTRADA', 15,
     '2026-09-23 09:30:00-03',
     'Reposição de papel toalha'),

    (12, 11, 2, 'SAIDA', 8,
     '2026-09-26 10:00:00-03',
     'Distribuição para os setores'),

    (13, 14, 3, 'ENTRADA', 5,
     '2026-09-24 13:00:00-03',
     'Entrada de webcams'),

    (14, 2, 2, 'SAIDA', 5,
     '2026-09-27 11:00:00-03',
     'Atendimento de solicitação interna');

-- ------------------------------------------------------------
-- 7. PEDIDOS DE COMPRA
-- ------------------------------------------------------------
INSERT INTO tb_pedido_compra
    (id, fornecedor_id, status, data_pedido)
VALUES
    (1, 1, 'RASCUNHO', '2026-09-26 09:00:00-03'),
    (2, 2, 'SOLICITADO', '2026-09-26 10:00:00-03'),
    (3, 3, 'APROVADO', '2026-09-27 09:00:00-03'),
    (4, 4, 'ENTREGUE', '2026-09-20 08:00:00-03'),
    (5, 5, 'CANCELADO', '2026-09-21 14:00:00-03'),
    (6, 1, 'ENTREGUE', '2026-09-22 08:30:00-03');

-- ------------------------------------------------------------
-- 8. ITENS DOS PEDIDOS
-- ------------------------------------------------------------
INSERT INTO tb_items_pedido_compra
    (id, pedido_id, produto_id, quantidade, preco_unitario)
VALUES
    -- Pedido 1 - RASCUNHO
    (1, 1, 1, 5, 3400.00),
    (2, 1, 2, 20, 43.50),

    -- Pedido 2 - SOLICITADO
    (3, 2, 7, 50, 27.90),
    (4, 2, 8, 100, 2.20),
    (5, 2, 9, 30, 22.50),

    -- Pedido 3 - APROVADO
    (6, 3, 4, 8, 750.00),
    (7, 3, 14, 10, 195.00),

    -- Pedido 4 - ENTREGUE
    (8, 4, 10, 20, 11.90),
    (9, 4, 11, 15, 17.50),

    -- Pedido 5 - CANCELADO
    (10, 5, 12, 5, 620.00),
    (11, 5, 13, 5, 460.00),

    -- Pedido 6 - ENTREGUE
    (12, 6, 3, 10, 85.00),
    (13, 6, 5, 25, 32.00),
    (14, 6, 15, 15, 150.00);

-- ------------------------------------------------------------
-- 9. Ajuste das sequences
-- ------------------------------------------------------------
SELECT setval('tb_usuarios_id_seq',
              (SELECT MAX(id) FROM tb_usuarios));

SELECT setval('tb_categorias_id_seq',
              (SELECT MAX(id) FROM tb_categorias));

SELECT setval('tb_fornecedores_id_seq',
              (SELECT MAX(id) FROM tb_fornecedores));

SELECT setval('tb_produtos_id_seq',
              (SELECT MAX(id) FROM tb_produtos));

SELECT setval('tb_movimentacao_estoque_id_seq',
              (SELECT MAX(id) FROM tb_movimentacao_estoque));

SELECT setval('tb_pedido_compra_id_seq',
              (SELECT MAX(id) FROM tb_pedido_compra));

SELECT setval('tb_items_pedido_compra_id_seq',
              (SELECT MAX(id) FROM tb_items_pedido_compra));

COMMIT;

-- ============================================================
-- CONSULTAS ÚTEIS PARA CONFERÊNCIA
-- ============================================================

-- Produtos abaixo/no estoque mínimo:
-- SELECT id, nome, quantidade_estoque, estoque_minimo
-- FROM tb_produtos
-- WHERE quantidade_estoque <= estoque_minimo
-- ORDER BY quantidade_estoque;

-- Histórico de movimentações:
-- SELECT m.id, p.nome, u.nome AS usuario,
--        m.tipo_movimentacao, m.quantidade,
--        m.data_hora, m.observacao
-- FROM tb_movimentacao_estoque m
-- JOIN tb_produtos p ON p.id = m.produto_id
-- JOIN tb_usuarios u ON u.id = m.usuario_id
-- ORDER BY m.data_hora DESC;

-- Pedidos com itens:
-- SELECT pc.id, f.razao_social, pc.status,
--        p.nome, i.quantidade, i.preco_unitario
-- FROM tb_pedido_compra pc
-- JOIN tb_fornecedores f ON f.id = pc.fornecedor_id
-- JOIN tb_items_pedido_compra i ON i.pedido_id = pc.id
-- JOIN tb_produtos p ON p.id = i.produto_id
-- ORDER BY pc.id, i.id;
