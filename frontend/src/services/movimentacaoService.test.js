import { listarMovimentacoes, registrarMovimentacao } from './movimentacaoService.js';
import api from './api.js';

// Mock do cliente Axios centralizado
jest.mock('./api.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

describe('movimentacaoService (com Axios Mockado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lista o historico de movimentacoes da API', async () => {
    const mockMovimentacoes = [
      {
        id: 1,
        produtoId: 1,
        produtoNome: 'Furadeira',
        tipo: 'ENTRADA',
        quantidade: 5,
        data: '2026-10-01T10:00:00Z',
      },
    ];
    api.get.mockResolvedValueOnce({ data: mockMovimentacoes });

    const lista = await listarMovimentacoes();
    expect(api.get).toHaveBeenCalledWith('/movimentacoes');
    expect(lista).toEqual(mockMovimentacoes);
  });

  it('registra uma nova movimentacao (ENTRADA ou SAIDA)', async () => {
    const dadosMov = {
      produtoId: 1,
      tipo: 'ENTRADA',
      quantidade: 5,
      justificativa: 'Reposição de stock',
      usuario: 'Tester',
    };
    const mockResposta = { id: 10, ...dadosMov, data: '2026-10-02T12:00:00Z' };
    api.post.mockResolvedValueOnce({ data: mockResposta });

    const novaMovimentacao = await registrarMovimentacao(dadosMov);
    expect(api.post).toHaveBeenCalledWith('/movimentacoes', dadosMov);
    expect(novaMovimentacao).toEqual(mockResposta);
  });
});