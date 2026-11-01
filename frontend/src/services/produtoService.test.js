import {
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  inativarProduto,
} from './produtoService.js';
import api from '../../src/services/api.js';

// Mock do cliente Axios centralizado
jest.mock('../../src/services/api.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

describe('produtoService (com Axios Mockado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lista os produtos da API', async () => {
    const mockProdutos = [{ id: 1, nome: 'Furadeira', preco: 150, ativo: true }];
    api.get.mockResolvedValueOnce({ data: mockProdutos });

    const produtos = await listarProdutos();
    expect(api.get).toHaveBeenCalledWith('/produtos');
    expect(produtos).toEqual(mockProdutos);
  });

  it('obtem um produto por id', async () => {
    const mockProduto = { id: 1, nome: 'Furadeira', preco: 150, ativo: true };
    api.get.mockResolvedValueOnce({ data: mockProduto });

    const produto = await obterProduto(1);
    expect(api.get).toHaveBeenCalledWith('/produtos/1');
    expect(produto.id).toBe(1);
  });

  it('cria um novo produto', async () => {
    const dadosNovo = {
      nome: 'Produto Teste',
      categoriaId: '1',
      fornecedorId: '1',
      unidade: 'UN',
      preco: '10.5',
      estoqueMinimo: '2',
    };
    const mockCriado = { id: 10, ...dadosNovo, preco: 10.5, ativo: true };
    api.post.mockResolvedValueOnce({ data: mockCriado });

    const novo = await criarProduto(dadosNovo);
    expect(api.post).toHaveBeenCalledWith('/produtos', dadosNovo);
    expect(novo.id).toBeDefined();
    expect(novo.nome).toBe('Produto Teste');
  });

  it('atualiza um produto existente', async () => {
    const dadosUpdate = {
      nome: 'Furadeira Editada',
      categoriaId: '1',
      fornecedorId: '1',
      unidade: 'UN',
      preco: '400',
      estoqueMinimo: '5',
    };
    const mockAtualizado = { id: 1, ...dadosUpdate, preco: 400 };
    api.put.mockResolvedValueOnce({ data: mockAtualizado });

    const atualizado = await atualizarProduto(1, dadosUpdate);
    expect(api.put).toHaveBeenCalledWith('/produtos/1', dadosUpdate);
    expect(atualizado.nome).toBe('Furadeira Editada');
    expect(atualizado.preco).toBe(400);
  });

  it('inativa um produto', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });

    await inativarProduto(3);
    // Verifica se chamou a rota correta de remoção ou inativação no back-end
    expect(api.delete).toHaveBeenCalledWith('/produtos/3');
  });
});