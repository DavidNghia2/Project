import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import {
  AnimatedCounter,
  MotionRoot,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToastProvider,
  Tooltip,
  useToast,
} from '../index';
import { CommandPalette } from '../../layouts/CommandPalette';

const ToastTriggerDemo = () => {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast.success('Saved voucher IN-2026-099', 'Success')}>
      Trigger Toast
    </button>
  );
};

describe('Motion Design System Components', () => {
  it('supports Tabs compound component with sliding/ink variants and keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MotionRoot>
        <Tabs value="draft" onValueChange={handleChange} variant="ink">
          <TabsList aria-label="Order status">
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="draft">Draft panel</TabsContent>
          <TabsContent value="approved">Approved panel</TabsContent>
        </Tabs>
      </MotionRoot>
    );

    const draftTab = screen.getByRole('tab', { name: 'Draft' });
    expect(draftTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Draft panel')).toBeInTheDocument();

    draftTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(handleChange).toHaveBeenCalledWith('approved');
  });

  it('dispatches and dismisses floating toasts via ToastProvider', async () => {
    const user = userEvent.setup();
    render(
      <MotionRoot>
        <ToastProvider>
          <ToastTriggerDemo />
        </ToastProvider>
      </MotionRoot>
    );

    await user.click(screen.getByRole('button', { name: 'Trigger Toast' }));
    expect(screen.getByText('Saved voucher IN-2026-099')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    await waitFor(() => {
      expect(screen.queryByText('Saved voucher IN-2026-099')).not.toBeInTheDocument();
    });
  });

  it('reveals accessible Tooltip on hover/focus and closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <MotionRoot>
        <Tooltip content="Edit SKU" delayMs={0}>
          <button type="button">Edit</button>
        </Tooltip>
      </MotionRoot>
    );

    await user.hover(screen.getByRole('button', { name: 'Edit' }));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Edit SKU');
    });

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('renders AnimatedCounter with exact single-node textContent', () => {
    render(
      <I18nProvider>
        <MotionRoot>
          <div data-testid="counter-box">
            <AnimatedCounter value={1420} />
          </div>
        </MotionRoot>
      </I18nProvider>
    );

    expect(screen.getByTestId('counter-box')).toHaveTextContent('1,420');
  });

  it('filters and selects commands inside CommandPalette', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSelectWarehouse = vi.fn();

    render(
      <I18nProvider>
        <MotionRoot>
          <MemoryRouter>
            <CommandPalette
              open={true}
              onClose={onClose}
              activeWarehouse="ALL"
              onSelectWarehouse={onSelectWarehouse}
            />
          </MemoryRouter>
        </MotionRoot>
      </I18nProvider>
    );

    const search = screen.getByRole('textbox');
    await user.type(search, 'WH-02');
    await user.keyboard('{Enter}');

    expect(onSelectWarehouse).toHaveBeenCalledWith('WH-02');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
