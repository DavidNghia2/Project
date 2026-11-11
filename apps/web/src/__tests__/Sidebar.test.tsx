import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../i18n';
import { Sidebar } from '../layouts/Sidebar';

function renderSidebar(collapsed = false, onToggleCollapse = vi.fn()) {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={vi.fn()}
        />
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('Sidebar Component', () => {
  it('renders all primary navigation links', () => {
    renderSidebar(false);

    expect(screen.getByText('Smart Inventory')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard|bảng điều khiển/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products|sản phẩm/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /warehouses|kho hàng/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /categories|danh mục/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /units of measure|đơn vị tính/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /suppliers|nhà cung cấp/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /stock in|nhập kho/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /stock out|xuất kho/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /stocktaking|kiểm kê/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reports|báo cáo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alerts|cảnh báo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /users & roles|người dùng & quyền/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings|cài đặt/i })).toBeInTheDocument();
  });

  it('indicates active route correctly', () => {
    renderSidebar(false);
    const dashboardLink = screen.getByRole('link', { name: /dashboard|bảng điều khiển/i });
    expect(dashboardLink.className).toContain('bg-blue-50');
  });

  it('renders badges on appropriate navigation items', () => {
    renderSidebar(false);
    expect(screen.getByText('3')).toBeInTheDocument(); // Stock-In pending
    expect(screen.getByText('5')).toBeInTheDocument(); // Alerts count
  });

  it('calls onToggleCollapse when collapse button is clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    renderSidebar(false, handleToggle);

    const toggleBtn = screen.getByRole('button', { name: /collapse sidebar|thu gọn thanh bên/i });
    await user.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('renders compact mode with icon tooltips when collapsed without squishing logo', () => {
    renderSidebar(true);
    expect(screen.queryByText('Smart Inventory')).not.toBeInTheDocument();
    const expandBtn = screen.getByRole('button', { name: /expand sidebar|mở rộng thanh bên/i });
    expect(expandBtn).toBeInTheDocument();

    const logoLink = screen.getByTitle('Smart Inventory');
    expect(logoLink.className).toContain('shrink-0');
    const logoBox = logoLink.firstElementChild as HTMLElement;
    expect(logoBox.className).toContain('w-9');
    expect(logoBox.className).toContain('h-9');
    expect(logoBox.className).toContain('shrink-0');
  });
});
