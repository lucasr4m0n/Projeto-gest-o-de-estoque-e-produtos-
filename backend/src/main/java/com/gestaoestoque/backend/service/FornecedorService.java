package com.gestaoestoque.backend.service;

import com.gestaoestoque.backend.dto.FornecedorRequest;
import com.gestaoestoque.backend.dto.FornecedorResponse;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.model.Fornecedor;
import com.gestaoestoque.backend.repository.FornecedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FornecedorService {
    private final FornecedorRepository repository;

    @Transactional(readOnly = true)
    public List<FornecedorResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public FornecedorResponse buscarPorId(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public FornecedorResponse criar(FornecedorRequest request) {
        String cnpj = normalizarCnpj(request.cnpj());
        if (repository.existsByCnpj(cnpj)) {
            throw new RegraNegocioException("Ja existe um fornecedor com este CNPJ.");
        }
        Fornecedor fornecedor = Fornecedor.builder()
                .razaoSocial(request.razaoSocial().trim())
                .cnpj(cnpj)
                .email(request.email())
                .telefone(request.telefone())
                .ativo(true)
                .build();
        return toResponse(repository.save(fornecedor));
    }

    @Transactional
    public FornecedorResponse atualizar(Long id, FornecedorRequest request) {
        Fornecedor fornecedor = buscarEntidade(id);
        String cnpj = normalizarCnpj(request.cnpj());
        if (!cnpj.equals(fornecedor.getCnpj()) && repository.existsByCnpj(cnpj)) {
            throw new RegraNegocioException("Ja existe um fornecedor com este CNPJ.");
        }
        fornecedor.setRazaoSocial(request.razaoSocial().trim());
        fornecedor.setCnpj(cnpj);
        fornecedor.setEmail(request.email());
        fornecedor.setTelefone(request.telefone());
        return toResponse(repository.save(fornecedor));
    }

    @Transactional
    public FornecedorResponse inativar(Long id) {
        Fornecedor fornecedor = buscarEntidade(id);
        fornecedor.setAtivo(false);
        return toResponse(repository.save(fornecedor));
    }

    @Transactional
    public FornecedorResponse ativar(Long id) {
        Fornecedor fornecedor = buscarEntidade(id);
        fornecedor.setAtivo(true);
        return toResponse(repository.save(fornecedor));
    }

    @Transactional
    public void remover(Long id) {
        Fornecedor fornecedor = buscarEntidade(id);
        try {
            repository.delete(fornecedor);
            repository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new RegraNegocioException("O fornecedor nao pode ser removido porque possui pedidos vinculados.");
        }
    }

    private Fornecedor buscarEntidade(Long id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor nao encontrado."));
    }

    private String normalizarCnpj(String cnpj) {
        return cnpj.replaceAll("\\D", "");
    }

    private FornecedorResponse toResponse(Fornecedor f) {
        return new FornecedorResponse(f.getId(), f.getRazaoSocial(), f.getCnpj(), f.getEmail(), f.getTelefone(), f.getAtivo());
    }
}
