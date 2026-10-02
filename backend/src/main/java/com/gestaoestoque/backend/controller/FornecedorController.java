package com.gestaoestoque.backend.controller;

import com.gestaoestoque.backend.dto.FornecedorRequest;
import com.gestaoestoque.backend.dto.FornecedorResponse;
import com.gestaoestoque.backend.service.FornecedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fornecedores")
@RequiredArgsConstructor
public class FornecedorController {
    private final FornecedorService service;

    @GetMapping
    public List<FornecedorResponse> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public FornecedorResponse buscar(@PathVariable Long id) { return service.buscarPorId(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FornecedorResponse criar(@Valid @RequestBody FornecedorRequest request) { return service.criar(request); }

    @PutMapping("/{id}")
    public FornecedorResponse atualizar(@PathVariable Long id, @Valid @RequestBody FornecedorRequest request) { return service.atualizar(id, request); }

    @PatchMapping("/{id}/inativar")
    public FornecedorResponse inativar(@PathVariable Long id) { return service.inativar(id); }

    @PatchMapping("/{id}/ativar")
    public FornecedorResponse ativar(@PathVariable Long id) { return service.ativar(id); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) { service.remover(id); }
}
