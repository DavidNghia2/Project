import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '../components/Alert';
import { Checkbox } from '../components/Checkbox';

describe('Alert and Checkbox Components', () => {
  it('renders alert variants with message and title', () => {
    render(
      <Alert
        variant="warning"
        title="Stock Warning"
        message="SKU threshold reached"
      />
    );
    expect(screen.getByText('Stock Warning')).toBeInTheDocument();
    expect(screen.getByText('SKU threshold reached')).toBeInTheDocument();
  });

  it('calls onDismiss when alert dismiss button is clicked', async () => {
    const user = userEvent.setup();
    let dismissed = false;
    render(
      <Alert
        variant="error"
        message="Critical Error"
        dismissible
        onDismiss={() => { dismissed = true; }}
      />
    );
    const dismissBtn = screen.getByRole('button', { name: /Dismiss alert/i });
    await user.click(dismissBtn);
    expect(dismissed).toBe(true);
  });

  it('renders indeterminate checkbox correctly', () => {
    render(<Checkbox label="Tri-state Checkbox" checked={false} indeterminate={true} />);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });
});
