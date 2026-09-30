package com.gestaoestoque.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_fornecedores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "razao_social", nullable = false, length = 120)
    private String razaoSocial;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(length = 120)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;
}