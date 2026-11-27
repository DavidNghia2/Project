import React from 'react';
import { NavLink } from 'react-router-dom';
import { m } from 'motion/react';
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
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { Badge, MOTION_SPRING, Tooltip, useSafeReducedMotion } from '../design-system';
import {
  canAccessNavKey,
  useRolePreview,
  type NavMenuKey,
} from '../features/users-rbac';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
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
  titleKey: string;
  items: NavItem[];
}

function isActionableBadge(badge?: NavItem['badge']): badge is NonNullable<NavItem['badge']> {
  return Boolean(badge && badge.variant !== 'neutral');
}

function formatCollapsedBadgeCount(count: string | number): string {
  const numeric = typeof count === 'number' ? count : Number(count);
  if (Number.isFinite(numeric) && numeric > 99) {
    return '99+';
  }
  return String(count);
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onCloseMobile,
  isMobileDrawer = false,
}) => {
  const { t } = useTranslation();
  const { activeRole } = useRolePreview();
  const shouldReduceMotion = useSafeReducedMotion();
  const activeIndicatorId = isMobileDrawer ? 'sidebar-mobile-active' : 'sidebar-desktop-active';

  const navSections: NavSection[] = [
    {
      titleKey: 'nav.sections.operations',
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
      titleKey: 'nav.sections.masterData',
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
      titleKey: 'nav.sections.insights',
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
      titleKey: 'nav.sections.admin',
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
        flex flex-col h-full bg-white select-none
        transition-[width] duration-200 ease-[var(--motion-ease-out)] shrink-0
        ${isMobileDrawer ? 'w-full' : `border-r border-[#E2E8F0] ${collapsed ? 'w-18' : 'w-64'}`}
      `}
      aria-label={t('nav.menu')}
    >
      {/* Brand Header */}
      <div
        className={`border-b border-[#E2E8F0] shrink-0 transition-all duration-200 ${
          collapsed
            ? 'py-3 px-2 flex flex-col items-center justify-center gap-2'
            : 'h-16 px-4 flex items-center justify-between gap-2'
        }`}
      >
        <NavLink
          to="/dashboard"
          onClick={onCloseMobile}
          title={collapsed ? t('layout.brandName') : undefined}
          className={`flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md ${
            collapsed ? 'justify-center shrink-0 p-0.5' : 'gap-3 min-w-0 flex-1'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <LogoIcon className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-semibold text-sm text-[#0F172A] tracking-tight truncate">
                {t('layout.brandName')}
              </span>
              <span className="text-[11px] font-medium text-[#475569] uppercase tracking-wider truncate">
                {t('layout.brandSub')}
              </span>
            </div>
          )}
        </NavLink>

        {/* Mobile Drawer Close Button (44x44 touch target) */}
        {isMobileDrawer && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex lg:hidden items-center justify-center min-h-11 min-w-11 -mr-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors shrink-0 cursor-pointer"
            aria-label={t('layout.closeNavAria')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        {!isMobileDrawer && (
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
        )}
      </div>

      {/* Navigation List */}
      <nav
        className={`flex-1 overflow-y-auto px-2 py-3 space-y-5 ${
          collapsed && !isMobileDrawer ? 'sidebar-rail-scroll' : 'sidebar-nav-scroll'
        }`}
      >
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
                {t(section.titleKey)}
              </div>
            ) : (
              <div className="h-2 border-t border-[#F1F5F9] my-1 mx-2" />
            )}

            <ul className={collapsed ? 'space-y-1' : 'space-y-0.5'}>
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const label = t(item.labelKey);
                const actionableBadge = isActionableBadge(item.badge) ? item.badge : null;
                const collapsedAriaLabel = item.badge ? `${label} (${item.badge.count})` : label;
                const tooltipContent = item.badge ? (
                  <span className="inline-flex items-center gap-2">
                    <span>{label}</span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold tabular-nums leading-none ${
                        item.badge.variant === 'error'
                          ? 'bg-red-600 text-white'
                          : item.badge.variant === 'warning'
                          ? 'bg-amber-600 text-white'
                          : item.badge.variant === 'info'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/15 text-slate-200'
                      }`}
                    >
                      {item.badge.count}
                    </span>
                  </span>
                ) : (
                  label
                );

                return (
                  <li key={item.key} className={collapsed ? 'flex justify-center' : undefined}>
                    <Tooltip
                      content={tooltipContent}
                      placement="right"
                      disabled={!collapsed || isMobileDrawer}
                      triggerClassName={collapsed ? 'flex w-full justify-center' : 'inline-flex'}
                    >
                      <NavLink
                        to={item.path}
                        onClick={onCloseMobile}
                        aria-label={collapsed ? collapsedAriaLabel : undefined}
                        className={({ isActive }) => `
                          group/nav relative flex items-center rounded-lg text-sm font-medium transition-colors duration-150
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
                          ${
                            collapsed
                              ? 'justify-center h-10 w-10'
                              : 'gap-3 px-3 min-h-11 lg:min-h-9 py-2 lg:py-0 w-full'
                          }
                          ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                          }
                        `}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <m.span
                                layoutId={activeIndicatorId}
                                aria-hidden="true"
                                transition={shouldReduceMotion ? { duration: 0.01 } : MOTION_SPRING.tab}
                                className="pointer-events-none absolute inset-0 rounded-lg bg-blue-50/90 ring-1 ring-blue-200/70 shadow-2xs"
                              />
                            )}
                            {isActive && !collapsed && (
                              <m.span
                                layoutId={`${activeIndicatorId}-bar`}
                                aria-hidden="true"
                                transition={shouldReduceMotion ? { duration: 0.01 } : MOTION_SPRING.tab}
                                className="pointer-events-none absolute start-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-blue-600"
                              />
                            )}
                            <IconComponent
                              className={`relative z-10 w-4.5 h-4.5 shrink-0 transition-colors ${
                                isActive ? 'text-blue-600' : 'text-[#64748B]'
                              }`}
                            />
                            {!collapsed && (
                              <span className="relative z-10 truncate flex-1 text-left">{label}</span>
                            )}
                            {!collapsed && item.badge && (
                              <Badge
                                variant={item.badge.variant}
                                size="sm"
                                className="relative z-10 ml-auto font-semibold px-1.5 py-0 text-[10px]"
                              >
                                {item.badge.count}
                              </Badge>
                            )}
                            {collapsed && actionableBadge && (
                              <m.span
                                key={`collapsed-badge-${item.key}-${actionableBadge.count}`}
                                data-testid={`collapsed-badge-${item.key}`}
                                aria-hidden="true"
                                initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={shouldReduceMotion ? { duration: 0.01 } : MOTION_SPRING.snappy}
                                className={`
                                  pointer-events-none absolute -top-0.5 -end-0.5 z-20
                                  min-w-[16px] h-4 px-1 rounded-full
                                  text-[10px] font-bold leading-none tabular-nums
                                  flex items-center justify-center
                                  ring-2 transition-colors
                                  ${
                                    isActive
                                      ? 'ring-[#EFF6FF]'
                                      : 'ring-white group-hover/nav:ring-[#F1F5F9]'
                                  }
                                  ${
                                    actionableBadge.variant === 'error'
                                      ? 'bg-red-600 text-white'
                                      : actionableBadge.variant === 'warning'
                                      ? 'bg-amber-700 text-white'
                                      : 'bg-blue-600 text-white'
                                  }
                                `}
                              >
                                {formatCollapsedBadgeCount(actionableBadge.count)}
                              </m.span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Operational Mode Tag / Bottom status */}
      <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:pb-3 border-t border-[#E2E8F0] shrink-0 bg-[#F8FAFC]">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[#334155]">{t('nav.systemOnline')}</span>
            </div>
            <span className="text-[10px] text-[#94A3B8]">UTC+7</span>
          </div>
        ) : (
          <div className="flex justify-center" title={t('nav.systemOnline')}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          </div>
        )}
      </div>
    </aside>
  );
};
