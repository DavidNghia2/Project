import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  Scale,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  BarChart3,
  Bell,
  Users,
  Settings,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes as LogoIcon,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { Badge } from '../design-system';
import {
  canAccessNavKey,
  useRolePreview,
  type NavMenuKey,
} from '../features/users-rbac';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  key: NavMenuKey;
  labelKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    count: string | number;
    variant: 'error' | 'warning' | 'info' | 'neutral';
  };
}

interface NavSection {
  titleEn: string;
  titleVi: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { t, language } = useTranslation();
  const { activeRole } = useRolePreview();

  const navSections: NavSection[] = [
    {
      titleEn: 'OPERATIONS',
      titleVi: 'VẬN HÀNH KHO',
      items: [
        {
          key: 'dashboard',
          labelKey: 'nav.dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          key: 'stock-in',
          labelKey: 'nav.stockIn',
          path: '/stock-in',
          icon: ArrowDownToLine,
          badge: { count: '3', variant: 'info' },
        },
        {
          key: 'stock-out',
          labelKey: 'nav.stockOut',
          path: '/stock-out',
          icon: ArrowUpFromLine,
        },
        {
          key: 'stocktaking',
          labelKey: 'nav.stocktaking',
          path: '/stocktaking',
          icon: ClipboardCheck,
        },
      ],
    },
    {
      titleEn: 'MASTER DATA',
      titleVi: 'DANH MỤC HÀNG HÓA',
      items: [
        {
          key: 'products',
          labelKey: 'nav.products',
          path: '/products',
          icon: Package,
        },
        {
          key: 'warehouses',
          labelKey: 'nav.warehouses',
          path: '/warehouses',
          icon: Warehouse,
        },
        {
          key: 'categories',
          labelKey: 'nav.categories',
          path: '/categories',
          icon: Boxes,
        },
        {
          key: 'units',
          labelKey: 'nav.units',
          path: '/units',
          icon: Scale,
        },
        {
          key: 'suppliers',
          labelKey: 'nav.suppliers',
          path: '/suppliers',
          icon: Truck,
        },
      ],
    },
    {
      titleEn: 'INSIGHTS & MONITORING',
      titleVi: 'BÁO CÁO & GIÁM SÁT',
      items: [
        {
          key: 'alerts',
          labelKey: 'nav.alerts',
          path: '/alerts',
          icon: Bell,
          badge: { count: '5', variant: 'error' },
        },
        {
          key: 'reports',
          labelKey: 'nav.reports',
          path: '/reports',
          icon: BarChart3,
        },
      ],
    },
    {
      titleEn: 'ADMINISTRATION',
      titleVi: 'HỆ THỐNG & CẤU HÌNH',
      items: [
        {
          key: 'users',
          labelKey: 'nav.users',
          path: '/users',
          icon: Users,
        },
        {
          key: 'settings',
          labelKey: 'nav.settings',
          path: '/settings',
          icon: Settings,
        },
        {
          key: 'design-system',
          labelKey: 'nav.designSystem',
          path: '/design-system',
          icon: Palette,
          badge: { count: 'UI', variant: 'neutral' },
        },
      ],
    },
  ];

  return (
    <aside
      className={`
        flex flex-col h-full bg-white border-r border-[#E2E8F0] select-none overflow-x-hidden
        transition-all duration-200 ease-in-out shrink-0
        ${collapsed ? 'w-18' : 'w-64'}
      `}
      aria-label={t('nav.menu')}
    >
      {/* Brand Header */}
      <div
        className={`border-b border-[#E2E8F0] shrink-0 overflow-hidden transition-all duration-200 ${
          collapsed
            ? 'py-3 px-2 flex flex-col items-center justify-center gap-2'
            : 'h-16 px-4 flex items-center justify-between gap-2'
        }`}
      >
        <NavLink
          to="/dashboard"
          onClick={onCloseMobile}
          title={collapsed ? 'Smart Inventory' : undefined}
          className={`flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md overflow-hidden ${
            collapsed ? 'justify-center shrink-0 p-0.5' : 'gap-3 min-w-0 flex-1'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <LogoIcon className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 leading-tight overflow-hidden">
              <span className="font-semibold text-sm text-[#0F172A] tracking-tight truncate">
                Smart Inventory
              </span>
              <span className="text-[11px] font-medium text-[#475569] uppercase tracking-wider truncate">
                Enterprise v1.0
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`hidden lg:inline-flex items-center justify-center shrink-0 relative z-10 rounded-md text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors cursor-pointer ${
            collapsed
              ? 'w-10 h-7 bg-[#F8FAFC] border border-[#E2E8F0]'
              : 'p-1.5'
          }`}
          title={collapsed ? t('nav.expand') : t('nav.collapse')}
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-5 scrollbar-thin">
        {navSections
          .map((section) => ({
            ...section,
            items: section.items.filter((item) => canAccessNavKey(activeRole, item.key)),
          }))
          .filter((section) => section.items.length > 0)
          .map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed ? (
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase">
                {language === 'vi' ? section.titleVi : section.titleEn}
              </div>
            ) : (
              <div className="h-2 border-t border-[#F1F5F9] my-1" />
            )}

            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const label = t(item.labelKey);

                return (
                  <li key={item.key}>
                    <NavLink
                      to={item.path}
                      onClick={onCloseMobile}
                      title={collapsed ? label : undefined}
                      className={({ isActive }) => `
                        relative flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
                        ${
                          collapsed
                            ? 'justify-center h-10 w-10 mx-auto'
                            : 'px-3 h-9 w-full'
                        }
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                            : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <IconComponent
                            className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                              isActive ? 'text-blue-600' : 'text-[#64748B]'
                            }`}
                          />
                          {!collapsed && (
                            <span className="truncate flex-1 text-left">{label}</span>
                          )}
                          {!collapsed && item.badge && (
                            <Badge
                              variant={item.badge.variant}
                              size="sm"
                              className="ml-auto font-semibold px-1.5 py-0 text-[10px]"
                            >
                              {item.badge.count}
                            </Badge>
                          )}
                          {collapsed && item.badge && (
                            <span
                              className={`
                                absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-white
                                ${item.badge.variant === 'error' ? 'bg-red-500' : 'bg-blue-500'}
                              `}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Operational Mode Tag / Bottom status */}
      <div className="p-3 border-t border-[#E2E8F0] shrink-0 bg-[#F8FAFC]">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[#334155]">System Online</span>
            </div>
            <span className="text-[10px] text-[#94A3B8]">UTC+7</span>
          </div>
        ) : (
          <div className="flex justify-center" title="System Online">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          </div>
        )}
      </div>
    </aside>
  );
};
