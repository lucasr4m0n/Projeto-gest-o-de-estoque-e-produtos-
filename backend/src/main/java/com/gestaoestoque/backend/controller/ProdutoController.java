package com.gestaoestoque.backend.controller;

import com.gestaoestoque.backend.dto.ProdutoRequest;
import com.gestaoestoque.backend.dto.ProdutoResponse;
import com.gestaoestoque.backend.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {
    private final ProdutoService service;

    @GetMapping
    public List<ProdutoResponse> listar() { return service.listar(); }

    @GetMapping("/ativos")
    public List<ProdutoResponse> listarAtivos() { return service.listarAtivos(); }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable Long id) { return service.buscarPorId(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoResponse criar(@Valid @RequestBody ProdutoRequest request) { return service.criar(request); }

    @PutMapping("/{id}")
    public ProdutoResponse atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoRequest request) { return service.atualizar(id, request); }

    @PatchMapping("/{id}/inativar")
    public ProdutoResponse inativar(@PathVariable Long id) { return service.inativar(id); }

    @PatchMapping("/{id}/ativar")
    public ProdutoResponse ativar(@PathVariable Long id) { return service.ativar(id); }

}
