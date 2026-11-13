import {
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  inativarProduto,
} from './produtoService.js';
import api from './api.js';

jest.mock('./api.js', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

const produtoApi = {
  id: 1,
  nome: 'Furadeira',
  descricao: '',
  categoriaId: 1,
  categoriaNome: 'Ferramentas',
  precoCusto: 150,
  quantidadeEstoque: 12,
  estoqueMinimo: 5,
  unidadeMedida: 'UN',
  ativo: true,
};

describe('produtoService (com Axios Mockado)', () => {
  it('lista os produtos e traduz os campos da API para a tela', async () => {
    api.get.mockResolvedValueOnce({ data: [produtoApi] });

    const produtos = await listarProdutos();

    expect(api.get).toHaveBeenCalledWith('/produtos');
    expect(produtos[0]).toEqual(
      expect.objectContaining({ id: 1, nome: 'Furadeira', preco: 150, saldoAtual: 12, unidade: 'UN' }),
    );
  });

  it('obtem um produto por id', async () => {
    api.get.mockResolvedValueOnce({ data: produtoApi });

    const produto = await obterProduto(1);

    expect(api.get).toHaveBeenCalledWith('/produtos/1');
    expect(produto.id).toBe(1);
    expect(produto.saldoAtual).toBe(12);
  });

  it('cria um produto enviando os nomes de campo da API', async () => {
    const dadosNovo = {
      nome: 'Produto Teste',
      descricao: '',
      categoriaId: '1',
      fornecedorId: '1',
      unidade: 'UN',
      preco: '10.5',
      estoqueMinimo: '2',
    };
    api.post.mockResolvedValueOnce({
      data: { ...produtoApi, id: 10, nome: 'Produto Teste', precoCusto: 10.5 },
    });

    const novo = await criarProduto(dadosNovo);

    expect(api.post).toHaveBeenCalledWith('/produtos', {
      nome: 'Produto Teste',
      descricao: '',
      categoriaId: 1,
      precoCusto: 10.5,
      estoqueMinimo: 2,
      unidadeMedida: 'UN',
    });
    expect(novo.id).toBe(10);
    expect(novo.preco).toBe(10.5);
  });

  it('atualiza um produto existente', async () => {
    const dadosUpdate = {
      nome: 'Furadeira Editada',
      descricao: '',
      categoriaId: '1',
      fornecedorId: '1',
      unidade: 'UN',
      preco: '400',
      estoqueMinimo: '5',
    };
    api.put.mockResolvedValueOnce({
      data: { ...produtoApi, nome: 'Furadeira Editada', precoCusto: 400 },
    });

    const atualizado = await atualizarProduto(1, dadosUpdate);

    expect(api.put).toHaveBeenCalledWith('/produtos/1', {
      nome: 'Furadeira Editada',
      descricao: '',
      categoriaId: 1,
      precoCusto: 400,
      estoqueMinimo: 5,
      unidadeMedida: 'UN',
    });
    expect(atualizado.nome).toBe('Furadeira Editada');
    expect(atualizado.preco).toBe(400);
  });

  it('inativa um produto via PATCH /inativar', async () => {
    api.patch.mockResolvedValueOnce({ data: { ...produtoApi, id: 3, ativo: false } });

    const inativo = await inativarProduto(3);

    expect(api.patch).toHaveBeenCalledWith('/produtos/3/inativar');
    expect(inativo.ativo).toBe(false);
  });
});