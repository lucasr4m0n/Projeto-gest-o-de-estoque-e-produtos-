package com.gestaoestoque.backend.service;

import com.gestaoestoque.backend.dto.LoginRequest;
import com.gestaoestoque.backend.dto.LoginResponse;
import com.gestaoestoque.backend.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse autenticar(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.senha()
                )
        );

        Usuario usuario = (Usuario) authentication.getPrincipal();
        String jwtToken = jwtService.gerarToken(usuario);

        return new LoginResponse(
                jwtToken,
                "Bearer",
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name()
        );
    }
}