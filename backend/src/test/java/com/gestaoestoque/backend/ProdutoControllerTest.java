package com.gestaoestoque.backend;

import tools.jackson.databind.ObjectMapper;
import com.gestaoestoque.backend.controller.ProdutoController;
import com.gestaoestoque.backend.dto.ProdutoRequest;
import com.gestaoestoque.backend.dto.ProdutoResponse;
import com.gestaoestoque.backend.service.ProdutoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.gestaoestoque.backend.service.JwtService;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProdutoController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProdutoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProdutoService produtoService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void deveListarProdutosComSucesso() throws Exception {
        ProdutoResponse response = new ProdutoResponse(
                1L, "7891234567890", "Mouse Gamer", "Mouse RGB",
                1L, "Eletrônicos", new BigDecimal("150.00"),
                10, 2, "UN", true
        );

        when(produtoService.listar()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].nome").value("Mouse Gamer"));
    }

    @Test
    void deveBuscarProdutoPorIdComSucesso() throws Exception {
        ProdutoResponse response = new ProdutoResponse(
                1L, "7891234567890", "Mouse Gamer", "Mouse RGB",
                1L, "Eletrônicos", new BigDecimal("150.00"),
                10, 2, "UN", true
        );

        when(produtoService.buscarPorId(1L)).thenReturn(response);

        mockMvc.perform(get("/api/produtos/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nome").value("Mouse Gamer"));
    }

    @Test
    void deveCriarProdutoComSucesso() throws Exception {
        ProdutoRequest request = new ProdutoRequest(
                "7891234567890", "Teclado Mecânico", "Teclado RGB",
                1L, new BigDecimal("250.00"), 5, "UN"
        );

        ProdutoResponse response = new ProdutoResponse(
                1L, "7891234567890", "Teclado Mecânico", "Teclado RGB",
                1L, "Eletrônicos", new BigDecimal("250.00"),
                0, 5, "UN", true
        );

        when(produtoService.criar(any(ProdutoRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Teclado Mecânico"));
    }

    @Test
    void deveInativarProdutoComSucesso() throws Exception {
        ProdutoResponse response = new ProdutoResponse(
                1L, "7891234567890", "Mouse Gamer", "Mouse RGB",
                1L, "Eletrônicos", new BigDecimal("150.00"),
                10, 2, "UN", false
        );

        when(produtoService.inativar(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/produtos/1/inativar")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));
    }
}