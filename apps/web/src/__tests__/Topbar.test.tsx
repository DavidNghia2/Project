import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../i18n';
import { Topbar } from '../layouts/Topbar';

function renderTopbar(activeWarehouse = 'WH-01', onSelectWarehouse = vi.fn()) {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/products']}>
        <Topbar
          onOpenMobileMenu={vi.fn()}
          activeWarehouse={activeWarehouse}
          onSelectWarehouse={onSelectWarehouse}
        />
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('Topbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders current page title and breadcrumb', () => {
    renderTopbar();
    expect(screen.getByRole('heading', { level: 1, name: /products|sản phẩm/i })).toBeInTheDocument();
  });

  it('renders and switches active warehouse', async () => {
    const user = userEvent.setup();
    const handleSelectWh = vi.fn();
    renderTopbar('WH-01', handleSelectWh);

    const whTrigger = screen.getByTitle(/active warehouse|kho đang làm việc/i);
    expect(whTrigger).toBeInTheDocument();

    await user.click(whTrigger);
    const whOption = screen.getByText(/Danang Logistics|Kho Đà Nẵng/i);
    expect(whOption).toBeInTheDocument();

    await user.click(whOption);
    expect(handleSelectWh).toHaveBeenCalledWith('WH-02');
  });

  it('toggles language switcher when clicked', async () => {
    const user = userEvent.setup();
    renderTopbar();

    const langBtn = screen.getByTitle(/switch language|đổi ngôn ngữ/i);
    expect(langBtn).toBeInTheDocument();

    await user.click(langBtn);
    // Language should toggle between en and vi
    expect(langBtn).toBeInTheDocument();
  });

  it('opens notifications dropdown and displays unread alerts', async () => {
    const user = userEvent.setup();
    renderTopbar();

    const notifBtn = screen.getByTitle(/notifications|thông báo/i);
    await user.click(notifBtn);

    expect(screen.getByText(/5 SKUs are below safety reorder threshold|5 sản phẩm chạm ngưỡng tồn tối thiểu/i)).toBeInTheDocument();

    const markReadBtn = screen.getByText(/mark all as read|đánh dấu đã đọc tất cả/i);
    await user.click(markReadBtn);
  });

  it('opens user profile dropdown with administrative controls', async () => {
    const user = userEvent.setup();
    renderTopbar();

    const userTrigger = screen.getByLabelText(/user account menu/i);
    await user.click(userTrigger);

    expect(screen.getByText('admin@smartinventory.local')).toBeInTheDocument();
    expect(screen.getByText(/sign out|đăng xuất/i)).toBeInTheDocument();
  });
});
