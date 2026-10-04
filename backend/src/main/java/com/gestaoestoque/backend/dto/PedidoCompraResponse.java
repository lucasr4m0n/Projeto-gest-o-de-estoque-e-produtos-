package com.gestaoestoque.backend.dto;

import com.gestaoestoque.backend.enums.StatusPedido;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record PedidoCompraResponse(
        Long id,
        Long fornecedorId,
        String fornecedorNome,
        StatusPedido status,
        OffsetDateTime dataPedido,
        List<ItemPedidoResponse> itens,
        BigDecimal total
) {}
