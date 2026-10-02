package com.gestaoestoque.backend.dto;

public record FornecedorResponse(Long id, String razaoSocial, String cnpj, String email, String telefone, Boolean ativo) {}
