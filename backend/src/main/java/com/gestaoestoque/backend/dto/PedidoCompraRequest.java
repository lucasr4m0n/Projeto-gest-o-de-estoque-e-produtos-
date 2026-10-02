package com.gestaoestoque.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PedidoCompraRequest(
        @NotNull(message = "O fornecedor e obrigatorio")
        Long fornecedorId,

        @NotEmpty(message = "O pedido deve conter ao menos um item")
        List<@Valid ItemPedidoRequest> itens
) {}
