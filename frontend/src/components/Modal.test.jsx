import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal.jsx';

describe('Modal', () => {
  it('nao renderiza quando fechado', () => {
    render(
      <Modal open={false} title="Titulo" onClose={() => {}}>
        <p>Conteudo</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza titulo e conteudo quando aberto', () => {
    render(
      <Modal open title="Novo produto" onClose={() => {}} footer={<button>OK</button>}>
        <p>Corpo do modal</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Novo produto')).toBeInTheDocument();
    expect(screen.getByText('Corpo do modal')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('fecha ao pressionar Esc', () => {
    const onClose = jest.fn();
    render(
      <Modal open title="T" onClose={onClose}>
        <p>x</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('fecha ao clicar no botao de fechar', () => {
    const onClose = jest.fn();
    render(
      <Modal open title="T" onClose={onClose}>
        <p>x</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });
});
