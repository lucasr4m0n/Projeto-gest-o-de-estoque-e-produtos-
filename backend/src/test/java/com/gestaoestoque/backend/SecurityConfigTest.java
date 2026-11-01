package com.gestaoestoque.backend;

import com.gestaoestoque.backend.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    private final SecurityConfig config = new SecurityConfig(null, mock(UserDetailsService.class));

    @Test
    void passwordEncoderDeveGerarHashVerificavel() {
        PasswordEncoder encoder = config.passwordEncoder();

        String hash = encoder.encode("123456");

        assertNotEquals("123456", hash);
        assertTrue(encoder.matches("123456", hash));
        assertFalse(encoder.matches("errada", hash));
    }

    @Test
    void corsDevePermitirApenasOFrontLocal() {
        CorsConfigurationSource source = config.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/produtos");

        CorsConfiguration cors = source.getCorsConfiguration(request);

        assertNotNull(cors);
        assertEquals(java.util.List.of("http://localhost:5173"), cors.getAllowedOrigins());
        assertTrue(cors.getAllowedMethods().contains("DELETE"));
        assertTrue(cors.getAllowCredentials());
    }

    @Test
    void authenticationProviderDeveSerCriado() {
        assertNotNull(config.authenticationProvider());
    }
}