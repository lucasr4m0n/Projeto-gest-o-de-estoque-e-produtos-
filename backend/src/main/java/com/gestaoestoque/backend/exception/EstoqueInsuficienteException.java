package com.gestaoestoque.backend.exception;

public class EstoqueInsuficienteException extends RegraNegocioException {
    public EstoqueInsuficienteException(String mensagem) {
        super(mensagem);
    }
}
