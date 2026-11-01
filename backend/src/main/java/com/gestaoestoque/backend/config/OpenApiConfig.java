package com.gestaoestoque.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI gestaoEstoqueOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Gestão de Estoque")
                        .version("v1.0.0")
                        .description("""
                                API REST para controle de estoque: produtos, categorias, fornecedores, \
                                pedidos de compra e movimentações de estoque.

                                **Autenticação:** faça login em `POST /api/auth/login`, copie o token \
                                e clique em **Authorize** informando apenas o token (sem o prefixo `Bearer`).""")
                        .contact(new Contact()
                                .name("Equipe Gestão de Estoque")
                                .email("contato@gestaoestoque.com"))
                        .license(new License().name("Uso acadêmico")))
                .servers(List.of(new Server()
                        .url("http://localhost:8090")
                        .description("Ambiente local")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME, new SecurityScheme()
                                .name(SECURITY_SCHEME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}