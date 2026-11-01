package com.gestaoestoque.backend;

import com.gestaoestoque.backend.dto.ProdutoRequest;
import com.gestaoestoque.backend.dto.ProdutoResponse;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.model.Categoria;
import com.gestaoestoque.backend.model.Produto;
import com.gestaoestoque.backend.repository.CategoriaRepository;
import com.gestaoestoque.backend.repository.ProdutoRepository;
import com.gestaoestoque.backend.service.ProdutoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository repository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private ProdutoService produtoService;

    private Produto produto;
    private Categoria categoria;

    @BeforeEach
    void setUp() {
        categoria = Categoria.builder()
                .id(1L)
                .nome("Eletrônicos")
                .descricao("Categoria de eletrônicos")
                .build();

        produto = Produto.builder()
                .id(1L)
                .codigoBarras("7891234567890")
                .nome("Mouse Gamer")
                .descricao("Mouse RGB")
                .categoria(categoria)
                .precoCusto(new BigDecimal("150.00"))
                .quantidadeEstoque(10)
                .estoqueMinimo(2)
                .unidadeMedida("UN")
                .ativo(true)
                .build();
    }

    @Test
    void deveListarProdutosComSucesso() {
        when(repository.findAll()).thenReturn(List.of(produto));

        List<ProdutoResponse> resultado = produtoService.listar();

        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        assertEquals("Mouse Gamer", resultado.get(0).nome());
    }

    @Test
    void deveListarProdutosAtivosComSucesso() {
        when(repository.findByAtivoTrue()).thenReturn(List.of(produto));

        List<ProdutoResponse> resultado = produtoService.listarAtivos();

        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
    }

    @Test
    void deveBuscarProdutoPorIdComSucesso() {
        when(repository.findById(1L)).thenReturn(Optional.of(produto));

        ProdutoResponse resultado = produtoService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
        assertEquals("Mouse Gamer", resultado.nome());
    }

    @Test
    void deveLancarExcecaoAoBuscarProdutoInexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> {
            produtoService.buscarPorId(99L);
        });
    }

    @Test
    void deveCriarProdutoComSucesso() {
        ProdutoRequest request = new ProdutoRequest(
                "7899876543210",          // 1. codigoBarras (String)
                "Teclado Mecânico",       // 2. nome (String)
                "Teclado RGB Switch Blue",// 3. descricao (String)
                1L,                       // 4. categoriaId (Long)
                new BigDecimal("250.00"), // 5. precoCusto (BigDecimal)
                5,                        // 6. estoqueMinimo (Integer)
                "UN"                      // 7. unidadeMedida (String)
        );

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(repository.existsByCodigoBarras("7899876543210")).thenReturn(false);
        when(repository.save(any(Produto.class))).thenReturn(produto);

        ProdutoResponse resultado = produtoService.criar(request);

        assertNotNull(resultado);
        verify(repository, times(1)).save(any(Produto.class));
    }

    @Test
    void deveRejeitarCriacaoComCodigoBarrasDuplicado() {
        ProdutoRequest request = new ProdutoRequest(
                "7891234567890",          // 1. codigoBarras (String)
                "Outro Mouse",            // 2. nome (String)
                "Descrição",              // 3. descricao (String)
                1L,                       // 4. categoriaId (Long - com o 'L' no fim)
                new BigDecimal("100.00"), // 5. precoCusto (BigDecimal)
                2,                        // 6. estoqueMinimo (Integer)
                "UN"                      // 7. unidadeMedida (String)
        );

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(repository.existsByCodigoBarras("7891234567890")).thenReturn(true);

        assertThrows(RegraNegocioException.class, () -> {
            produtoService.criar(request);
        });
        verify(repository, never()).save(any(Produto.class));
    }

    @Test
    void deveInativarProdutoComSucesso() {
        when(repository.findById(1L)).thenReturn(Optional.of(produto));
        when(repository.save(any(Produto.class))).thenReturn(produto);

        ProdutoResponse resultado = produtoService.inativar(1L);

        assertNotNull(resultado);
        assertFalse(produto.getAtivo());
        verify(repository, times(1)).save(produto);
    }
}