import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../components/Modal';

describe('Modal Component', () => {
  it('does not render visible dialog content when open=false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test Modal">
        <p>Modal Body Content</p>
      </Modal>
    );
    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('hidden');
  });

  it('renders title, description and content when open=true', () => {
    render(
      <Modal
        open={true}
        onClose={() => {}}
        title="Create Warehouse Location"
        description="Fill details for new bin"
      >
        <p>Modal Body Content</p>
      </Modal>
    );

    expect(screen.getByText('Create Warehouse Location')).toBeInTheDocument();
    expect(screen.getByText('Fill details for new bin')).toBeInTheDocument();
    expect(screen.getByText('Modal Body Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <Modal open={true} onClose={handleClose} title="Closable Modal">
        <p>Content</p>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: /Close dialog/i });
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when native dialog cancel event (Escape) is triggered', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Escape Test">
        <p>Content</p>
      </Modal>
    );

    const dialog = document.querySelector('dialog')!;
    fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on backdrop click when closeOnBackdrop=true', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Backdrop Test" closeOnBackdrop={true}>
        <p>Content</p>
      </Modal>
    );

    const dialog = document.querySelector('dialog')!;
    // Click target directly on dialog element simulates backdrop click
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop click when closeOnBackdrop=false', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="No Backdrop Close" closeOnBackdrop={false}>
        <p>Content</p>
      </Modal>
    );

    const dialog = document.querySelector('dialog')!;
    fireEvent.click(dialog);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders action buttons in footer', () => {
    render(
      <Modal
        open={true}
        onClose={() => {}}
        title="Action Test"
        actions={<button type="button">Confirm Action</button>}
      >
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Confirm Action' })).toBeInTheDocument();
  });
});
