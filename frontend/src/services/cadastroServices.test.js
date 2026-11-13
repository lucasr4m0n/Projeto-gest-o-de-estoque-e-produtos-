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
    // Listar: razaoSocial vira nome, CNPJ ganha mascara, telefone nulo vira texto vazio
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          razaoSocial: 'Forn Antigo',
          cnpj: '00000000000100',
          email: 'a@a.com',
          telefone: null,
          ativo: true,
        },
      ],
    });
    const lista = await listarFornecedores();
    expect(api.get).toHaveBeenCalledWith('/fornecedores');
    expect(lista[0]).toEqual(
      expect.objectContaining({
        id: 1,
        nome: 'Forn Antigo',
        cnpj: '00.000.000/0001-00',
        telefone: '',
      }),
    );
    expect(lista[0].razaoSocial).toBeUndefined();

    // Criar: a tela envia nome e CNPJ mascarado; a API recebe razaoSocial e so digitos
    const dadosNovo = {
      nome: 'Forn Teste',
      cnpj: '11.222.333/0001-81',
      email: 'a@a.com',
      telefone: '',
    };
    api.post.mockResolvedValueOnce({
      data: {
        id: 20,
        razaoSocial: 'Forn Teste',
        cnpj: '11222333000181',
        email: 'a@a.com',
        telefone: '',
        ativo: true,
      },
    });
    const novo = await criarFornecedor(dadosNovo);
    expect(api.post).toHaveBeenCalledWith('/fornecedores', {
      razaoSocial: 'Forn Teste',
      cnpj: '11222333000181',
      email: 'a@a.com',
      telefone: '',
    });
    expect(novo.id).toBe(20);
    expect(novo.nome).toBe('Forn Teste');
    expect(novo.cnpj).toBe('11.222.333/0001-81');

    // Atualizar
    const dadosAtualizacao = { ...dadosNovo, nome: 'Forn Ed.' };
    api.put.mockResolvedValueOnce({
      data: {
        id: 20,
        razaoSocial: 'Forn Ed.',
        cnpj: '11222333000181',
        email: 'a@a.com',
        telefone: '',
        ativo: true,
      },
    });
    const atualizado = await atualizarFornecedor(20, dadosAtualizacao);
    expect(api.put).toHaveBeenCalledWith('/fornecedores/20', {
      razaoSocial: 'Forn Ed.',
      cnpj: '11222333000181',
      email: 'a@a.com',
      telefone: '',
    });
    expect(atualizado.nome).toBe('Forn Ed.');

    // Remover
    api.delete.mockResolvedValueOnce({ data: { id: 20 } });
    const removido = await removerFornecedor(20);
    expect(api.delete).toHaveBeenCalledWith('/fornecedores/20');
    expect(removido.id).toBe(20);
  });
});