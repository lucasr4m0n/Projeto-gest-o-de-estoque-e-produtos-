package com.gestaoestoque.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "O nome da categoria e obrigatorio")
        @Size(max = 60, message = "O nome da categoria deve ter no maximo 60 caracteres")
        String nome,

        @Size(max = 255, message = "A descricao deve ter no maximo 255 caracteres")
        String descricao
) {}
