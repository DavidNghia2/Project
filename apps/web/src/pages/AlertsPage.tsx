import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Badge, Table, Alert, type Column } from '../design-system';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const AlertsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const canConfigure = capabilities.canConfigureAlerts;

  const alerts = [
    {
      sku: 'SKU-TONER-HP85A',
      name: 'Hộp mực in laser HP 85A Black LaserJet',
      warehouseCode: 'WH-01',
      onHand: 0,
      threshold: 8,
      status: 'active' as const,
      severity: 'critical' as const,
      updatedAt: '10/11/2026 14:00',
    },
    {
      sku: 'SKU-CAB-TYPEC-2M',
      name: 'Cáp sạc USB-C to USB-C 100W bọc dù 2m',
      warehouseCode: 'WH-02',
      onHand: 3,
      threshold: 15,
      status: 'active' as const,
      severity: 'high' as const,
      updatedAt: '10/11/2026 11:20',
    },
    {
      sku: 'SKU-DELL-P2419',
      name: 'Màn hình Dell Professional 24 inch FHD IPS',
      warehouseCode: 'WH-01',
      onHand: 8,
      threshold: 10,
      status: 'acknowledged' as const,
      severity: 'medium' as const,
      updatedAt: '09/11/2026 17:00',
    },
  ];

  const columns: Column<typeof alerts[0]>[] = [
    {
      key: 'sku',
      label: t('alerts.colSku'),
      render: (_val, r) => (
        <span className="font-mono text-xs font-bold text-red-600">{r.sku}</span>
      ),
    },
    {
      key: 'name',
      label: t('alerts.colItem'),
      render: (_val, r) => <span className="font-medium text-[#0F172A]">{r.name}</span>,
    },
    {
      key: 'warehouseCode',
      label: t('alerts.colWarehouse'),
      render: (_val, r) => translateDomainLabel(language, 'warehouses', r.warehouseCode),
    },
    {
      key: 'onHand',
      label: t('alerts.colStockThreshold'),
      render: (_val, r) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-red-600">{r.onHand}</span>
          <span className="text-slate-400"> {t('alerts.thresholdUnit', { threshold: r.threshold })}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      label: t('alerts.colUrgency'),
      render: (_val, r) => (
        <Badge variant={r.severity === 'critical' ? 'error' : 'warning'} size="sm">
          {t(`alerts.severity.${r.severity}`)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: t('alerts.colStatus'),
      render: (_val, r) => (
        <Badge variant={r.status === 'active' ? 'error' : 'info'} size="sm" dot>
          {r.status === 'active' ? t('alerts.statusActive') : t('alerts.statusAck')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('alerts.colAction'),
      render: (_val, r) =>
        canConfigure ? (
          <Button variant="secondary" size="sm">
            {r.status === 'active' ? t('alerts.actionAck') : t('alerts.actionReorder')}
          </Button>
        ) : (
          <span className="text-xs text-[#94A3B8]">{t('common.readOnly')}</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.alertsTitle')}
        description={t('pages.alertsDesc')}
        actions={
          canConfigure ? (
            <Button variant="secondary" size="sm" iconLeft={<RefreshCw className="w-4 h-4" />}>
              {t('alerts.rescanBtn')}
            </Button>
          ) : undefined
        }
      />

      {!canConfigure && <RoleScopeNotice role={activeRole} context="catalog" />}

      <Alert
        variant="warning"
        title={t('alerts.warningTitle', { count: alerts.length })}
        message={t('alerts.warningMessage')}
      />

      <Card padding="md">
        <Table columns={columns} data={alerts} />
      </Card>
    </div>
  );
};
