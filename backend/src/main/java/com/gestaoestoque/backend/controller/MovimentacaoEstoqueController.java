package com.gestaoestoque.backend.controller;

import com.gestaoestoque.backend.dto.MovimentacaoRequest;
import com.gestaoestoque.backend.dto.MovimentacaoResponse;
import com.gestaoestoque.backend.model.Usuario;
import com.gestaoestoque.backend.repository.UsuarioRepository;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.service.MovimentacaoEstoqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
@RequiredArgsConstructor
public class MovimentacaoEstoqueController {
    private final MovimentacaoEstoqueService service;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public List<MovimentacaoResponse> listar() { return service.listar(); }

    @GetMapping("/produto/{produtoId}")
    public List<MovimentacaoResponse> listarPorProduto(@PathVariable Long produtoId) { return service.listarPorProduto(produtoId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovimentacaoResponse registrar(
            @RequestHeader("X-Usuario-Id") Long usuarioId,
            @Valid @RequestBody MovimentacaoRequest request) {
        return service.registrar(request, buscarUsuario(usuarioId));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));
    }
}
