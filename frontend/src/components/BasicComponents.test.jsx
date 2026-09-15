import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button.jsx';
import Input from './Input.jsx';
import Select from './Select.jsx';
import Badge from './Badge.jsx';
import Spinner from './Spinner.jsx';

describe('Button', () => {
  it('renderiza o rotulo e dispara onClick', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Salvar</Button>);
    fireEvent.click(screen.getByText('Salvar'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fica desabilitado durante o carregamento', () => {
    render(<Button loading>Enviar</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('aplica a variante informada', () => {
    render(<Button variant="danger">Remover</Button>);
    expect(screen.getByRole('button').className).toMatch(/danger/);
  });
});

describe('Input', () => {
  it('renderiza label e propaga alteracoes', () => {
    const onChange = jest.fn();
    render(<Input label="Nome" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('exibe mensagem de erro e marca aria-invalid', () => {
    render(<Input label="Email" error="Campo obrigatorio" />);
    expect(screen.getByText('Campo obrigatorio')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Select', () => {
  it('renderiza opcoes e placeholder', () => {
    render(
      <Select
        label="Categoria"
        placeholder="Todas"
        options={[
          { value: '1', label: 'Ferramentas' },
          { value: '2', label: 'Eletrica' },
        ]}
      />,
    );
    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText('Ferramentas')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('exibe erro quando fornecido', () => {
    render(<Select label="Fornecedor" error="Selecione" options={[]} />);
    expect(screen.getByText('Selecione')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('aplica o tom danger', () => {
    render(<Badge tone="danger">Critico</Badge>);
    expect(screen.getByText('Critico').className).toMatch(/danger/);
  });
});

describe('Spinner', () => {
  it('possui papel de status acessivel', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
