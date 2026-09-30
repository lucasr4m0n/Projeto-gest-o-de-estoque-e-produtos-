package com.gestaoestoque.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_barras", unique = true, length = 50)
    private String codigoBarras;


    @Column(nullable = false, length = 100)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "preco_custo", nullable = false, precision = 12, scale = 2)
    private BigDecimal precoCusto;

    @Builder.Default
    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque = 0;

    @Builder.Default
    @Column(name = "estoque_minimo", nullable = false)
    private Integer estoqueMinimo = 5;

    @Builder.Default
    @Column(name = "unidade_medida", nullable = false, length = 10)
    private String unidadeMedida = "UN";

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;
}