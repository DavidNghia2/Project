import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../components/Input';

describe('Input Component', () => {
  it('renders with label and links correctly via htmlFor', () => {
    render(<Input label="SKU Code" placeholder="Enter SKU" />);
    const label = screen.getByText('SKU Code').closest('label');
    const input = screen.getByPlaceholderText('Enter SKU');
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('renders required indicator when required=true', () => {
    render(<Input label="Required Field" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('renders error message and sets aria-invalid', () => {
    render(<Input label="Item Count" error="Invalid quantity value" />);
    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveTextContent('Invalid quantity value');

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', errorMsg.id);
  });

  it('renders hint message when no error is present', () => {
    render(<Input label="Barcode" hint="Scan the 12-digit code" />);
    expect(screen.getByText('Scan the 12-digit code')).toBeInTheDocument();
  });

  it('handles typing and onChange events', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input label="Search" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Motor');
    expect(handleChange).toHaveBeenCalled();
  });

  it('respects disabled state', async () => {
    render(<Input label="Locked Field" disabled value="Fixed Value" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveValue('Fixed Value');
  });

  it('displays character counter when maxLength and showCharCount are set', () => {
    render(
      <Input
        label="Serial"
        maxLength={10}
        showCharCount
        value="ABCDE"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });
});
