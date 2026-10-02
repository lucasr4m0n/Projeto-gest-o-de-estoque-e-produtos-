package com.gestaoestoque.backend.dto;

import java.math.BigDecimal;

public record ProdutoResponse(
        Long id,
        String codigoBarras,
        String nome,
        String descricao,
        Long categoriaId,
        String categoriaNome,
        BigDecimal precoCusto,
        Integer quantidadeEstoque,
        Integer estoqueMinimo,
        String unidadeMedida,
        Boolean ativo
) {}
