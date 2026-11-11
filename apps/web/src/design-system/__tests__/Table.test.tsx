import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../components/Table';

describe('Table Component', () => {
  const sampleColumns = [
    { key: 'sku', label: 'SKU Code', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'qty', label: 'Quantity' },
  ];

  const sampleData = [
    { id: '1', sku: 'SKU-001', name: 'Electric Motor', qty: 50 },
    { id: '2', sku: 'SKU-002', name: 'Ball Bearing', qty: 120 },
  ];

  it('renders table headers and data rows correctly', () => {
    render(<Table columns={sampleColumns} data={sampleData} />);

    expect(screen.getByText('SKU Code')).toBeInTheDocument();
    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();

    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('Electric Motor')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    expect(screen.getByText('SKU-002')).toBeInTheDocument();
    expect(screen.getByText('Ball Bearing')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders 5 skeleton rows when loading=true', () => {
    render(<Table columns={sampleColumns} data={sampleData} loading={true} />);

    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-busy', 'true');

    // Data should not be visible during loading
    expect(screen.queryByText('Electric Motor')).not.toBeInTheDocument();

    const tbody = table.querySelector('tbody')!;
    expect(tbody.querySelectorAll('tr')).toHaveLength(5);
  });

  it('shows EmptyState when data is empty and loading=false', () => {
    render(
      <Table
        columns={sampleColumns}
        data={[]}
        loading={false}
        emptyTitle="No Items in Warehouse"
        emptyDescription="Please register your first product."
      />
    );

    expect(screen.getByText('No Items in Warehouse')).toBeInTheDocument();
    expect(screen.getByText('Please register your first product.')).toBeInTheDocument();
  });

  it('calls onSort callback when sortable column header is clicked', async () => {
    const user = userEvent.setup();
    const handleSort = vi.fn();

    render(
      <Table
        columns={sampleColumns}
        data={sampleData}
        sortBy="sku"
        sortDir="asc"
        onSort={handleSort}
      />
    );

    const skuHeader = screen.getByText('SKU Code');
    await user.click(skuHeader);

    expect(handleSort).toHaveBeenCalledWith('sku', 'desc');
  });

  it('handles row selection with checkboxes', async () => {
    const user = userEvent.setup();
    const handleSelectRow = vi.fn();
    const handleSelectAll = vi.fn();

    render(
      <Table
        columns={sampleColumns}
        data={sampleData}
        selectable={true}
        selectedRows={['1']}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('Select all rows');
    expect(selectAllCheckbox).toBeInTheDocument();

    const rowCheckboxes = screen.getAllByRole('checkbox');
    // Row 1 checkbox
    await user.click(rowCheckboxes[1]);
    expect(handleSelectRow).toHaveBeenCalledWith('1', false);
  });
});
