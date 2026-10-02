package com.gestaoestoque.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProdutoRequest(
        @Size(max = 50, message = "O codigo de barras deve ter no maximo 50 caracteres")
        String codigoBarras,

        @NotBlank(message = "O nome do produto e obrigatorio")
        @Size(max = 100, message = "O nome deve ter no maximo 100 caracteres")
        String nome,

        String descricao,

        @NotNull(message = "A categoria e obrigatoria")
        Long categoriaId,

        @NotNull(message = "O preco de custo e obrigatorio")
        @DecimalMin(value = "0.00", message = "O preco de custo nao pode ser negativo")
        BigDecimal precoCusto,

        @NotNull(message = "O estoque minimo e obrigatorio")
        @Min(value = 0, message = "O estoque minimo nao pode ser negativo")
        Integer estoqueMinimo,

        @NotBlank(message = "A unidade de medida e obrigatoria")
        @Size(max = 10, message = "A unidade de medida deve ter no maximo 10 caracteres")
        String unidadeMedida
) {}
