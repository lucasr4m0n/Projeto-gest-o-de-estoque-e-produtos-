import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination.jsx';

describe('Pagination', () => {
  it('exibe faixa, pagina atual e navega', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination
        page={2}
        totalPages={3}
        totalItems={12}
        pageSize={5}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('Exibindo 6-10 de 12')).toBeInTheDocument();
    expect(screen.getByText('Pagina 2 de 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pagina anterior' }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: 'Proxima pagina' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('nao renderiza sem itens', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} totalItems={0} pageSize={5} onPageChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
