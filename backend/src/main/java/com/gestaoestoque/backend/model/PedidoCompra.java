package com.gestaoestoque.backend.model;

import com.gestaoestoque.backend.enums.StatusPedido;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name =  "tb_pedido_compra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class PedidoCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status = StatusPedido.RASCUNHO;

    @Column(name = "data_pedido", insertable = false, updatable = false)
    private OffsetDateTime dataPedido;

}
