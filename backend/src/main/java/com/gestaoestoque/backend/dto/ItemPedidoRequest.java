package com.gestaoestoque.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ItemPedidoRequest(
        @NotNull(message = "O produto e obrigatorio")
        Long produtoId,

        @NotNull(message = "A quantidade e obrigatoria")
        @Min(value = 1, message = "A quantidade deve ser maior que zero")
        Integer quantidade,

        @NotNull(message = "O preco unitario e obrigatorio")
        @DecimalMin(value = "0.00", message = "O preco unitario nao pode ser negativo")
        BigDecimal precoUnitario
) {}
