package com.gestaoestoque.backend.controller;

import com.gestaoestoque.backend.dto.PedidoCompraRequest;
import com.gestaoestoque.backend.dto.PedidoCompraResponse;
import com.gestaoestoque.backend.dto.PedidoCompraStatusRequest;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.model.Usuario;
import com.gestaoestoque.backend.repository.UsuarioRepository;
import com.gestaoestoque.backend.service.PedidoCompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class PedidoCompraController {
    private final PedidoCompraService service;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public List<PedidoCompraResponse> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public PedidoCompraResponse buscar(@PathVariable Long id) { return service.buscarPorId(id); }

    @PostMapping
    public PedidoCompraResponse criar(@Valid @RequestBody PedidoCompraRequest request) { return service.criar(request); }

    @PatchMapping("/{id}/status")
    public PedidoCompraResponse atualizarStatus(
            @PathVariable Long id,
            @RequestHeader("X-Usuario-Id") Long usuarioId,
            @Valid @RequestBody PedidoCompraStatusRequest request) {
        return service.atualizarStatus(id, request.status(), buscarUsuario(usuarioId));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));
    }
}
