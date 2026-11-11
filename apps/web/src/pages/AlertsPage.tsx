import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '../i18n';
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
      warehouse: 'Kho Tổng Hà Nội (WH-01)',
      onHand: 0,
      threshold: 8,
      status: 'active',
      severity: 'critical',
      updatedAt: '10/11/2026 14:00',
    },
    {
      sku: 'SKU-CAB-TYPEC-2M',
      name: 'Cáp sạc USB-C to USB-C 100W bọc dù 2m',
      warehouse: 'Kho Đà Nẵng (WH-02)',
      onHand: 3,
      threshold: 15,
      status: 'active',
      severity: 'high',
      updatedAt: '10/11/2026 11:20',
    },
    {
      sku: 'SKU-DELL-P2419',
      name: 'Màn hình Dell Professional 24 inch FHD IPS',
      warehouse: 'Kho Tổng Hà Nội (WH-01)',
      onHand: 8,
      threshold: 10,
      status: 'acknowledged',
      severity: 'medium',
      updatedAt: '09/11/2026 17:00',
    },
  ];

  const columns: Column<typeof alerts[0]>[] = [
    {
      key: 'sku',
      label: 'SKU / Barcode',
      render: (_val, r: typeof alerts[0]) => (
        <span className="font-mono text-xs font-bold text-red-600">{r.sku}</span>
      ),
    },
    { key: 'name', label: 'Item Name', render: (_val, r: typeof alerts[0]) => <span className="font-medium text-[#0F172A]">{r.name}</span> },
    { key: 'warehouse', label: 'Warehouse Scope' },
    {
      key: 'onHand',
      label: 'On-Hand / Threshold',
      render: (_val, r: typeof alerts[0]) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-red-600">{r.onHand}</span>
          <span className="text-slate-400"> / ngưỡng {r.threshold}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      label: 'Urgency',
      render: (_val, r: typeof alerts[0]) => (
        <Badge variant={r.severity === 'critical' ? 'error' : 'warning'} size="sm">
          {r.severity.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_val, r: typeof alerts[0]) => (
        <Badge variant={r.status === 'active' ? 'error' : 'info'} size="sm" dot>
          {r.status === 'active' ? 'Chưa xử lý' : 'Đã ghi nhận'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_val, r: typeof alerts[0]) =>
        canConfigure ? (
          <Button variant="secondary" size="sm">
            {r.status === 'active' ? 'Xác nhận xử lý' : 'Tạo PO bổ sung'}
          </Button>
        ) : (
          <span className="text-xs text-[#94A3B8]">
            {language === 'vi' ? 'Chỉ xem' : 'Read-only'}
          </span>
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
              {language === 'vi' ? 'Quét lại ngưỡng tồn' : 'Re-scan Thresholds'}
            </Button>
          ) : undefined
        }
      />

      {!canConfigure && <RoleScopeNotice role={activeRole} context="catalog" />}

      <Alert
        variant="warning"
        title="Phát hiện 3 mặt hàng dưới ngưỡng an toàn"
        message="Hệ thống tự động phát hiện số tồn khả dụng thấp hơn ngưỡng định mức đã cài đặt. Vui lòng kiểm tra và lên kế hoạch nhập bổ sung."
      />

      <Card padding="md">
        <Table columns={columns} data={alerts} />
      </Card>
    </div>
  );
};
