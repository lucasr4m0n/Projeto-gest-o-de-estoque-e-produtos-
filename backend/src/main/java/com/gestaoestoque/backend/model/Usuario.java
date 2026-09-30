package com.gestaoestoque.backend.model;

import com.gestaoestoque.backend.enums.TipoPerfil;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoPerfil perfil = TipoPerfil.OPERADOR;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;

}
