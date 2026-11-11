import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
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
      warehouseCode: 'WH-01',
      countedItems: 142,
      varianceItems: 3,
      startedAt: '08/11/2026',
      status: 'pending_approval',
      auditor: t('stocktaking.internalTeam'),
    },
    {
      id: 'STK-2026-Q3-02',
      warehouseCode: 'WH-02',
      countedItems: 85,
      varianceItems: 0,
      startedAt: '30/09/2026',
      status: 'completed',
      auditor: 'Trần Thị Thu (Manager)',
    },
    {
      id: 'STK-2026-Q3-01',
      warehouseCode: 'WH-03',
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
      label: t('stocktaking.colCode'),
      render: (_val, r) => (
        <span className="font-mono text-xs font-bold text-blue-600">{r.id}</span>
      ),
    },
    {
      key: 'warehouseCode',
      label: t('stocktaking.colWarehouse'),
      render: (_val, r) => translateDomainLabel(language, 'warehouses', r.warehouseCode),
    },
    {
      key: 'countedItems',
      label: t('stocktaking.colCounted'),
      render: (_val, r) => (
        <span className="font-mono">{t('stocktaking.countedUnit', { count: r.countedItems })}</span>
      ),
    },
    {
      key: 'varianceItems',
      label: t('stocktaking.colVariance'),
      render: (_val, r) =>
        r.varianceItems > 0 ? (
          <Badge variant="warning" size="sm">
            {t('stocktaking.varianceCount', { count: r.varianceItems })}
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            {t('stocktaking.matched100')}
          </Badge>
        ),
    },
    { key: 'startedAt', label: t('stocktaking.colDate') },
    {
      key: 'status',
      label: t('stocktaking.colStatus'),
      render: (_val, r) => (
        <Badge
          variant={r.status === 'completed' ? 'success' : 'warning'}
          size="sm"
          dot
        >
          {r.status === 'completed'
            ? t('stocktaking.statusCompleted')
            : t('stocktaking.statusPending')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('stocktaking.colAction'),
      render: () =>
        canConduct ? (
          <Button variant="secondary" size="sm">
            {t('stocktaking.viewReconciliation')}
          </Button>
        ) : (
          <span className="text-xs text-[#94A3B8]">{t('common.notAvailable')}</span>
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
              {t('stocktaking.newSession')}
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
