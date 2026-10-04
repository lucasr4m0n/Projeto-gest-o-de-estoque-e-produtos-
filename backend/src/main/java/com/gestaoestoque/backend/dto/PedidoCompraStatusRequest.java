package com.gestaoestoque.backend.dto;

import com.gestaoestoque.backend.enums.StatusPedido;
import jakarta.validation.constraints.NotNull;

public record PedidoCompraStatusRequest(
        @NotNull(message = "O status e obrigatorio")
        StatusPedido status
) {}
