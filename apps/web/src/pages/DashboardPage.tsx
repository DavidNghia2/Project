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
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Badge, Table, type Column } from '../design-system';
import { ROLE_META, useRolePreview } from '../features/users-rbac';

export const DashboardPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const roleMeta = ROLE_META[activeRole];

  const kpis = [
    {
      titleEn: 'Total Catalog SKUs',
      titleVi: 'Tổng số mặt hàng (SKU)',
      value: '1,420',
      change: '+12 this week',
      changeVi: '+12 tuần này',
      icon: Package,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      titleEn: 'Low Stock Warnings',
      titleVi: 'Cảnh báo tồn kho thấp',
      value: '5',
      change: 'Needs reorder',
      changeVi: 'Cần bổ sung hàng',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      titleEn: 'Pending Stock-In',
      titleVi: 'Phiếu nhập chờ duyệt',
      value: '3',
      change: '2 awaiting Manager',
      changeVi: '2 phiếu chờ quản lý duyệt',
      icon: ArrowDownToLine,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      titleEn: 'Active Dispatches',
      titleVi: 'Phiếu xuất đang xử lý',
      value: '8',
      change: 'All in allocation',
      changeVi: 'Đủ tồn khả dụng',
      icon: ArrowUpFromLine,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  const recentMovements = [
    {
      id: 'TRX-9481',
      sku: 'SKU-LOGI-M331',
      name: 'Chuột không dây Logitech M331 Silent',
      type: 'IN',
      qty: '+150',
      warehouse: 'Kho Tổng Hà Nội',
      time: '10:45 AM',
      status: 'completed',
    },
    {
      id: 'TRX-9480',
      sku: 'SKU-DELL-P2419',
      name: 'Màn hình Dell Professional 24 inch FHD',
      type: 'OUT',
      qty: '-25',
      warehouse: 'Kho Đà Nẵng',
      time: '09:30 AM',
      status: 'completed',
    },
    {
      id: 'TRX-9479',
      sku: 'SKU-APL-MBP14',
      name: 'MacBook Pro 14 inch M3 16GB/512GB',
      type: 'OUT',
      qty: '-5',
      warehouse: 'Kho Trung Chuyển HCM',
      time: '08:15 AM',
      status: 'completed',
    },
    {
      id: 'TRX-9478',
      sku: 'SKU-SAMS-T7-1TB',
      name: 'Ổ cứng SSD di động Samsung T7 1TB USB 3.2',
      type: 'ADJ_IN',
      qty: '+2',
      warehouse: 'Kho Tổng Hà Nội',
      time: 'Yesterday',
      status: 'approved',
    },
  ];

  const columns: Column<typeof recentMovements[0]>[] = [
    {
      key: 'id',
      label: 'Trx #',
      render: (_val, row) => (
        <span className="font-mono text-xs font-semibold text-[#0F172A] whitespace-nowrap">
          {row.id}
        </span>
      ),
    },
    {
      key: 'name',
      label: language === 'vi' ? 'Sản phẩm / SKU' : 'Product / SKU',
      render: (_val, row) => (
        <div className="min-w-0 max-w-[200px]">
          <p className="text-xs font-medium text-[#0F172A] truncate">{row.name}</p>
          <p className="text-[11px] font-mono text-[#64748B] truncate">{row.sku}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (_val, row: typeof recentMovements[0]) => (
        <Badge
          variant={row.type === 'IN' ? 'success' : row.type === 'OUT' ? 'primary' : 'warning'}
          size="sm"
        >
          {row.type}
        </Badge>
      ),
    },
    {
      key: 'qty',
      label: 'Qty',
      align: 'right',
      render: (_val, row: typeof recentMovements[0]) => (
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
      key: 'warehouse',
      label: language === 'vi' ? 'Kho hàng' : 'Warehouse',
      render: (_val, row) => (
        <span className="text-xs text-[#334155] whitespace-nowrap">{row.warehouse}</span>
      ),
    },
    {
      key: 'time',
      label: language === 'vi' ? 'Thời gian' : 'Time',
      align: 'right',
      render: (_val, row: typeof recentMovements[0]) => (
        <span className="text-xs text-slate-500 inline-flex items-center gap-1 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {row.time}
        </span>
      ),
    },
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
                  <p className="text-xs font-medium text-[#64748B] truncate">
                    {language === 'vi' ? kpi.titleVi : kpi.titleEn}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] tracking-tight">
                    {kpi.value}
                  </p>
                  <p className="text-[11px] text-[#64748B] flex items-center gap-1 pt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {language === 'vi' ? kpi.changeVi : kpi.change}
                    </span>
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
            title={language === 'vi' ? 'Biến động tồn kho gần đây' : 'Recent Inventory Movements'}
            description={
              language === 'vi'
                ? 'Nhật ký các giao dịch nhập xuất và điều chỉnh vừa được cập nhật sổ cái.'
                : 'Real-time ledger entries from completed stock orders and approved adjustments.'
            }
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
          <Card
            title={language === 'vi' ? 'Quy trình kho chuẩn' : 'Standard Warehouse Flow'}
            description={language === 'vi' ? 'Các bước thực thi theo nguyên tắc Maker-Checker.' : 'Maker-checker flow enforcing transaction integrity.'}
          >
            <ol className="space-y-3 text-xs text-[#334155]">
              <li className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <p className="font-semibold text-[#0F172A]">Stock Inward (Nhập kho)</p>
                  <p className="text-[#64748B]">Tạo DRAFT &rarr; Gửi SUBMITTED &rarr; Quản lý duyệt APPROVED &rarr; Tăng tồn.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <p className="font-semibold text-[#0F172A]">Stock Outward (Xuất kho)</p>
                  <p className="text-[#64748B]">Kiểm tra tồn khả dụng &rarr; Khóa hàng &rarr; Hoàn tất &rarr; Giảm tồn.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <p className="font-semibold text-[#0F172A]">Stocktaking (Kiểm kê)</p>
                  <p className="text-[#64748B]">Chụp snapshot &rarr; Đếm thực tế &rarr; Tính variance &rarr; Duyệt điều chỉnh.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </span>
                <div>
                  <p className="font-semibold text-[#0F172A]">Low Stock Alerts (Cảnh báo)</p>
                  <p className="text-[#64748B]">Tự động kích hoạt khi on_hand &le; reorder_level.</p>
                </div>
              </li>
            </ol>
          </Card>

          <Card padding="md" className="bg-blue-50/50 border-blue-200">
            <div className="flex items-start gap-3">
              <Warehouse className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-900">
                  {language === 'vi' ? 'Phân quyền theo kho (Multi-warehouse Scope)' : 'Multi-warehouse Scope Enforced'}
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  {activeRole === 'ADMIN'
                    ? language === 'vi'
                      ? 'Bạn đang quản trị với quyền Admin toàn hệ thống. Hãy dùng bộ chuyển kho ở góc trên để lọc dữ liệu theo từng chi nhánh kho.'
                      : 'Logged in as Admin with global system visibility. Use the warehouse selector on topbar to filter data scopes.'
                    : language === 'vi'
                      ? `Đang hiển thị giao diện theo vai trò ${roleMeta.labelVi}. ${roleMeta.scopeNoteVi}.`
                      : `Previewing scope for ${roleMeta.labelEn}. ${roleMeta.scopeNoteEn}.`}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
