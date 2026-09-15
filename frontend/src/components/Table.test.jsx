import { render, screen } from '@testing-library/react';
import Table from './Table.jsx';

const columns = [
  { key: 'nome', header: 'Nome' },
  { key: 'saldo', header: 'Saldo', render: (row) => <span>{row.saldo} un</span> },
];

describe('Table', () => {
  it('exibe spinner quando loading', () => {
    render(<Table columns={columns} data={[]} loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('exibe mensagem de vazio', () => {
    render(<Table columns={columns} data={[]} emptyMessage="Nada aqui" />);
    expect(screen.getByText('Nada aqui')).toBeInTheDocument();
  });

  it('renderiza dados e colunas customizadas (RF-F03)', () => {
    const data = [
      { id: 1, nome: 'Furadeira', saldo: 12 },
      { id: 2, nome: 'Cabo', saldo: 3 },
    ];
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Furadeira')).toBeInTheDocument();
    expect(screen.getByText('12 un')).toBeInTheDocument();
    expect(screen.getByText('Cabo')).toBeInTheDocument();
  });
});
