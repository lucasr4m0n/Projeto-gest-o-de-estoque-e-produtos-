import { listarMovimentacoes, registrarMovimentacao } from './movimentacaoService.js';
import api from './api.js';

jest.mock('./api.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

describe('movimentacaoService (com Axios Mockado)', () => {
  it('lista o historico e traduz os campos da API para a tela', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          produtoId: 1,
          produtoNome: 'Furadeira',
          usuarioId: 1,
          usuarioNome: 'Administrador do Sistema',
          tipoMovimentacao: 'ENTRADA',
          quantidade: 5,
          dataHora: '2026-11-01T10:00:00-03:00',
          observacao: 'Reposicao',
        },
      ],
    });

    const lista = await listarMovimentacoes();

    expect(api.get).toHaveBeenCalledWith('/movimentacoes');
    expect(lista[0]).toEqual(
      expect.objectContaining({
        tipo: 'ENTRADA',
        data: '2026-11-01T10:00:00-03:00',
        justificativa: 'Reposicao',
        usuario: 'Administrador do Sistema',
      }),
    );
  });

  it('registra uma movimentacao enviando os nomes de campo da API', async () => {
    api.post.mockResolvedValueOnce({
      data: { id: 10, produtoId: 1, tipoMovimentacao: 'ENTRADA', quantidade: 5, observacao: 'Reposicao' },
    });

    const nova = await registrarMovimentacao({
      produtoId: '1',
      tipo: 'ENTRADA',
      quantidade: '5',
      justificativa: 'Reposicao',
    });

    expect(api.post).toHaveBeenCalledWith(
      '/movimentacoes',
      { produtoId: 1, tipoMovimentacao: 'ENTRADA', quantidade: 5, observacao: 'Reposicao' },
      { headers: { 'X-Usuario-Id': 1 } },
    );
    expect(nova.tipo).toBe('ENTRADA');
  });
});