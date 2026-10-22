package com.gestaoestoque.backend.config;

import com.gestaoestoque.backend.enums.TipoPerfil;
import com.gestaoestoque.backend.model.Usuario;
import com.gestaoestoque.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // Lê os valores do application.properties (com valores padrão caso não encontre)
    @Value("${app.admin.email:admin@gestao.com}")
    private String emailAdmin;

    @Value("${app.admin.senha:123456}")
    private String senhaAdmin;

    @Bean
    public CommandLineRunner iniciarDados() {
        return args -> {
            if (!usuarioRepository.existsByEmail(emailAdmin)) {
                Usuario admin = Usuario.builder()
                        .nome("Administrador do Sistema")
                        .email(emailAdmin)
                        .senhaHash(passwordEncoder.encode(senhaAdmin))
                        .perfil(TipoPerfil.ADMIN)
                        .ativo(true)
                        .build();

                usuarioRepository.save(admin);
                System.out.println(">>> Utilizador administrador criado com sucesso: " + emailAdmin);
            }
        };
    }
}