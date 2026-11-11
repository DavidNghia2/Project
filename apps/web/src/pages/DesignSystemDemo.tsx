import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Badge,
  Card,
  Table,
  Modal,
  Dropdown,
  Spinner,
  Skeleton,
  SkeletonTable,
  EmptyState,
  Alert,
} from '../design-system';

export const DesignSystemDemo: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation();

  // State for interactive controls
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputValue, setInputValue] = useState('SKU-88291');
  const [inputError, setInputError] = useState('');
  const [selectVal, setSelectVal] = useState('wh_north');
  const [cb1, setCb1] = useState(true);
  const [cb2, setCb2] = useState(false);
  const [cbIndeterminate, setCbIndeterminate] = useState(true);

  // Table state
  const [tableLoading, setTableLoading] = useState(false);
  const [tableEmpty, setTableEmpty] = useState(false);
  const [sortBy, setSortBy] = useState<string>('sku');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>(['1', '3']);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLocationCode, setModalLocationCode] = useState('');

  // Alert dismiss states
  const [showAlert1, setShowAlert1] = useState(true);
  const [showAlert2, setShowAlert2] = useState(true);

  // Mock Inventory Data
  const sampleTableData = [
    {
      id: '1',
      sku: 'SKU-77201',
      name: 'High-Torque Electric Motor 24V',
      location: 'A-01-04',
      quantity: 142,
      status: 'active',
    },
    {
      id: '2',
      sku: 'SKU-77202',
      name: 'Hydraulic Cylinder Seal Kit',
      location: 'B-04-12',
      quantity: 18,
      status: 'pending',
    },
    {
      id: '3',
      sku: 'SKU-77203',
      name: 'Precision Ball Bearing 6205-2RS',
      location: 'A-02-09',
      quantity: 580,
      status: 'active',
    },
    {
      id: '4',
      sku: 'SKU-77204',
      name: 'Industrial Proximity Sensor M12',
      location: 'C-01-01',
      quantity: 4,
      status: 'draft',
    },
    {
      id: '5',
      sku: 'SKU-77205',
      name: 'Reinforced Rubber Drive Belt B68',
      location: 'D-08-03',
      quantity: 0,
      status: 'inactive',
    },
  ];

  const handleSort = (key: string, dir: 'asc' | 'desc') => {
    setSortBy(key);
    setSortDir(dir);
  };

  const handleSelectRow = (id: string | number, selected: boolean) => {
    if (selected) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(sampleTableData.map((d) => d.id));
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#0F172A] font-sans antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-[#0F172A] leading-tight">
                {t('demo.title')}
              </h1>
              <p className="text-[11px] text-[#64748B]">
                {t('demo.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="primary" dot>
              {t('demo.mode_operate')}
            </Badge>

            {/* Language Switcher */}
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleLanguage}
              iconLeft={
                <svg className="w-3.5 h-3.5 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              }
            >
              {language === 'en' ? 'Tiếng Việt (VI)' : 'English (EN)'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Banner Notice */}
        <section aria-label="System mode description">
          <div className="p-4 rounded-lg bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
              <p className="text-xs text-[#475569]">
                <strong className="text-[#0F172A] font-medium">{t('demo.mode_operate')}: </strong>
                {t('demo.mode_desc')}
              </p>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono">Tailwind v4 • Tokens Active</span>
          </div>
        </section>

        {/* 1. Design Tokens Overview */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.theme_tokens')}</h2>
            <p className="text-xs text-[#64748B]">Professional Enterprise palette with cool neutral base (#0F172A, #F8FAFC) and single primary blue (#2563EB).</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs space-y-2">
              <div className="h-10 rounded bg-[#2563EB]" />
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Primary</p>
                <p className="text-[11px] text-[#64748B] font-mono">#2563EB</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs space-y-2">
              <div className="h-10 rounded bg-[#1D4ED8]" />
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Primary Dark</p>
                <p className="text-[11px] text-[#64748B] font-mono">#1D4ED8</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs space-y-2">
              <div className="h-10 rounded bg-[#EFF6FF] border border-[#BFDBFE]" />
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Primary Light</p>
                <p className="text-[11px] text-[#64748B] font-mono">#EFF6FF</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs space-y-2">
              <div className="h-10 rounded bg-[#16A34A]" />
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Success</p>
                <p className="text-[11px] text-[#64748B] font-mono">#16A34A</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs space-y-2">
              <div className="h-10 rounded bg-[#D97706]" />
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Warning</p>
                <p className="text-[11px] text-[#64748B] font-mono">#D97706</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs space-y-2">
              <div className="h-10 rounded bg-[#DC2626]" />
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Error</p>
                <p className="text-[11px] text-[#64748B] font-mono">#DC2626</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Buttons */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_buttons')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_buttons_desc')}</p>
          </div>

          <Card padding="md">
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Variants</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">{t('common.save')}</Button>
                  <Button variant="secondary">{t('common.cancel')}</Button>
                  <Button variant="ghost">{t('common.filter')}</Button>
                  <Button variant="danger">{t('common.delete')}</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Sizes (sm, md, lg)</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="primary">Small (32px)</Button>
                  <Button size="md" variant="primary">Medium (36px)</Button>
                  <Button size="lg" variant="primary">Large (44px)</Button>
                </div>
              </div>

              {/* States: Loading, Disabled, Icons */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Interactive States & Icons</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    loading={btnLoading}
                    onClick={() => {
                      setBtnLoading(true);
                      setTimeout(() => setBtnLoading(false), 1500);
                    }}
                  >
                    {btnLoading ? t('common.loading') : 'Click for Loading State'}
                  </Button>

                  <Button variant="primary" disabled>
                    Disabled Primary
                  </Button>

                  <Button variant="secondary" disabled>
                    Disabled Secondary
                  </Button>

                  <Button
                    variant="secondary"
                    iconLeft={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    {t('common.create')}
                  </Button>

                  <Button
                    variant="ghost"
                    iconRight={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    }
                  >
                    {t('table.next')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 3. Inputs & Form Controls */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_inputs')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_inputs_desc')}</p>
          </div>

          <Card padding="md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Standard Input"
                placeholder="Enter stock keeping unit..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                hint="Alphanumeric unique identifier for warehouse inventory."
                required
              />

              <Input
                label="Input with Prefix Icon"
                placeholder={t('common.search')}
                prefix={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                hint="Type keywords to filter SKU or location."
              />

              <Input
                label="Validation Error State"
                value="invalid@@format"
                error={inputError || t('validation.invalid_email')}
                onChange={() => setInputError('')}
                required
              />

              <Input
                label="Disabled Input"
                value="SYSTEM-MANAGED-AUTO"
                onChange={() => {}}
                disabled
                hint="Auto-generated by ERP backend."
              />

              <Input
                label="Character Count Limited"
                placeholder="Bin Coordinate Note"
                maxLength={20}
                showCharCount
                value="Bay 04, Shelf 2"
                onChange={() => {}}
                hint="Max 20 characters allowed."
              />

              <Input
                label="Small Size Input (sm)"
                size="sm"
                placeholder="Quick barcode scan"
              />
            </div>
          </Card>
        </section>

        {/* 4. Selects & Checkboxes */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selects */}
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A] mb-1">{t('demo.section_selects')}</h2>
              <p className="text-xs text-[#64748B] mb-4">{t('demo.section_selects_desc')}</p>

              <Card padding="md" className="space-y-4">
                <Select
                  label="Warehouse Zone"
                  value={selectVal}
                  onChange={(e) => setSelectVal(e.target.value)}
                  options={[
                    { value: 'wh_north', label: 'North Distribution Hub (Zone A)' },
                    { value: 'wh_south', label: 'South Transit Facility (Zone B)' },
                    { value: 'wh_cold', label: 'Cold Storage Vault (Zone C)' },
                    { value: 'wh_quarantine', label: 'Quarantine Inspection Bay (Disabled)', disabled: true },
                  ]}
                  hint="Select target fulfillment facility."
                  required
                />

                <Select
                  label="Select with Error State"
                  value=""
                  onChange={() => {}}
                  placeholder={t('common.select')}
                  options={[
                    { value: 'opt1', label: 'Category A' },
                    { value: 'opt2', label: 'Category B' },
                  ]}
                  error={t('validation.required')}
                  required
                />

                <Select
                  label="Disabled Select"
                  value="wh_north"
                  onChange={() => {}}
                  disabled
                  options={[
                    { value: 'wh_north', label: 'North Distribution Hub (Locked)' },
                  ]}
                />
              </Card>
            </div>

            {/* Checkboxes */}
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A] mb-1">{t('demo.section_checkboxes')}</h2>
              <p className="text-xs text-[#64748B] mb-4">{t('demo.section_checkboxes_desc')}</p>

              <Card padding="md" className="space-y-4">
                <Checkbox
                  label="Checked State: Automatic stock replenishment alert enabled"
                  checked={cb1}
                  onChange={(checked) => setCb1(checked)}
                  hint="Sends immediate notification when stock reaches reorder point."
                />

                <Checkbox
                  label="Unchecked State: Require supervisor dual-signoff on dispatch"
                  checked={cb2}
                  onChange={(checked) => setCb2(checked)}
                />

                <Checkbox
                  label="Indeterminate State: Select all SKUs in Bay 14 (3 of 7 selected)"
                  checked={false}
                  indeterminate={cbIndeterminate}
                  onChange={() => setCbIndeterminate(!cbIndeterminate)}
                  hint="Click to toggle indeterminate tri-state."
                />

                <div className="pt-2 border-t border-[#E2E8F0] space-y-3">
                  <Checkbox
                    label="Disabled Checked Checkbox"
                    checked={true}
                    onChange={() => {}}
                    disabled
                  />
                  <Checkbox
                    label="Disabled Unchecked Checkbox"
                    checked={false}
                    onChange={() => {}}
                    disabled
                  />
                  <Checkbox
                    label="Checkbox with Validation Error"
                    checked={false}
                    onChange={() => {}}
                    error={t('validation.required')}
                  />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. Badges & Status Indicators */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_badges')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_badges_desc')}</p>
          </div>

          <Card padding="md">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">With Status Dot (Default MD)</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success" dot>{t('status.active')}</Badge>
                  <Badge variant="warning" dot>{t('status.pending')}</Badge>
                  <Badge variant="error" dot>{t('status.rejected')}</Badge>
                  <Badge variant="info" dot>{t('status.approved')}</Badge>
                  <Badge variant="neutral" dot>{t('status.draft')}</Badge>
                  <Badge variant="primary" dot>{t('status.completed')}</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Without Dot & Small Size (SM)</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success" size="sm">{t('status.active')}</Badge>
                  <Badge variant="warning" size="sm">{t('status.pending')}</Badge>
                  <Badge variant="error" size="sm">{t('status.rejected')}</Badge>
                  <Badge variant="info" size="sm">{t('status.approved')}</Badge>
                  <Badge variant="neutral" size="sm">{t('status.draft')}</Badge>
                  <Badge variant="primary" size="sm">{t('status.completed')}</Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 6. Cards & Containers */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_cards')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_cards_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              title="Standard Panel"
              description="Warehouse Sector A Capacity"
              actions={<Button size="sm" variant="ghost">{t('common.edit')}</Button>}
              footer={<span className="text-xs text-[#64748B]">Updated 5m ago</span>}
            >
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Utilization:</span>
                  <span className="font-semibold text-[#0F172A]">84.2%</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2563EB] h-full w-[84%]" />
                </div>
              </div>
            </Card>

            <Card
              title="Hoverable Elevation"
              description="Micro-lift 2px on pointer hover"
              hoverable
              footer={<span className="text-xs text-[#2563EB] font-medium">Click to inspect →</span>}
            >
              <p className="text-xs text-[#64748B] leading-relaxed">
                Notice the subtle 150ms transform and shadow elevation without harsh borders or zero-blur offsets.
              </p>
            </Card>

            <Card
              title="Action Menu Card"
              description="With dropdown inside header"
              actions={
                <Dropdown
                  trigger={
                    <Button variant="secondary" size="sm">
                      {t('common.actions')}
                    </Button>
                  }
                  items={[
                    { label: t('common.view'), onClick: () => {} },
                    { label: t('common.edit'), onClick: () => {} },
                    { divider: true },
                    { label: t('common.delete'), danger: true, onClick: () => {} },
                  ]}
                />
              }
            >
              <p className="text-xs text-[#64748B]">
                Dropdown menu integrated seamlessly into card header actions bar.
              </p>
            </Card>
          </div>
        </section>

        {/* 7. Data Table */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_table')}</h2>
              <p className="text-xs text-[#64748B]">{t('demo.section_table_desc')}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setTableLoading(!tableLoading)}
              >
                {t('demo.toggle_table_loading')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setTableEmpty(!tableEmpty)}
              >
                {t('demo.toggle_table_empty')}
              </Button>
            </div>
          </div>

          <Table
            columns={[
              { key: 'sku', label: 'SKU Code', sortable: true, width: '140px' },
              { key: 'name', label: 'Product Name', sortable: true },
              { key: 'location', label: 'Location Bin', width: '120px' },
              {
                key: 'quantity',
                label: 'Stock Qty',
                sortable: true,
                align: 'right',
                width: '110px',
                render: (val) => (
                  <span className="font-mono font-medium">{Number(val).toLocaleString()}</span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                width: '130px',
                render: (val) => {
                  const s = String(val);
                  const variantMap: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
                    active: 'success',
                    pending: 'warning',
                    draft: 'neutral',
                    inactive: 'error',
                  };
                  return (
                    <Badge variant={variantMap[s] || 'neutral'} dot size="sm">
                      {t(`status.${s}`)}
                    </Badge>
                  );
                },
              },
            ]}
            data={tableEmpty ? [] : sampleTableData}
            loading={tableLoading}
            selectable
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            emptyTitle={t('emptyState.no_items_title')}
            emptyDescription={t('emptyState.no_items_desc')}
            emptyAction={
              <Button
                variant="primary"
                size="sm"
                onClick={() => setTableEmpty(false)}
                iconLeft={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                {t('emptyState.add_item')}
              </Button>
            }
          />
        </section>

        {/* 8. Modal & Dialogs */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_modal')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_modal_desc')}</p>
          </div>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-[#0F172A]">Accessible HTML5 &lt;dialog&gt; Component</h4>
                <p className="text-xs text-[#64748B] mt-1">Supports Escape key dismissal, backdrop click closing, and focus restoration.</p>
              </div>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                {t('demo.open_modal')}
              </Button>
            </div>
          </Card>

          <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={t('demo.modal_title')}
            description={t('demo.modal_desc')}
            actions={
              <>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  {t('demo.modal_confirm')}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input
                label="Bin Location Identifier"
                placeholder="e.g. AISLE-A-RACK-03"
                value={modalLocationCode}
                onChange={(e) => setModalLocationCode(e.target.value)}
                hint="Use the standard warehouse numbering taxonomy."
                required
              />
              <Select
                label="Storage Zone Designation"
                value="ambient"
                onChange={() => {}}
                options={[
                  { value: 'ambient', label: 'Ambient Temperature (Standard)' },
                  { value: 'cold', label: 'Cold Storage (-18°C)' },
                  { value: 'hazardous', label: 'Hazardous Materials Containment' },
                ]}
              />
            </div>
          </Modal>
        </section>

        {/* 9. Dropdown Menus */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_dropdown')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_dropdown_desc')}</p>
          </div>

          <Card padding="md">
            <div className="flex flex-wrap items-center gap-4">
              <Dropdown
                trigger={
                  <Button
                    variant="secondary"
                    iconRight={
                      <svg className="w-4 h-4 text-[#64748B]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Inventory Actions
                  </Button>
                }
                items={[
                  {
                    label: t('common.export'),
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    ),
                    onClick: () => {},
                  },
                  {
                    label: t('common.import'),
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    ),
                    onClick: () => {},
                  },
                  { divider: true },
                  {
                    label: t('common.delete'),
                    danger: true,
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ),
                    onClick: () => {},
                  },
                ]}
              />

              <Dropdown
                align="left"
                trigger={
                  <Button variant="ghost" size="sm">
                    {t('common.filter')} Dropdown (Left Align)
                  </Button>
                }
                items={[
                  { label: 'Filter: In Stock Only', onClick: () => {} },
                  { label: 'Filter: Low Stock Alerts', onClick: () => {} },
                  { label: 'Filter: Quarantine Zone', disabled: true },
                ]}
              />
            </div>
          </Card>
        </section>

        {/* 10. Loading & Skeletons */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_loading')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_loading_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Inline Spinners (Buttons & Small Controls)" padding="md">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Spinner size="sm" className="text-[#2563EB]" />
                  <span className="text-xs text-[#64748B]">Small (16px)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Spinner size="md" className="text-[#2563EB]" />
                  <span className="text-xs text-[#64748B]">Medium (20px)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Spinner size="lg" className="text-[#2563EB]" />
                  <span className="text-xs text-[#64748B]">Large (32px)</span>
                </div>
              </div>
            </Card>

            <Card title="Content Skeleton Placeholders" padding="md">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton width={40} height={40} rounded="full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton height={14} width="60%" />
                    <Skeleton height={12} width="40%" />
                  </div>
                </div>
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="85%" />
              </div>
            </Card>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">Full Table Skeleton</h4>
            <SkeletonTable rows={3} columns={4} />
          </div>
        </section>

        {/* 11. Empty State */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_empty')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_empty_desc')}</p>
          </div>

          <Card padding="none">
            <EmptyState
              title={t('emptyState.no_items_title')}
              description={t('emptyState.no_items_desc')}
              action={
                <Button
                  variant="primary"
                  iconLeft={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  {t('emptyState.add_item')}
                </Button>
              }
            />
          </Card>
        </section>

        {/* 12. Alerts & Notifications */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('demo.section_alerts')}</h2>
            <p className="text-xs text-[#64748B]">{t('demo.section_alerts_desc')}</p>
          </div>

          <div className="space-y-3">
            {showAlert1 && (
              <Alert
                variant="success"
                title={t('alert.success_title')}
                message={t('alert.success_msg')}
                dismissible
                onDismiss={() => setShowAlert1(false)}
              />
            )}

            <Alert
              variant="warning"
              title={t('alert.warning_title')}
              message={t('alert.warning_msg')}
              action={
                <Button size="sm" variant="secondary">
                  Review Safety Stock
                </Button>
              }
            />

            {showAlert2 && (
              <Alert
                variant="error"
                title={t('alert.error_title')}
                message={t('alert.error_msg')}
                dismissible
                onDismiss={() => setShowAlert2(false)}
                action={
                  <Button size="sm" variant="danger">
                    {t('common.retry')}
                  </Button>
                }
              />
            )}

            <Alert
              variant="info"
              title={t('alert.info_title')}
              message={t('alert.info_msg')}
            />
          </div>
        </section>
      </main>
    </div>
  );
};
