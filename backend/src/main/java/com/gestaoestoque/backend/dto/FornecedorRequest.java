package com.gestaoestoque.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FornecedorRequest(
        @NotBlank(message = "A razao social e obrigatoria")
        @Size(max = 120, message = "A razao social deve ter no maximo 120 caracteres")
        String razaoSocial,

        @NotBlank(message = "O CNPJ e obrigatorio")
        @Pattern(regexp = "\\d{14}", message = "O CNPJ deve conter 14 digitos")
        String cnpj,

        @Email(message = "E-mail invalido")
        @Size(max = 120, message = "O e-mail deve ter no maximo 120 caracteres")
        String email,

        @Size(max = 20, message = "O telefone deve ter no maximo 20 caracteres")
        String telefone
) {}
