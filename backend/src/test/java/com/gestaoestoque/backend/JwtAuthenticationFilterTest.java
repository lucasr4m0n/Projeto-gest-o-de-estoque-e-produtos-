package com.gestaoestoque.backend;

import com.gestaoestoque.backend.security.JwtAuthenticationFilter;
import com.gestaoestoque.backend.service.JwtService;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    private static final String EMAIL = "lucas@teste.com";

    @Mock private JwtService jwtService;
    @Mock private UserDetailsService userDetailsService;
    @Mock private FilterChain chain;

    @InjectMocks private JwtAuthenticationFilter filter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private UserDetails user;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        user = User.withUsername(EMAIL).password("x").authorities("ROLE_COMPRADOR").build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deveSeguirSemAutenticarQuandoNaoHaHeader() throws Exception {
        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtService, never()).extrairUsername(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deveSeguirSemAutenticarQuandoHeaderNaoEhBearer() throws Exception {
        request.addHeader("Authorization", "Basic abc123");

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtService, never()).extrairUsername(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deveAutenticarQuandoTokenValido() throws Exception {
        request.addHeader("Authorization", "Bearer token-ok");
        when(jwtService.extrairUsername("token-ok")).thenReturn(EMAIL);
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(user);
        when(jwtService.isTokenValido("token-ok", user)).thenReturn(true);

        filter.doFilter(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertSame(user, auth.getPrincipal());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPRADOR")));
        verify(chain).doFilter(request, response);
    }

    @Test
    void naoDeveAutenticarQuandoTokenNaoEhValidoParaOUsuario() throws Exception {
        request.addHeader("Authorization", "Bearer token-outro");
        when(jwtService.extrairUsername("token-outro")).thenReturn(EMAIL);
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(user);
        when(jwtService.isTokenValido("token-outro", user)).thenReturn(false);

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }

    @Test
    void naoDeveAutenticarQuandoUsernameEhNulo() throws Exception {
        request.addHeader("Authorization", "Bearer token-sem-subject");
        when(jwtService.extrairUsername("token-sem-subject")).thenReturn(null);

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(userDetailsService, never()).loadUserByUsername(org.mockito.ArgumentMatchers.any());
        verify(chain).doFilter(request, response);
    }

    @Test
    void naoDeveReprocessarQuandoJaExisteAutenticacao() throws Exception {
        Authentication existente = new UsernamePasswordAuthenticationToken("outro", null);
        SecurityContextHolder.getContext().setAuthentication(existente);
        request.addHeader("Authorization", "Bearer token-ok");
        when(jwtService.extrairUsername("token-ok")).thenReturn(EMAIL);

        filter.doFilter(request, response, chain);

        assertSame(existente, SecurityContextHolder.getContext().getAuthentication());
        verify(userDetailsService, never()).loadUserByUsername(org.mockito.ArgumentMatchers.any());
        verify(chain).doFilter(request, response);
    }

    @Test
    void deveSeguirSemAutenticarQuandoTokenInvalidoOuExpirado() throws Exception {
        request.addHeader("Authorization", "Bearer token-expirado");
        when(jwtService.extrairUsername("token-expirado")).thenThrow(new JwtException("expirado"));

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }

    @Test
    void deveSeguirSemAutenticarQuandoTokenMalformado() throws Exception {
        request.addHeader("Authorization", "Bearer lixo");
        when(jwtService.extrairUsername("lixo")).thenThrow(new MalformedJwtException("malformado"));

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }

    @Test
    void deveSeguirSemAutenticarQuandoTokenVazio() throws Exception {
        request.addHeader("Authorization", "Bearer ");
        when(jwtService.extrairUsername("")).thenThrow(new IllegalArgumentException("vazio"));

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }

    @Test
    void deveSeguirSemAutenticarQuandoUsuarioDoTokenNaoExisteMais() throws Exception {
        request.addHeader("Authorization", "Bearer token-ok");
        when(jwtService.extrairUsername("token-ok")).thenReturn(EMAIL);
        when(userDetailsService.loadUserByUsername(EMAIL)).thenThrow(new UsernameNotFoundException("sumiu"));

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }
}