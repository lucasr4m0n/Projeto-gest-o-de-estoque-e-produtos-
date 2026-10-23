package com.gestaoestoque.backend.dto;

public record LoginResponse(
        String token,
        String tipo,
        String nome,
        String email,
        String perfil
) {}