import {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  removerCategoria,
} from './categoriaService.js';
import {
  listarFornecedores,
  criarFornecedor,
  atualizarFornecedor,
  removerFornecedor,
} from './fornecedorService.js';
import api from './api.js';

// Mock do cliente Axios centralizado
jest.mock('./api.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

describe('categoriaService (com Axios Mockado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executa o ciclo CRUD de categorias via API', async () => {
    const mockCategorias = [{ id: 1, nome: 'Eletrônicos', descricao: 'Geral' }];
    api.get.mockResolvedValueOnce({ data: mockCategorias });

    const lista = await listarCategorias();
    expect(api.get).toHaveBeenCalledWith('/categorias');
    expect(lista.length).toBeGreaterThan(0);

    const dadosNova = { nome: 'Nova', descricao: 'x' };
    const mockCriada = { id: 10, ...dadosNova };
    api.post.mockResolvedValueOnce({ data: mockCriada });

    const nova = await criarCategoria(dadosNova);
    expect(api.post).toHaveBeenCalledWith('/categorias', dadosNova);
    expect(nova.id).toBeDefined();

    const dadosAtualizacao = { nome: 'Nova Ed.', descricao: 'y' };
    const mockAtualizada = { id: 10, ...dadosAtualizacao };
    api.put.mockResolvedValueOnce({ data: mockAtualizada });

    const atualizada = await atualizarCategoria(10, dadosAtualizacao);
    expect(api.put).toHaveBeenCalledWith('/categorias/10', dadosAtualizacao);
    expect(atualizada.nome).toBe('Nova Ed.');

    api.delete.mockResolvedValueOnce({ data: { id: 10 } });
    const removida = await removerCategoria(10);
    expect(api.delete).toHaveBeenCalledWith('/categorias/10');
    expect(removida.id).toBe(10);
  });
});

describe('fornecedorService (com Axios Mockado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('executa o ciclo CRUD de fornecedores via API', async () => {
    const mockFornecedores = [{ id: 1, nome: 'Forn Antigo', cnpj: '00.000.000/0001-00', email: 'a@a.com' }];
    api.get.mockResolvedValueOnce({ data: mockFornecedores });

    const lista = await listarFornecedores();
    expect(api.get).toHaveBeenCalledWith('/fornecedores');
    expect(lista.length).toBeGreaterThan(0);

    const dadosNovo = {
      nome: 'Forn Teste',
      cnpj: '11.222.333/0001-81',
      email: 'a@a.com',
    };
    const mockCriado = { id: 20, ...dadosNovo };
    api.post.mockResolvedValueOnce({ data: mockCriado });

    const novo = await criarFornecedor(dadosNovo);
    expect(api.post).toHaveBeenCalledWith('/fornecedores', dadosNovo);
    expect(novo.id).toBeDefined();

    const dadosAtualizacao = { nome: 'Forn Ed.' };
    const mockAtualizado = { id: 20, ...dadosNovo, ...dadosAtualizacao };
    api.put.mockResolvedValueOnce({ data: mockAtualizado });

    const atualizado = await atualizarFornecedor(20, dadosAtualizacao);
    expect(api.put).toHaveBeenCalledWith('/fornecedores/20', dadosAtualizacao);
    expect(atualizado.nome).toBe('Forn Ed.');

    api.delete.mockResolvedValueOnce({ data: { id: 20 } });
    const removido = await removerFornecedor(20);
    expect(api.delete).toHaveBeenCalledWith('/fornecedores/20');
    expect(removido.id).toBe(20);
  });
});