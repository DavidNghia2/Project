import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/Button';

describe('Button Component', () => {
  it('renders button with label', () => {
    render(<Button>Submit Order</Button>);
    expect(screen.getByRole('button', { name: /Submit Order/i })).toBeInTheDocument();
  });

  it('renders all variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-[#2563EB]');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-white');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-[#DC2626]');
  });

  it('handles click events when enabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    await user.click(screen.getByRole('button', { name: /Click Me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: /Disabled Button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('pointer-events-none');
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('displays loading spinner and is disabled when loading=true', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: /Loading/i })).toBeInTheDocument();
  });

  it('renders left and right icons when provided', () => {
    render(
      <Button
        iconLeft={<span data-testid="left-icon">L</span>}
        iconRight={<span data-testid="right-icon">R</span>}
      >
        Icon Button
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
