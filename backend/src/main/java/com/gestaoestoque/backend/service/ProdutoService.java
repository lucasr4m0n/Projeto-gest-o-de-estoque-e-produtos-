package com.gestaoestoque.backend.service;

import com.gestaoestoque.backend.dto.ProdutoRequest;
import com.gestaoestoque.backend.dto.ProdutoResponse;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.model.Categoria;
import com.gestaoestoque.backend.model.Produto;
import com.gestaoestoque.backend.repository.CategoriaRepository;
import com.gestaoestoque.backend.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService {
    private final ProdutoRepository repository;
    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarAtivos() {
        return repository.findByAtivoTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        Categoria categoria = buscarCategoria(request.categoriaId());
        String codigoBarras = normalizarCodigoBarras(request.codigoBarras());
        if (codigoBarras != null && repository.existsByCodigoBarras(codigoBarras)) {
            throw new RegraNegocioException("Ja existe um produto com este codigo de barras.");
        }
        Produto produto = Produto.builder()
                .codigoBarras(codigoBarras)
                .nome(request.nome().trim())
                .descricao(request.descricao())
                .categoria(categoria)
                .precoCusto(request.precoCusto())
                .quantidadeEstoque(0)
                .estoqueMinimo(request.estoqueMinimo())
                .unidadeMedida(request.unidadeMedida().trim())
                .ativo(true)
                .build();
        return toResponse(salvar(produto));
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest request) {
        Produto produto = buscarEntidade(id);
        String codigoBarras = normalizarCodigoBarras(request.codigoBarras());
        if (codigoBarras != null && repository.existsByCodigoBarrasAndIdNot(codigoBarras, id)) {
            throw new RegraNegocioException("Ja existe um produto com este codigo de barras.");
        }
        produto.setCodigoBarras(codigoBarras);
        produto.setNome(request.nome().trim());
        produto.setDescricao(request.descricao());
        produto.setCategoria(buscarCategoria(request.categoriaId()));
        produto.setPrecoCusto(request.precoCusto());
        produto.setEstoqueMinimo(request.estoqueMinimo());
        produto.setUnidadeMedida(request.unidadeMedida().trim());
        return toResponse(salvar(produto));
    }

    @Transactional
    public ProdutoResponse inativar(Long id) {
        Produto produto = buscarEntidade(id);
        produto.setAtivo(false);
        return toResponse(repository.save(produto));
    }

    @Transactional
    public ProdutoResponse ativar(Long id) {
        Produto produto = buscarEntidade(id);
        produto.setAtivo(true);
        return toResponse(repository.save(produto));
    }

    private Produto salvar(Produto produto) {
        try {
            return repository.save(produto);
        } catch (DataIntegrityViolationException ex) {
            throw new RegraNegocioException("Ja existe um produto com este codigo de barras.");
        }
    }

    private Produto buscarEntidade(Long id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado."));
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria nao encontrada."));
    }

    private String normalizarCodigoBarras(String codigo) {
        if (codigo == null || codigo.isBlank()) return null;
        return codigo.trim();
    }

    private ProdutoResponse toResponse(Produto p) {
        return new ProdutoResponse(
                p.getId(), p.getCodigoBarras(), p.getNome(), p.getDescricao(),
                p.getCategoria().getId(), p.getCategoria().getNome(), p.getPrecoCusto(),
                p.getQuantidadeEstoque(), p.getEstoqueMinimo(), p.getUnidadeMedida(), p.getAtivo()
        );
    }
}
