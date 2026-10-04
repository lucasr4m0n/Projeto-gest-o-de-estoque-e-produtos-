package com.gestaoestoque.backend.service;

import com.gestaoestoque.backend.dto.CategoriaRequest;
import com.gestaoestoque.backend.dto.CategoriaResponse;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.model.Categoria;
import com.gestaoestoque.backend.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository repository;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscarPorId(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        String nome = request.nome().trim();
        if (repository.existsByNome(nome)) {
            throw new RegraNegocioException("Ja existe uma categoria com este nome.");
        }
        Categoria categoria = Categoria.builder().nome(nome).descricao(request.descricao()).build();
        return toResponse(repository.save(categoria));
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscarEntidade(id);
        String nome = request.nome().trim();
        if (!nome.equals(categoria.getNome()) && repository.existsByNome(nome)) {
            throw new RegraNegocioException("Ja existe uma categoria com este nome.");
        }
        categoria.setNome(nome);
        categoria.setDescricao(request.descricao());
        return toResponse(repository.save(categoria));
    }

    @Transactional
    public void remover(Long id) {
        Categoria categoria = buscarEntidade(id);
        try {
            repository.delete(categoria);
            repository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new RegraNegocioException("A categoria nao pode ser removida porque possui produtos vinculados.");
        }
    }

    private Categoria buscarEntidade(Long id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Categoria nao encontrada."));
    }

    private CategoriaResponse toResponse(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNome(), c.getDescricao());
    }
}
