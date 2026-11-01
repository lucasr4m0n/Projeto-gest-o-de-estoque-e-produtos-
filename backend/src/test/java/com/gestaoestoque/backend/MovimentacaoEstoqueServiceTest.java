package com.gestaoestoque.backend;

import com.gestaoestoque.backend.dto.MovimentacaoRequest;
import com.gestaoestoque.backend.dto.MovimentacaoResponse;
import com.gestaoestoque.backend.enums.TipoMovimentacao;
import com.gestaoestoque.backend.exception.EstoqueInsuficienteException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.model.MovimentacaoEstoque;
import com.gestaoestoque.backend.model.Produto;
import com.gestaoestoque.backend.model.Usuario;
import com.gestaoestoque.backend.repository.MovimentacaoEstoqueRepository;
import com.gestaoestoque.backend.repository.ProdutoRepository;
import com.gestaoestoque.backend.service.MovimentacaoEstoqueService;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovimentacaoEstoqueServiceTest {

    @Mock private MovimentacaoEstoqueRepository movimentacaoRepository;
    @Mock private ProdutoRepository produtoRepository;

    @InjectMocks private MovimentacaoEstoqueService service;

    private Produto produto;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        produto = Produto.builder().id(10L).nome("Parafuso").ativo(true).quantidadeEstoque(10).build();
        usuario = Usuario.builder().id(5L).nome("Lucas").ativo(true).build();
    }

    private MovimentacaoEstoque movimentacao() {
        return MovimentacaoEstoque.builder()
                .produto(produto).usuario(usuario)
                .tipoMovimentacao(TipoMovimentacao.ENTRADA)
                .quantidade(3).observacao("teste").build();
    }

    // ---------- listar ----------

    @Test
    void deveListarMovimentacoes() {
        when(movimentacaoRepository.findAllByOrderByDataHoraDesc()).thenReturn(List.of(movimentacao()));

        List<MovimentacaoResponse> result = service.listar();

        assertEquals(1, result.size());
        assertEquals("Parafuso", result.get(0).produtoNome());
    }

    @Test
    void deveListarMovimentacoesPorProduto() {
        when(produtoRepository.existsById(10L)).thenReturn(true);
        when(movimentacaoRepository.findByProdutoIdOrderByDataHoraDesc(10L)).thenReturn(List.of(movimentacao()));

        assertEquals(1, service.listarPorProduto(10L).size());
    }

    @Test
    void deveFalharAoListarPorProdutoInexistente() {
        when(produtoRepository.existsById(99L)).thenReturn(false);

        assertThrows(RecursoNaoEncontradoException.class, () -> service.listarPorProduto(99L));
        verify(movimentacaoRepository, never()).findByProdutoIdOrderByDataHoraDesc(any());
    }

    // ---------- registrar ----------

    @Test
    void deveRegistrarEntradaAumentandoEstoque() {
        MovimentacaoRequest request = new MovimentacaoRequest(10L, TipoMovimentacao.ENTRADA, 5, "reposicao");
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));
        when(movimentacaoRepository.save(any(MovimentacaoEstoque.class))).thenAnswer(i -> i.getArgument(0));

        MovimentacaoResponse result = service.registrar(request, usuario);

        assertEquals(15, produto.getQuantidadeEstoque());
        assertEquals(TipoMovimentacao.ENTRADA, result.tipoMovimentacao());
        verify(produtoRepository).save(produto);
    }

    @Test
    void deveRegistrarSaidaDiminuindoEstoque() {
        MovimentacaoRequest request = new MovimentacaoRequest(10L, TipoMovimentacao.SAIDA, 4, "venda");
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));
        when(movimentacaoRepository.save(any(MovimentacaoEstoque.class))).thenAnswer(i -> i.getArgument(0));

        service.registrar(request, usuario);

        assertEquals(6, produto.getQuantidadeEstoque());
    }

    @Test
    void devePermitirSaidaDeTodoOEstoque() {
        MovimentacaoRequest request = new MovimentacaoRequest(10L, TipoMovimentacao.SAIDA, 10, null);
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));
        when(movimentacaoRepository.save(any(MovimentacaoEstoque.class))).thenAnswer(i -> i.getArgument(0));

        service.registrar(request, usuario);

        assertEquals(0, produto.getQuantidadeEstoque());
    }

    @Test
    void deveFalharAoRegistrarSaidaComEstoqueInsuficiente() {
        MovimentacaoRequest request = new MovimentacaoRequest(10L, TipoMovimentacao.SAIDA, 11, null);
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));

        EstoqueInsuficienteException ex = assertThrows(EstoqueInsuficienteException.class,
                () -> service.registrar(request, usuario));
        assertTrue(ex.getMessage().contains("Disponivel: 10"));
        assertEquals(10, produto.getQuantidadeEstoque());
        verify(produtoRepository, never()).save(any());
        verify(movimentacaoRepository, never()).save(any());
    }

    @Test
    void deveFalharAoRegistrarSemUsuario() {
        MovimentacaoRequest request = new MovimentacaoRequest(10L, TipoMovimentacao.ENTRADA, 1, null);

        assertThrows(RegraNegocioException.class, () -> service.registrar(request, null));
        verify(produtoRepository, never()).findById(any());
    }

    @Test
    void deveFalharAoRegistrarComUsuarioInativo() {
        usuario.setAtivo(false);
        MovimentacaoRequest request = new MovimentacaoRequest(10L, TipoMovimentacao.ENTRADA, 1, null);

        assertThrows(RegraNegocioException.class, () -> service.registrar(request, usuario));
    }

    @Test
    void deveFalharAoRegistrarParaProdutoInexistente() {
        MovimentacaoRequest request = new MovimentacaoRequest(99L, TipoMovimentacao.ENTRADA, 1, null);
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> service.registrar(request, usuario));
    }

    @Test
    void deveFalharAoRegistrarParaProdutoInativo() {
        produto.setAtivo(false);
        MovimentacaoRequest request = new MovimentacaoRequest(10L, TipoMovimentacao.ENTRADA, 1, null);
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));

        assertThrows(RegraNegocioException.class, () -> service.registrar(request, usuario));
        verify(produtoRepository, never()).save(any());
    }
}