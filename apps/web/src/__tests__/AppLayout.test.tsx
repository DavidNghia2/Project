import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '../i18n';
import { AppLayout } from '../layouts/AppLayout';

function renderAppLayout() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<div>Dashboard Child Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('AppLayout Component', () => {
  it('renders main layout structure with desktop sidebar, topbar and content', () => {
    renderAppLayout();
    expect(screen.getByText('Dashboard Child Page')).toBeInTheDocument();
    expect(screen.getAllByText(/Smart Inventory/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/v1.0.0-rc/)).toBeInTheDocument();
  });

  it('handles mobile drawer opening and closing', async () => {
    const user = userEvent.setup();
    renderAppLayout();

    const mobileMenuBtn = screen.getByLabelText(/open navigation menu/i);
    await user.click(mobileMenuBtn);

    const drawer = screen.getByRole('dialog', { name: /mobile navigation drawer/i });
    expect(drawer).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/close navigation/i);
    await user.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /mobile navigation drawer/i })).not.toBeInTheDocument();
  });
});
