package com.gestaoestoque.backend.dto;

import com.gestaoestoque.backend.enums.TipoMovimentacao;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MovimentacaoRequest(
        @NotNull(message = "O produto e obrigatorio")
        Long produtoId,

        @NotNull(message = "O tipo da movimentacao e obrigatorio")
        TipoMovimentacao tipoMovimentacao,

        @NotNull(message = "A quantidade e obrigatoria")
        @Min(value = 1, message = "A quantidade deve ser maior que zero")
        Integer quantidade,

        @Size(max = 255, message = "A observacao deve ter no maximo 255 caracteres")
        String observacao
) {}
