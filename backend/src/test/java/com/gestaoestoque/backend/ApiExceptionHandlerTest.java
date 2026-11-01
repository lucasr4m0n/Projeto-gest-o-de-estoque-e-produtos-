package com.gestaoestoque.backend;

import com.gestaoestoque.backend.exception.ApiExceptionHandler;
import com.gestaoestoque.backend.exception.EstoqueInsuficienteException;
import com.gestaoestoque.backend.exception.RecursoNaoEncontradoException;
import com.gestaoestoque.backend.exception.RegraNegocioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ApiExceptionHandlerTest {

    private final ApiExceptionHandler handler = new ApiExceptionHandler();
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        request.setRequestURI("/api/teste");
    }

    @SuppressWarnings("unused")
    private void metodoDummy(String arg) { }

    private MethodParameter methodParameter() throws NoSuchMethodException {
        return new MethodParameter(getClass().getDeclaredMethod("metodoDummy", String.class), 0);
    }

    private void assertResposta(ResponseEntity<Map<String, Object>> response, int status, String mensagem) {
        assertEquals(status, response.getStatusCode().value());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(status, body.get("status"));
        assertEquals(mensagem, body.get("mensagem"));
        assertEquals("/api/teste", body.get("path"));
        assertNotNull(body.get("timestamp"));
    }

    @Test
    void deveRetornar404ParaRecursoNaoEncontrado() {
        var response = handler.handleNotFound(new RecursoNaoEncontradoException("Produto nao encontrado."), request);
        assertResposta(response, 404, "Produto nao encontrado.");
    }

    @Test
    void deveRetornar422ParaRegraDeNegocio() {
        var response = handler.handleBusiness(new RegraNegocioException("Regra violada."), request);
        assertResposta(response, 422, "Regra violada.");
    }

    @Test
    void deveRetornar422ParaEstoqueInsuficiente() {
        var response = handler.handleBusiness(new EstoqueInsuficienteException("Sem estoque."), request);
        assertResposta(response, 422, "Sem estoque.");
    }

    @Test
    @SuppressWarnings("unchecked")
    void deveRetornar400ComCamposParaValidacao() throws Exception {
        BeanPropertyBindingResult binding = new BeanPropertyBindingResult(new Object(), "request");
        binding.addError(new FieldError("request", "cnpj", "O CNPJ deve conter 14 digitos"));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter(), binding);

        var response = handler.handleValidation(ex, request);

        assertResposta(response, 400, "Um ou mais campos sao invalidos.");
        Map<String, String> campos = (Map<String, String>) response.getBody().get("campos");
        assertEquals("O CNPJ deve conter 14 digitos", campos.get("cnpj"));
    }

    @Test
    void deveRetornar400ParaJsonMalformado() {
        var ex = new HttpMessageNotReadableException("json invalido", new MockHttpInputMessage(new byte[0]));
        var response = handler.handleNotReadable(ex, request);
        assertResposta(response, 400, "Corpo da requisicao invalido ou malformado.");
    }

    @Test
    void deveRetornar400ParaTipoDeParametroInvalido() throws Exception {
        var ex = new MethodArgumentTypeMismatchException("abc", Long.class, "id", methodParameter(), null);
        var response = handler.handleTypeMismatch(ex, request);
        assertResposta(response, 400, "Parametro invalido: id");
    }

    @Test
    void deveRetornar401ParaFalhaDeAutenticacao() {
        var response = handler.handleAuthentication(new BadCredentialsException("senha errada"), request);
        assertResposta(response, 401, "Credenciais invalidas.");
    }

    @Test
    void deveRetornar403ParaAcessoNegado() {
        var response = handler.handleAccessDenied(new AccessDeniedException("negado"), request);
        assertResposta(response, 403, "Acesso negado.");
    }

    @Test
    void deveRetornar405ParaOperacaoNaoSuportada() {
        var response = handler.handleUnsupported(new UnsupportedOperationException("Nao suportado."), request);
        assertResposta(response, 405, "Nao suportado.");
    }

    @Test
    void deveRespeitarStatusDasExcecoesDoSpringMvc() {
        var response = handler.handleUnexpected(new HttpRequestMethodNotSupportedException("DELETE"), request);
        assertEquals(405, response.getStatusCode().value());
        assertEquals(405, response.getBody().get("status"));
    }

    @Test
    void deveRetornar500SemVazarDetalhesInternos() {
        var response = handler.handleUnexpected(new RuntimeException("senha do banco: 123"), request);

        assertResposta(response, 500, "Erro interno do servidor.");
        assertFalse(response.getBody().toString().contains("senha do banco"));
    }
}