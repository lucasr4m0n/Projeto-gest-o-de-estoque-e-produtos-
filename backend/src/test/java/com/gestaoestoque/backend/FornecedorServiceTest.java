package com.gestaoestoque.backend;

import com.gestaoestoque.backend.dto.FornecedorRequest;
import com.gestaoestoque.backend.dto.FornecedorResponse;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.model.Fornecedor;
import com.gestaoestoque.backend.repository.FornecedorRepository;
import com.gestaoestoque.backend.service.FornecedorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FornecedorServiceTest {

    @Mock
    private FornecedorRepository repository;

    @InjectMocks
    private FornecedorService service;

    private Fornecedor fornecedor;

    @BeforeEach
    void setUp() {
        fornecedor = Fornecedor.builder()
                .id(1L)
                .razaoSocial("EletroSul Ltda")
                .cnpj("11222333000181")
                .email("contato@eletrosul.com")
                .telefone("21999999999")
                .ativo(true)
                .build();
    }

    @Test
    void deveListarFornecedoresComSucesso() {
        when(repository.findAll()).thenReturn(List.of(fornecedor));

        List<FornecedorResponse> resultado = service.listar();

        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        assertEquals("EletroSul Ltda", resultado.get(0).razaoSocial());
    }

    @Test
    void deveBuscarFornecedorPorIdComSucesso() {
        when(repository.findById(1L)).thenReturn(Optional.of(fornecedor));

        FornecedorResponse resultado = service.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
        assertEquals("EletroSul Ltda", resultado.razaoSocial());
    }

    @Test
    void deveLancarExcecaoAoBuscarFornecedorInexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> {
            service.buscarPorId(99L);
        });
    }

    @Test
    void deveCriarFornecedorComSucesso() {
        FornecedorRequest request = new FornecedorRequest(
                "Nova Peças Ltda",
                "11.222.333/0001-81",
                "contato@nova.com",
                "21888888888"
        );

        when(repository.existsByCnpj("11222333000181")).thenReturn(false);
        when(repository.save(any(Fornecedor.class))).thenReturn(fornecedor);

        FornecedorResponse resultado = service.criar(request);

        assertNotNull(resultado);
        verify(repository, times(1)).save(any(Fornecedor.class));
    }

    @Test
    void deveRejeitarCriacaoComCnpjDuplicado() {
        FornecedorRequest request = new FornecedorRequest(
                "Duplicado Ltda",
                "11.222.333/0001-81",
                "dup@email.com",
                "21777777777"
        );

        when(repository.existsByCnpj("11222333000181")).thenReturn(true);

        assertThrows(RegraNegocioException.class, () -> {
            service.criar(request);
        });
        verify(repository, never()).save(any(Fornecedor.class));
    }
}