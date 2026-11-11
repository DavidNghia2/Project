import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, type BadgeVariant } from '../components/Badge';

describe('Badge Component', () => {
  const variants: BadgeVariant[] = ['success', 'warning', 'error', 'info', 'neutral', 'primary'];

  it.each(variants)('renders %s variant correctly', (variant) => {
    render(<Badge variant={variant}>{variant.toUpperCase()}</Badge>);
    const badge = screen.getByText(variant.toUpperCase());
    expect(badge).toBeInTheDocument();
  });

  it('renders status dot when dot=true', () => {
    const { container } = render(
      <Badge variant="success" dot>
        Active Stock
      </Badge>
    );

    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('rounded-full');
  });

  it('does not render status dot when dot=false', () => {
    const { container } = render(
      <Badge variant="warning" dot={false}>
        Pending Review
      </Badge>
    );

    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).not.toBeInTheDocument();
  });

  it('applies small size styling when size="sm"', () => {
    render(
      <Badge variant="info" size="sm">
        Small Badge
      </Badge>
    );

    const badgeContainer = screen.getByText('Small Badge').closest('.inline-flex');
    expect(badgeContainer).toHaveClass('text-[11px]');
  });
});
