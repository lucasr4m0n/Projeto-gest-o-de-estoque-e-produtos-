package com.gestaoestoque.backend.dto;

import com.gestaoestoque.backend.enums.TipoMovimentacao;

import java.time.OffsetDateTime;

public record MovimentacaoResponse(
        Long id,
        Long produtoId,
        String produtoNome,
        Long usuarioId,
        String usuarioNome,
        TipoMovimentacao tipoMovimentacao,
        Integer quantidade,
        OffsetDateTime dataHora,
        String observacao
) {}
