package com.gestaoestoque.backend.service;

import com.gestaoestoque.backend.dto.ItemPedidoRequest;
import com.gestaoestoque.backend.dto.ItemPedidoResponse;
import com.gestaoestoque.backend.dto.PedidoCompraRequest;
import com.gestaoestoque.backend.dto.PedidoCompraResponse;
import com.gestaoestoque.backend.enums.StatusPedido;
import com.gestaoestoque.backend.enums.TipoMovimentacao;
import com.gestaoestoque.backend.enums.TipoPerfil;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoCompraService {
    private final PedidoCompraRepository pedidoRepository;
    private final ItemPedidoCompraRepository itemRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    @Transactional(readOnly = true)
    public List<PedidoCompraResponse> listar() {
        return pedidoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PedidoCompraResponse buscarPorId(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public PedidoCompraResponse criar(PedidoCompraRequest request) {
        Fornecedor fornecedor = fornecedorRepository.findById(request.fornecedorId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor nao encontrado."));

        if (!Boolean.TRUE.equals(fornecedor.getAtivo())) {
            throw new RegraNegocioException("Nao e possivel criar pedido para fornecedor inativo.");
        }

        PedidoCompra pedido = PedidoCompra.builder()
                .fornecedor(fornecedor)
                .status(StatusPedido.RASCUNHO)
                .build();
        pedido = pedidoRepository.save(pedido);

        for (ItemPedidoRequest itemRequest : request.itens()) {
            Produto produto = buscarProduto(itemRequest.produtoId());
            if (!Boolean.TRUE.equals(produto.getAtivo())) {
                throw new RegraNegocioException("Nao e possivel adicionar produto inativo ao pedido: " + produto.getNome());
            }
            itemRepository.save(ItemPedidoCompra.builder()
                    .pedido(pedido)
                    .produto(produto)
                    .quantidade(itemRequest.quantidade())
                    .precoUnitario(itemRequest.precoUnitario())
                    .build());
        }

        return toResponse(pedido);
    }

    @Transactional
    public PedidoCompraResponse atualizarStatus(Long id, StatusPedido novoStatus, Usuario usuario) {
        PedidoCompra pedido = buscarEntidade(id);
        validarTransicao(pedido.getStatus(), novoStatus);

        if (novoStatus == StatusPedido.ENTREGUE) {
            validarComprador(usuario);
            processarEntrega(pedido, usuario);
        }

        pedido.setStatus(novoStatus);
        pedidoRepository.save(pedido);
        return toResponse(pedido);
    }

    private void processarEntrega(PedidoCompra pedido, Usuario usuario) {
        List<ItemPedidoCompra> itens = itemRepository.findByPedidoId(pedido.getId());
        if (itens.isEmpty()) {
            throw new RegraNegocioException("O pedido nao possui itens para entrega.");
        }

        for (ItemPedidoCompra item : itens) {
            Produto produto = item.getProduto();
            produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() + item.getQuantidade());
            produtoRepository.save(produto);

            MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                    .produto(produto)
                    .usuario(usuario)
                    .tipoMovimentacao(TipoMovimentacao.ENTRADA)
                    .quantidade(item.getQuantidade())
                    .observacao("Entrada de estoque pela entrega do pedido " + pedido.getId())
                    .build();
            movimentacaoRepository.save(movimentacao);
        }
    }

    private void validarTransicao(StatusPedido atual, StatusPedido novo) {
        if (atual == StatusPedido.ENTREGUE && novo != StatusPedido.ENTREGUE) {
            throw new RegraNegocioException("Um pedido entregue nao pode ter o status alterado.");
        }
        if (atual == StatusPedido.CANCELADO && novo != StatusPedido.CANCELADO) {
            throw new RegraNegocioException("Um pedido cancelado nao pode ter o status alterado.");
        }
        if (novo == StatusPedido.ENTREGUE && atual == StatusPedido.ENTREGUE) {
            throw new RegraNegocioException("O pedido ja foi entregue.");
        }
    }

    private void validarComprador(Usuario usuario) {
        if (usuario == null || !Boolean.TRUE.equals(usuario.getAtivo()) || usuario.getPerfil() != TipoPerfil.COMPRADOR) {
            throw new RegraNegocioException("A entrega de pedido deve ser realizada por um usuario ativo com perfil COMPRADOR.");
        }
    }

    private Produto buscarProduto(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado: " + id + "."));
    }

    private PedidoCompra buscarEntidade(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido de compra nao encontrado."));
    }

    private PedidoCompraResponse toResponse(PedidoCompra pedido) {
        List<ItemPedidoResponse> itens = itemRepository.findByPedidoId(pedido.getId()).stream()
                .map(this::toItemResponse)
                .toList();
        BigDecimal total = itens.stream()
                .map(i -> i.precoUnitario().multiply(BigDecimal.valueOf(i.quantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PedidoCompraResponse(
                pedido.getId(), pedido.getFornecedor().getId(), pedido.getFornecedor().getRazaoSocial(),
                pedido.getStatus(), pedido.getDataPedido(), itens, total
        );
    }

    private ItemPedidoResponse toItemResponse(ItemPedidoCompra item) {
        return new ItemPedidoResponse(
                item.getId(), item.getProduto().getId(), item.getProduto().getNome(),
                item.getQuantidade(), item.getPrecoUnitario()
        );
    }
}
