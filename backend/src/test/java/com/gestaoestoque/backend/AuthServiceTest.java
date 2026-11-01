package com.gestaoestoque.backend;

import com.gestaoestoque.backend.dto.LoginRequest;
import com.gestaoestoque.backend.dto.LoginResponse;
import com.gestaoestoque.backend.enums.TipoPerfil;
import com.gestaoestoque.backend.model.Usuario;
import com.gestaoestoque.backend.service.AuthService;
import com.gestaoestoque.backend.service.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;

    @InjectMocks private AuthService service;

    @Test
    void deveAutenticarEGerarToken() {
        Usuario usuario = Usuario.builder()
                .id(1L).nome("Lucas").email("lucas@teste.com")
                .perfil(TipoPerfil.COMPRADOR).ativo(true).build();

        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken(usuario, null));
        when(jwtService.gerarToken(usuario)).thenReturn("token-abc");

        LoginResponse response = service.autenticar(new LoginRequest("lucas@teste.com", "123456"));

        assertEquals("token-abc", response.token());
        assertEquals("Bearer", response.tipo());
        assertEquals("Lucas", response.nome());
        assertEquals("lucas@teste.com", response.email());
        assertEquals("COMPRADOR", response.perfil());
    }

    @Test
    void devePropagarExcecaoQuandoCredenciaisInvalidas() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("senha errada"));

        LoginRequest request = new LoginRequest("lucas@teste.com", "errada");

        assertThrows(BadCredentialsException.class, () -> service.autenticar(request));
        verify(jwtService, never()).gerarToken(any());
    }
}