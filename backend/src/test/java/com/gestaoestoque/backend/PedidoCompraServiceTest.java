package com.gestaoestoque.backend;

import com.gestaoestoque.backend.dto.ItemPedidoRequest;
import com.gestaoestoque.backend.dto.PedidoCompraRequest;
import com.gestaoestoque.backend.dto.PedidoCompraResponse;
import com.gestaoestoque.backend.enums.StatusPedido;
import com.gestaoestoque.backend.enums.TipoMovimentacao;
import com.gestaoestoque.backend.enums.TipoPerfil;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.model.Fornecedor;
import com.gestaoestoque.backend.model.ItemPedidoCompra;
import com.gestaoestoque.backend.model.MovimentacaoEstoque;
import com.gestaoestoque.backend.model.PedidoCompra;
import com.gestaoestoque.backend.model.Produto;
import com.gestaoestoque.backend.model.Usuario;
import com.gestaoestoque.backend.repository.FornecedorRepository;
import com.gestaoestoque.backend.repository.ItemPedidoCompraRepository;
import com.gestaoestoque.backend.repository.MovimentacaoEstoqueRepository;
import com.gestaoestoque.backend.repository.PedidoCompraRepository;
import com.gestaoestoque.backend.repository.ProdutoRepository;
import com.gestaoestoque.backend.service.PedidoCompraService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoCompraServiceTest {

    @Mock private PedidoCompraRepository pedidoRepository;
    @Mock private ItemPedidoCompraRepository itemRepository;
    @Mock private FornecedorRepository fornecedorRepository;
    @Mock private ProdutoRepository produtoRepository;
    @Mock private MovimentacaoEstoqueRepository movimentacaoRepository;

    @InjectMocks private PedidoCompraService service;

    private Fornecedor fornecedor;
    private Produto produto;
    private PedidoCompra pedido;
    private Usuario comprador;

    @BeforeEach
    void setUp() {
        fornecedor = Fornecedor.builder().id(1L).razaoSocial("Distribuidora ABC").ativo(true).build();
        produto = Produto.builder().id(10L).nome("Parafuso").ativo(true).quantidadeEstoque(10).build();
        pedido = PedidoCompra.builder().id(1L).fornecedor(fornecedor).status(StatusPedido.RASCUNHO).build();
        comprador = Usuario.builder().id(5L).nome("Comprador").ativo(true).perfil(TipoPerfil.COMPRADOR).build();
    }

    private ItemPedidoCompra item(int quantidade, String preco) {
        return ItemPedidoCompra.builder()
                .pedido(pedido).produto(produto)
                .quantidade(quantidade).precoUnitario(new BigDecimal(preco)).build();
    }

    private TipoPerfil perfilNaoComprador() {
        return Arrays.stream(TipoPerfil.values())
                .filter(p -> p != TipoPerfil.COMPRADOR).findFirst().orElseThrow();
    }

    // ---------- listar / buscar ----------

    @Test
    void deveListarPedidosComTotalCalculado() {
        when(pedidoRepository.findAll()).thenReturn(List.of(pedido));
        when(itemRepository.findByPedidoId(1L)).thenReturn(List.of(item(3, "10.00"), item(2, "5.00")));

        List<PedidoCompraResponse> result = service.listar();

        assertEquals(1, result.size());
        assertEquals(2, result.get(0).itens().size());
        assertEquals(0, new BigDecimal("40.00").compareTo(result.get(0).total()));
    }

    @Test
    void deveBuscarPedidoPorId() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(itemRepository.findByPedidoId(1L)).thenReturn(List.of());

        PedidoCompraResponse result = service.buscarPorId(1L);

        assertEquals(1L, result.id());
        assertEquals(0, BigDecimal.ZERO.compareTo(result.total()));
    }

    @Test
    void deveLancarExcecaoAoBuscarPedidoInexistente() {
        when(pedidoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> service.buscarPorId(99L));
    }

    // ---------- criar ----------

    @Test
    void deveCriarPedidoComSucesso() {
        PedidoCompraRequest request = new PedidoCompraRequest(
                1L, List.of(new ItemPedidoRequest(10L, 5, new BigDecimal("2.50"))));

        when(fornecedorRepository.findById(1L)).thenReturn(Optional.of(fornecedor));
        when(pedidoRepository.save(any(PedidoCompra.class))).thenReturn(pedido);
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));
        when(itemRepository.findByPedidoId(1L)).thenReturn(List.of());

        PedidoCompraResponse result = service.criar(request);

        assertEquals(1L, result.id());
        ArgumentCaptor<ItemPedidoCompra> captor = ArgumentCaptor.forClass(ItemPedidoCompra.class);
        verify(itemRepository).save(captor.capture());
        assertEquals(5, captor.getValue().getQuantidade());
        assertEquals(produto, captor.getValue().getProduto());
    }

    @Test
    void deveFalharAoCriarPedidoComFornecedorInexistente() {
        when(fornecedorRepository.findById(1L)).thenReturn(Optional.empty());
        PedidoCompraRequest request = new PedidoCompraRequest(1L, List.of());

        assertThrows(RecursoNaoEncontradoException.class, () -> service.criar(request));
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void deveFalharAoCriarPedidoComFornecedorInativo() {
        fornecedor.setAtivo(false);
        when(fornecedorRepository.findById(1L)).thenReturn(Optional.of(fornecedor));
        PedidoCompraRequest request = new PedidoCompraRequest(1L, List.of());

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> service.criar(request));
        assertTrue(ex.getMessage().contains("fornecedor inativo"));
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void deveFalharAoCriarPedidoComProdutoInexistente() {
        PedidoCompraRequest request = new PedidoCompraRequest(
                1L, List.of(new ItemPedidoRequest(10L, 5, new BigDecimal("2.50"))));
        when(fornecedorRepository.findById(1L)).thenReturn(Optional.of(fornecedor));
        when(pedidoRepository.save(any(PedidoCompra.class))).thenReturn(pedido);
        when(produtoRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> service.criar(request));
    }

    @Test
    void deveFalharAoCriarPedidoComProdutoInativo() {
        produto.setAtivo(false);
        PedidoCompraRequest request = new PedidoCompraRequest(
                1L, List.of(new ItemPedidoRequest(10L, 5, new BigDecimal("2.50"))));
        when(fornecedorRepository.findById(1L)).thenReturn(Optional.of(fornecedor));
        when(pedidoRepository.save(any(PedidoCompra.class))).thenReturn(pedido);
        when(produtoRepository.findById(10L)).thenReturn(Optional.of(produto));

        assertThrows(RegraNegocioException.class, () -> service.criar(request));
        verify(itemRepository, never()).save(any());
    }

    // ---------- atualizarStatus ----------

    @Test
    void deveEntregarPedidoAtualizandoEstoqueERegistrandoMovimentacao() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(itemRepository.findByPedidoId(1L)).thenReturn(List.of(item(5, "2.00")));

        PedidoCompraResponse result = service.atualizarStatus(1L, StatusPedido.ENTREGUE, comprador);

        assertEquals(StatusPedido.ENTREGUE, result.status());
        assertEquals(15, produto.getQuantidadeEstoque());
        verify(produtoRepository).save(produto);

        ArgumentCaptor<MovimentacaoEstoque> captor = ArgumentCaptor.forClass(MovimentacaoEstoque.class);
        verify(movimentacaoRepository).save(captor.capture());
        assertEquals(TipoMovimentacao.ENTRADA, captor.getValue().getTipoMovimentacao());
        assertEquals(5, captor.getValue().getQuantidade());
        assertEquals(comprador, captor.getValue().getUsuario());
    }

    @Test
    void deveFalharAoEntregarPedidoSemItens() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(itemRepository.findByPedidoId(1L)).thenReturn(List.of());

        assertThrows(RegraNegocioException.class,
                () -> service.atualizarStatus(1L, StatusPedido.ENTREGUE, comprador));
        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void deveFalharAoEntregarSemUsuario() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class,
                () -> service.atualizarStatus(1L, StatusPedido.ENTREGUE, null));
        verify(produtoRepository, never()).save(any());
    }

    @Test
    void deveFalharAoEntregarComUsuarioInativo() {
        comprador.setAtivo(false);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class,
                () -> service.atualizarStatus(1L, StatusPedido.ENTREGUE, comprador));
    }

    @Test
    void deveFalharAoEntregarComPerfilQueNaoEhComprador() {
        comprador.setPerfil(perfilNaoComprador());
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThrows(RegraNegocioException.class,
                () -> service.atualizarStatus(1L, StatusPedido.ENTREGUE, comprador));
    }

    @Test
    void deveCancelarPedidoSemExigirComprador() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(itemRepository.findByPedidoId(1L)).thenReturn(List.of());

        PedidoCompraResponse result = service.atualizarStatus(1L, StatusPedido.CANCELADO, null);

        assertEquals(StatusPedido.CANCELADO, result.status());
        verify(pedidoRepository).save(pedido);
        verify(movimentacaoRepository, never()).save(any());
    }

    @Test
    void naoDevePermitirAlterarPedidoEntregue() {
        pedido.setStatus(StatusPedido.ENTREGUE);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> service.atualizarStatus(1L, StatusPedido.CANCELADO, comprador));
        assertTrue(ex.getMessage().contains("entregue"));
    }

    @Test
    void naoDevePermitirAlterarPedidoCancelado() {
        pedido.setStatus(StatusPedido.CANCELADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> service.atualizarStatus(1L, StatusPedido.RASCUNHO, comprador));
        assertTrue(ex.getMessage().contains("cancelado"));
    }

    @Test
    void naoDeveEntregarPedidoDuasVezes() {
        pedido.setStatus(StatusPedido.ENTREGUE);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> service.atualizarStatus(1L, StatusPedido.ENTREGUE, comprador));
        assertTrue(ex.getMessage().contains("ja foi entregue"));
    }

    @Test
    void deveFalharAoAtualizarStatusDePedidoInexistente() {
        when(pedidoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class,
                () -> service.atualizarStatus(99L, StatusPedido.CANCELADO, comprador));
    }
}