import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Badge, Table, type Column } from '../design-system';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const StocktakingPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const canConduct = capabilities.canConductStocktaking;

  const sessions = [
    {
      id: 'STK-2026-Q4-01',
      warehouse: 'Kho Tổng Hà Nội (WH-01)',
      countedItems: 142,
      varianceItems: 3,
      startedAt: '08/11/2026',
      status: 'pending_approval',
      auditor: 'Ban Kiểm Kê Nội Bộ',
    },
    {
      id: 'STK-2026-Q3-02',
      warehouse: 'Kho Đà Nẵng (WH-02)',
      countedItems: 85,
      varianceItems: 0,
      startedAt: '30/09/2026',
      status: 'completed',
      auditor: 'Trần Thị Thu (Manager)',
    },
    {
      id: 'STK-2026-Q3-01',
      warehouse: 'Kho Trung Chuyển HCM (WH-03)',
      countedItems: 210,
      varianceItems: 5,
      startedAt: '28/09/2026',
      status: 'completed',
      auditor: 'Lê Hoàng Long (Manager)',
    },
  ];

  const columns: Column<typeof sessions[0]>[] = [
    {
      key: 'id',
      label: 'Session Code',
      render: (_val, r: typeof sessions[0]) => (
        <span className="font-mono text-xs font-bold text-blue-600">{r.id}</span>
      ),
    },
    { key: 'warehouse', label: 'Warehouse Scope' },
    {
      key: 'countedItems',
      label: 'Counted SKUs',
      render: (_val, r: typeof sessions[0]) => (
        <span className="font-mono">{r.countedItems} items</span>
      ),
    },
    {
      key: 'varianceItems',
      label: 'Discrepancy (Lệch)',
      render: (_val, r: typeof sessions[0]) =>
        r.varianceItems > 0 ? (
          <Badge variant="warning" size="sm">
            {r.varianceItems} mặt hàng lệch
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            Khớp 100%
          </Badge>
        ),
    },
    { key: 'startedAt', label: 'Execution Date' },
    {
      key: 'status',
      label: 'Status',
      render: (_val, r: typeof sessions[0]) => (
        <Badge
          variant={r.status === 'completed' ? 'success' : 'warning'}
          size="sm"
          dot
        >
          {r.status === 'completed' ? 'Đã duyệt điều chỉnh' : 'Chờ Manager duyệt'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      render: () =>
        canConduct ? (
          <Button variant="secondary" size="sm">
            Xem đối soát
          </Button>
        ) : (
          <span className="text-xs text-[#94A3B8]">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.stocktakingTitle')}
        description={t('pages.stocktakingDesc')}
        actions={
          canConduct ? (
            <Button variant="primary" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
              {language === 'vi' ? 'Khởi tạo đợt kiểm kê' : 'New Stocktake Session'}
            </Button>
          ) : undefined
        }
      />

      {!canConduct && <RoleScopeNotice role={activeRole} context="restricted" />}

      <Card padding="md">
        <Table columns={columns} data={sessions} />
      </Card>
    </div>
  );
};
