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

describe('categoriaService', () => {
  it('executa o ciclo CRUD', async () => {
    const lista = await listarCategorias();
    expect(lista.length).toBeGreaterThan(0);

    const nova = await criarCategoria({ nome: 'Nova', descricao: 'x' });
    expect(nova.id).toBeDefined();

    const atualizada = await atualizarCategoria(nova.id, { nome: 'Nova Ed.', descricao: 'y' });
    expect(atualizada.nome).toBe('Nova Ed.');

    const removida = await removerCategoria(nova.id);
    expect(removida.id).toBe(nova.id);
  });

  it('rejeita operacoes em categoria inexistente', async () => {
    await expect(atualizarCategoria(9999, { nome: 'x' })).rejects.toThrow(/nao encontrada/i);
    await expect(removerCategoria(9999)).rejects.toThrow(/nao encontrada/i);
  });
});

describe('fornecedorService', () => {
  it('executa o ciclo CRUD', async () => {
    const lista = await listarFornecedores();
    expect(lista.length).toBeGreaterThan(0);

    const novo = await criarFornecedor({
      nome: 'Forn Teste',
      cnpj: '11.222.333/0001-81',
      email: 'a@a.com',
    });
    expect(novo.id).toBeDefined();

    const atualizado = await atualizarFornecedor(novo.id, { nome: 'Forn Ed.' });
    expect(atualizado.nome).toBe('Forn Ed.');

    const removido = await removerFornecedor(novo.id);
    expect(removido.id).toBe(novo.id);
  });

  it('rejeita operacoes em fornecedor inexistente', async () => {
    await expect(atualizarFornecedor(9999, { nome: 'x' })).rejects.toThrow(/nao encontrado/i);
    await expect(removerFornecedor(9999)).rejects.toThrow(/nao encontrado/i);
  });
});
