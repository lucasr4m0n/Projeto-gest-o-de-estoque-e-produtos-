import {
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  inativarProduto,
} from './produtoService.js';

describe('produtoService', () => {
  it('lista os produtos do mock', async () => {
    const produtos = await listarProdutos();
    expect(Array.isArray(produtos)).toBe(true);
    expect(produtos.length).toBeGreaterThan(0);
  });

  it('obtem um produto por id', async () => {
    const produto = await obterProduto(1);
    expect(produto.id).toBe(1);
  });

  it('rejeita produto inexistente', async () => {
    await expect(obterProduto(9999)).rejects.toThrow(/nao encontrado/i);
  });

  it('cria um novo produto com id incremental', async () => {
    const novo = await criarProduto({
      nome: 'Produto Teste',
      categoriaId: '1',
      fornecedorId: '1',
      unidade: 'UN',
      preco: '10.5',
      estoqueMinimo: '2',
    });
    expect(novo.id).toBeDefined();
    expect(novo.nome).toBe('Produto Teste');
    expect(novo.preco).toBe(10.5);
    expect(novo.ativo).toBe(true);
  });

  it('atualiza um produto existente', async () => {
    const atualizado = await atualizarProduto(1, {
      nome: 'Furadeira Editada',
      categoriaId: '1',
      fornecedorId: '1',
      unidade: 'UN',
      preco: '400',
      estoqueMinimo: '5',
    });
    expect(atualizado.nome).toBe('Furadeira Editada');
    expect(atualizado.preco).toBe(400);
  });

  it('rejeita atualizacao de produto inexistente', async () => {
    await expect(
      atualizarProduto(9999, {
        nome: 'X',
        categoriaId: '1',
        fornecedorId: '1',
        preco: '1',
        estoqueMinimo: '1',
      }),
    ).rejects.toThrow(/nao encontrado/i);
  });

  it('inativa um produto', async () => {
    await inativarProduto(3);
    const produtos = await listarProdutos();
    const p = produtos.find((x) => x.id === 3);
    expect(p.ativo).toBe(false);
  });

  it('rejeita inativacao de produto inexistente', async () => {
    await expect(inativarProduto(9999)).rejects.toThrow(/nao encontrado/i);
  });
});
