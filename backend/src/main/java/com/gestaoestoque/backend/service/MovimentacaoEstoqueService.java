package com.gestaoestoque.backend.service;

import com.gestaoestoque.backend.dto.MovimentacaoRequest;
import com.gestaoestoque.backend.dto.MovimentacaoResponse;
import com.gestaoestoque.backend.enums.TipoMovimentacao;
import com.gestaoestoque.backend.exception.EstoqueInsuficienteException;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.model.MovimentacaoEstoque;
import com.gestaoestoque.backend.model.Produto;
import com.gestaoestoque.backend.model.Usuario;
import com.gestaoestoque.backend.repository.MovimentacaoEstoqueRepository;
import com.gestaoestoque.backend.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimentacaoEstoqueService {
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;

    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> listar() {
        return movimentacaoRepository.findAllByOrderByDataHoraDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> listarPorProduto(Long produtoId) {
        if (!produtoRepository.existsById(produtoId)) {
            throw new RecursoNaoEncontradoException("Produto nao encontrado.");
        }
        return movimentacaoRepository.findByProdutoIdOrderByDataHoraDesc(produtoId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public MovimentacaoResponse registrar(MovimentacaoRequest request, Usuario usuario) {
        if (usuario == null || !Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new RegraNegocioException("Usuario invalido ou inativo.");
        }

        Produto produto = produtoRepository.findById(request.produtoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));

        if (!Boolean.TRUE.equals(produto.getAtivo())) {
            throw new RegraNegocioException("Nao e possivel movimentar um produto inativo.");
        }

        if (request.tipoMovimentacao() == TipoMovimentacao.SAIDA
                && request.quantidade() > produto.getQuantidadeEstoque()) {
            throw new EstoqueInsuficienteException(
                    "Estoque insuficiente para o produto " + produto.getNome()
                            + ". Disponivel: " + produto.getQuantidadeEstoque()
                            + ", solicitado: " + request.quantidade() + "."
            );
        }

        int delta = request.tipoMovimentacao() == TipoMovimentacao.ENTRADA
                ? request.quantidade()
                : -request.quantidade();

        produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() + delta);
        produtoRepository.save(produto);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .produto(produto)
                .usuario(usuario)
                .tipoMovimentacao(request.tipoMovimentacao())
                .quantidade(request.quantidade())
                .observacao(request.observacao())
                .build();

        return toResponse(movimentacaoRepository.save(movimentacao));
    }

    private MovimentacaoResponse toResponse(MovimentacaoEstoque m) {
        return new MovimentacaoResponse(
                m.getId(), m.getProduto().getId(), m.getProduto().getNome(),
                m.getUsuario().getId(), m.getUsuario().getNome(), m.getTipoMovimentacao(),
                m.getQuantidade(), m.getDataHora(), m.getObservacao()
        );
    }
}
