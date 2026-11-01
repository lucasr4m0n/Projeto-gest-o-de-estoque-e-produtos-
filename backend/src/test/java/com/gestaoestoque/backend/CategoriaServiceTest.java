package com.gestaoestoque.backend;

import com.gestaoestoque.backend.dto.CategoriaRequest;
import com.gestaoestoque.backend.dto.CategoriaResponse;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.model.Categoria;
import com.gestaoestoque.backend.repository.CategoriaRepository;
import com.gestaoestoque.backend.service.CategoriaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock private CategoriaRepository repository;

    @InjectMocks private CategoriaService service;

    private Categoria categoria;

    @BeforeEach
    void setUp() {
        categoria = Categoria.builder().id(1L).nome("Bebidas").descricao("Todas as bebidas").build();
    }

    @Test
    void deveListarCategorias() {
        when(repository.findAll()).thenReturn(List.of(categoria));

        List<CategoriaResponse> result = service.listar();

        assertEquals(1, result.size());
        assertEquals("Bebidas", result.get(0).nome());
    }

    @Test
    void deveBuscarCategoriaPorId() {
        when(repository.findById(1L)).thenReturn(Optional.of(categoria));

        assertEquals("Bebidas", service.buscarPorId(1L).nome());
    }

    @Test
    void deveFalharAoBuscarCategoriaInexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> service.buscarPorId(99L));
    }

    @Test
    void deveCriarCategoriaRemovendoEspacosDoNome() {
        when(repository.existsByNome("Limpeza")).thenReturn(false);
        when(repository.save(any(Categoria.class))).thenAnswer(i -> i.getArgument(0));

        CategoriaResponse result = service.criar(new CategoriaRequest("  Limpeza  ", "Produtos de limpeza"));

        assertEquals("Limpeza", result.nome());
    }

    @Test
    void deveFalharAoCriarCategoriaDuplicada() {
        when(repository.existsByNome("Bebidas")).thenReturn(true);

        assertThrows(RegraNegocioException.class,
                () -> service.criar(new CategoriaRequest("Bebidas", null)));
        verify(repository, never()).save(any());
    }

    @Test
    void deveAtualizarCategoria() {
        when(repository.findById(1L)).thenReturn(Optional.of(categoria));
        when(repository.existsByNome("Alimentos")).thenReturn(false);
        when(repository.save(any(Categoria.class))).thenAnswer(i -> i.getArgument(0));

        CategoriaResponse result = service.atualizar(1L, new CategoriaRequest("Alimentos", "Comidas"));

        assertEquals("Alimentos", result.nome());
        assertEquals("Comidas", result.descricao());
    }

    @Test
    void deveAtualizarSemVerificarDuplicidadeQuandoNomeNaoMudou() {
        when(repository.findById(1L)).thenReturn(Optional.of(categoria));
        when(repository.save(any(Categoria.class))).thenAnswer(i -> i.getArgument(0));

        CategoriaResponse result = service.atualizar(1L, new CategoriaRequest("Bebidas", "Nova descricao"));

        assertEquals("Nova descricao", result.descricao());
        verify(repository, never()).existsByNome(any());
    }

    @Test
    void deveFalharAoAtualizarParaNomeJaExistente() {
        when(repository.findById(1L)).thenReturn(Optional.of(categoria));
        when(repository.existsByNome("Alimentos")).thenReturn(true);

        assertThrows(RegraNegocioException.class,
                () -> service.atualizar(1L, new CategoriaRequest("Alimentos", null)));
        verify(repository, never()).save(any());
    }

    @Test
    void deveFalharAoAtualizarCategoriaInexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class,
                () -> service.atualizar(99L, new CategoriaRequest("X", null)));
    }

    @Test
    void deveRemoverCategoria() {
        when(repository.findById(1L)).thenReturn(Optional.of(categoria));

        service.remover(1L);

        verify(repository).delete(categoria);
        verify(repository).flush();
    }

    @Test
    void deveFalharAoRemoverCategoriaComProdutosVinculados() {
        when(repository.findById(1L)).thenReturn(Optional.of(categoria));
        doThrow(new DataIntegrityViolationException("fk")).when(repository).flush();

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> service.remover(1L));
        assertTrue(ex.getMessage().contains("produtos vinculados"));
    }

    @Test
    void deveFalharAoRemoverCategoriaInexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> service.remover(99L));
        verify(repository, never()).delete(any());
    }
}