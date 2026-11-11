import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Plus,
  TrendingUp,
  Warehouse,
  Clock,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { translateDomainLabel } from '../i18n/domainTranslate';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Badge, Table, type Column } from '../design-system';
import { ROLE_META, useRolePreview } from '../features/users-rbac';

export const DashboardPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const roleMeta = ROLE_META[activeRole];

  const kpis = [
    {
      title: t('dashboard.kpi.totalSkusTitle'),
      value: '1,420',
      change: t('dashboard.kpi.totalSkusChange'),
      icon: Package,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: t('dashboard.kpi.lowStockTitle'),
      value: '5',
      change: t('dashboard.kpi.lowStockChange'),
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: t('dashboard.kpi.pendingInTitle'),
      value: '3',
      change: t('dashboard.kpi.pendingInChange'),
      icon: ArrowDownToLine,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: t('dashboard.kpi.activeOutTitle'),
      value: '8',
      change: t('dashboard.kpi.activeOutChange'),
      icon: ArrowUpFromLine,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const recentMovements = [
    {
      id: 'TRX-9481',
      sku: 'SKU-LOGI-M331',
      name: 'Chuột không dây Logitech M331 Silent',
      type: 'IN' as const,
      qty: '+150',
      warehouseCode: 'WH-01',
      time: '10:45 AM',
      status: 'completed',
    },
    {
      id: 'TRX-9480',
      sku: 'SKU-DELL-P2419',
      name: 'Màn hình Dell Professional 24 inch FHD',
      type: 'OUT' as const,
      qty: '-25',
      warehouseCode: 'WH-02',
      time: '09:30 AM',
      status: 'completed',
    },
    {
      id: 'TRX-9479',
      sku: 'SKU-APL-MBP14',
      name: 'MacBook Pro 14 inch M3 16GB/512GB',
      type: 'OUT' as const,
      qty: '-5',
      warehouseCode: 'WH-03',
      time: '08:15 AM',
      status: 'completed',
    },
    {
      id: 'TRX-9478',
      sku: 'SKU-SAMS-T7-1TB',
      name: 'Ổ cứng SSD di động Samsung T7 1TB USB 3.2',
      type: 'ADJ_IN' as const,
      qty: '+2',
      warehouseCode: 'WH-01',
      time: t('dashboard.yesterday'),
      status: 'approved',
    },
  ];

  const columns: Column<typeof recentMovements[0]>[] = [
    {
      key: 'id',
      label: t('dashboard.colTrx'),
      render: (_val, row) => (
        <span className="font-mono text-xs font-semibold text-[#0F172A] whitespace-nowrap">
          {row.id}
        </span>
      ),
    },
    {
      key: 'name',
      label: t('dashboard.colProduct'),
      render: (_val, row) => (
        <div className="min-w-0 max-w-[200px]">
          <p className="text-xs font-medium text-[#0F172A] truncate">{row.name}</p>
          <p className="text-[11px] font-mono text-[#64748B] truncate">{row.sku}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: t('dashboard.colType'),
      render: (_val, row) => (
        <Badge
          variant={row.type === 'IN' ? 'success' : row.type === 'OUT' ? 'primary' : 'warning'}
          size="sm"
        >
          {t(`dashboard.txTypes.${row.type}`)}
        </Badge>
      ),
    },
    {
      key: 'qty',
      label: t('dashboard.colQty'),
      align: 'right',
      render: (_val, row) => (
        <span
          className={`font-mono font-semibold whitespace-nowrap ${
            row.qty.startsWith('+') ? 'text-emerald-600' : 'text-slate-800'
          }`}
        >
          {row.qty}
        </span>
      ),
    },
    {
      key: 'warehouseCode',
      label: t('dashboard.colWarehouse'),
      render: (_val, row) => (
        <span className="text-xs text-[#334155] whitespace-nowrap">
          {translateDomainLabel(language, 'warehouseNames', row.warehouseCode)}
        </span>
      ),
    },
    {
      key: 'time',
      label: t('dashboard.colTime'),
      align: 'right',
      render: (_val, row) => (
        <span className="text-xs text-slate-500 inline-flex items-center gap-1 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {row.time}
        </span>
      ),
    },
  ];

  const flowSteps = [
    { num: 1, bg: 'bg-blue-100 text-blue-700', title: t('dashboard.flowStep1Title'), desc: t('dashboard.flowStep1Desc') },
    { num: 2, bg: 'bg-purple-100 text-purple-700', title: t('dashboard.flowStep2Title'), desc: t('dashboard.flowStep2Desc') },
    { num: 3, bg: 'bg-amber-100 text-amber-700', title: t('dashboard.flowStep3Title'), desc: t('dashboard.flowStep3Desc') },
    { num: 4, bg: 'bg-red-100 text-red-700', title: t('dashboard.flowStep4Title'), desc: t('dashboard.flowStep4Desc') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.dashboardTitle')}
        description={t('pages.dashboardDesc')}
        actions={
          capabilities.canCreateStockOrder ? (
            <div className="flex items-center gap-2">
              <Link to="/stock-in">
                <Button variant="secondary" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
                  {t('nav.stockIn')}
                </Button>
              </Link>
              <Link to="/stock-out">
                <Button variant="primary" size="sm" iconLeft={<Plus className="w-4 h-4" />}>
                  {t('nav.stockOut')}
                </Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={idx} padding="md">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-[#64748B] truncate">{kpi.title}</p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] tracking-tight">
                    {kpi.value}
                  </p>
                  <p className="text-[11px] text-[#64748B] flex items-center gap-1 pt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{kpi.change}</span>
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg shrink-0 ${kpi.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Flow Guidance & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title={t('dashboard.recentTitle')}
            description={t('dashboard.recentDesc')}
            padding="none"
            actions={
              <Link to="/reports" className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                {t('common.view')} {t('nav.reports')} &rarr;
              </Link>
            }
          >
            <Table
              columns={columns}
              data={recentMovements}
              className="border-0 shadow-none rounded-t-none"
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card title={t('dashboard.flowTitle')} description={t('dashboard.flowDesc')}>
            <ol className="space-y-3 text-xs text-[#334155]">
              {flowSteps.map((step) => (
                <li key={step.num} className="flex gap-2.5 items-start">
                  <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center shrink-0 text-[11px] ${step.bg}`}>
                    {step.num}
                  </span>
                  <div>
                    <p className="font-semibold text-[#0F172A]">{step.title}</p>
                    <p className="text-[#64748B]">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card padding="md" className="bg-blue-50/50 border-blue-200">
            <div className="flex items-start gap-3">
              <Warehouse className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-900">
                  {t('dashboard.scopeTitle')}
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  {activeRole === 'ADMIN'
                    ? t('dashboard.scopeAdminDesc')
                    : t('dashboard.scopeRolePreview', {
                        role: t(roleMeta.labelKey),
                        note: t(roleMeta.scopeNoteKey),
                      })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
