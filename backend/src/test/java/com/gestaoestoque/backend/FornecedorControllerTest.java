package com.gestaoestoque.backend;

import tools.jackson.databind.ObjectMapper;
import com.gestaoestoque.backend.dto.FornecedorRequest;
import com.gestaoestoque.backend.dto.FornecedorResponse;
import com.gestaoestoque.backend.service.FornecedorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.gestaoestoque.backend.service.JwtService;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class FornecedorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FornecedorService fornecedorService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void deveListarFornecedoresComSucesso() throws Exception {
        FornecedorResponse response = new FornecedorResponse(
                1L, "Distribuidora ABC", "12.345.678/0001-99",
                "contato@abc.com", "21999999999", true
        );

        when(fornecedorService.listar()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/fornecedores")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].razaoSocial").value("Distribuidora ABC"));
    }

    @Test
    void deveBuscarFornecedorPorIdComSucesso() throws Exception {
        FornecedorResponse response = new FornecedorResponse(
                1L, "Distribuidora ABC", "12.345.678/0001-99",
                "contato@abc.com", "21999999999", true
        );

        when(fornecedorService.buscarPorId(1L)).thenReturn(response);

        mockMvc.perform(get("/api/fornecedores/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.razaoSocial").value("Distribuidora ABC"));
    }

    @Test
    void deveCriarFornecedorComSucesso() throws Exception {
        FornecedorRequest request = new FornecedorRequest(
                "Distribuidora ABC", "12345678000199",   // 14 dígitos, sem pontuação
                "contato@abc.com", "21999999999"
        );

        FornecedorResponse response = new FornecedorResponse(
                1L, "Distribuidora ABC", "12.345.678/0001-99",
                "contato@abc.com", "21999999999", true
        );

        when(fornecedorService.criar(any(FornecedorRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/fornecedores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.razaoSocial").value("Distribuidora ABC"));
    }

    @Test
    void deveRemoverFornecedorComSucesso() throws Exception {
        doNothing().when(fornecedorService).remover(1L);

        mockMvc.perform(delete("/api/fornecedores/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }
}