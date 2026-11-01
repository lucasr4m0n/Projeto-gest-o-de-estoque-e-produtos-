package com.gestaoestoque.backend;

import com.gestaoestoque.backend.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "chave-secreta-super-segura-para-o-jwt-gestao-estoque-2026";

    private JwtService service;
    private UserDetails user;

    @BeforeEach
    void setUp() {
        service = new JwtService();
        ReflectionTestUtils.setField(service, "secretKey", SECRET);
        user = User.withUsername("lucas@teste.com").password("x").authorities("ROLE_COMPRADOR").build();
    }

    @Test
    void deveGerarTokenEExtrairUsername() {
        String token = service.gerarToken(user);

        assertNotNull(token);
        assertEquals("lucas@teste.com", service.extrairUsername(token));
    }

    @Test
    void deveExtrairClaimDeExpiracaoNoFuturo() {
        String token = service.gerarToken(user);

        Date expiracao = service.extrairClaim(token, c -> c.getExpiration());

        assertTrue(expiracao.after(new Date()));
    }

    @Test
    void deveValidarTokenDoMesmoUsuario() {
        String token = service.gerarToken(user);

        assertTrue(service.isTokenValido(token, user));
    }

    @Test
    void deveInvalidarTokenDeOutroUsuario() {
        String token = service.gerarToken(user);
        UserDetails outro = User.withUsername("outro@teste.com").password("x").authorities("ROLE_X").build();

        assertFalse(service.isTokenValido(token, outro));
    }

    @Test
    void deveLancarExcecaoParaTokenExpirado() {
        String expirado = Jwts.builder()
                .subject("lucas@teste.com")
                .issuedAt(new Date(System.currentTimeMillis() - 20_000))
                .expiration(new Date(System.currentTimeMillis() - 10_000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertThrows(ExpiredJwtException.class, () -> service.extrairUsername(expirado));
    }

    @Test
    void deveLancarExcecaoParaTokenAssinadoComOutraChave() {
        String token = Jwts.builder()
                .subject("lucas@teste.com")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(
                        "outra-chave-secreta-totalmente-diferente-0123456789".getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertThrows(JwtException.class, () -> service.extrairUsername(token));
    }

    @Test
    void deveLancarExcecaoParaTokenMalformado() {
        assertThrows(JwtException.class, () -> service.extrairUsername("isso.nao.eh-um-jwt"));
    }
}