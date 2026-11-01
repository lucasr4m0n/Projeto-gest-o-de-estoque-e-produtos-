package com.gestaoestoque.backend;

import com.gestaoestoque.backend.model.Usuario;
import com.gestaoestoque.backend.repository.UsuarioRepository;
import com.gestaoestoque.backend.service.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock private UsuarioRepository usuarioRepository;

    @InjectMocks private UserDetailsServiceImpl service;

    @Test
    void deveCarregarUsuarioPorEmail() {
        Usuario usuario = Usuario.builder().id(1L).nome("Lucas").email("lucas@teste.com").build();
        when(usuarioRepository.findByEmail("lucas@teste.com")).thenReturn(Optional.of(usuario));

        UserDetails result = service.loadUserByUsername("lucas@teste.com");

        assertSame(usuario, result);
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findByEmail("nao@existe.com")).thenReturn(Optional.empty());

        UsernameNotFoundException ex = assertThrows(UsernameNotFoundException.class,
                () -> service.loadUserByUsername("nao@existe.com"));
        assertTrue(ex.getMessage().contains("nao@existe.com"));
    }
}