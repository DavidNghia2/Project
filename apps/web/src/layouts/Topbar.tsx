import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Warehouse,
  ChevronDown,
  Globe,
  User,
  Shield,
  LogOut,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  PackagePlus,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { Badge } from '../design-system';
import { ROLE_META, useRolePreview, type RoleCode } from '../features/users-rbac';

const ROLE_AVATAR_META: Record<RoleCode, { initials: string; emailPrefix: string }> = {
  ADMIN: { initials: 'AD', emailPrefix: 'admin' },
  WAREHOUSE_MANAGER: { initials: 'WM', emailPrefix: 'manager' },
  WAREHOUSE_STAFF: { initials: 'WS', emailPrefix: 'staff' },
  VIEWER: { initials: 'VW', emailPrefix: 'viewer' },
};

export interface TopbarProps {
  onOpenMobileMenu: () => void;
  activeWarehouse: string;
  onSelectWarehouse: (whCode: string) => void;
}

interface MockNotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  titleKey: string;
  timeKey: string;
  unread: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  activeWarehouse,
  onSelectWarehouse,
}) => {
  const { t, language, toggleLanguage } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const roleMeta = ROLE_META[activeRole];
  const avatarMeta = ROLE_AVATAR_META[activeRole];
  const location = useLocation();

  // Dropdown states
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Mock notifications state
  const [notifications, setNotifications] = useState<MockNotification[]>([
    {
      id: '1',
      type: 'warning',
      titleKey: 'topbar.mockNotifs.n1Title',
      timeKey: 'topbar.mockNotifs.n1Time',
      unread: true,
    },
    {
      id: '2',
      type: 'info',
      titleKey: 'topbar.mockNotifs.n2Title',
      timeKey: 'topbar.mockNotifs.n2Time',
      unread: true,
    },
    {
      id: '3',
      type: 'success',
      titleKey: 'topbar.mockNotifs.n3Title',
      timeKey: 'topbar.mockNotifs.n3Time',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Close dropdowns on outside click
  const warehouseRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (warehouseRef.current && !warehouseRef.current.contains(e.target as Node)) {
        setIsWarehouseOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute breadcrumbs and title
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      return { title: t('nav.dashboard'), parent: null };
    }
    if (path.startsWith('/products')) {
      return { title: t('nav.products'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/warehouses')) {
      return { title: t('nav.warehouses'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/categories')) {
      return { title: t('nav.categories'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/units')) {
      return { title: t('nav.units'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/suppliers')) {
      return { title: t('nav.suppliers'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/stock-in')) {
      return { title: t('nav.stockIn'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/stock-out')) {
      return { title: t('nav.stockOut'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/stocktaking')) {
      return { title: t('nav.stocktaking'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/reports')) {
      return { title: t('nav.reports'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/alerts')) {
      return { title: t('nav.alerts'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/users')) {
      return { title: t('nav.users'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/settings')) {
      return { title: t('nav.settings'), parent: t('nav.dashboard') };
    }
    if (path.startsWith('/design-system')) {
      return { title: t('nav.designSystem'), parent: t('nav.dashboard') };
    }
    return { title: t('notFound.title'), parent: t('nav.dashboard') };
  };

  const pageInfo = getPageInfo();

  const warehouses = [
    { code: 'ALL', labelKey: 'topbar.allWarehouses' },
    { code: 'WH-01', labelKey: 'topbar.warehouseHanoi' },
    { code: 'WH-02', labelKey: 'topbar.warehouseDanang' },
    { code: 'WH-03', labelKey: 'topbar.warehouseSaigon' },
  ];

  const currentWh = warehouses.find((w) => w.code === activeWarehouse) || warehouses[0];

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile Toggle & Page Title/Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-1 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
          aria-label={t('topbar.openMenuAria')}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] mb-0.5" aria-label={t('topbar.breadcrumbAria')}>
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
              {t('layout.brandName')}
            </Link>
            {pageInfo.parent && (
              <>
                <span className="text-[#CBD5E1]">/</span>
                <span className="text-[#64748B]">{pageInfo.parent}</span>
              </>
            )}
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[#0F172A] font-medium truncate">{pageInfo.title}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] tracking-tight truncate leading-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Warehouse Selector */}
        <div className="relative" ref={warehouseRef}>
          <button
            type="button"
            onClick={() => setIsWarehouseOpen((prev) => !prev)}
            className="flex items-center gap-2 h-9 px-3 rounded-md border border-[#CBD5E1] bg-white text-xs sm:text-sm text-[#0F172A] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
            title={t('topbar.warehouse')}
            aria-expanded={isWarehouseOpen}
          >
            <Warehouse className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium max-w-[120px] sm:max-w-[180px] truncate text-left">
              {t(currentWh.labelKey)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          </button>

          {isWarehouseOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-[#CBD5E1] rounded-lg shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider border-b border-[#F1F5F9]">
                {t('topbar.warehouse')}
              </div>
              {warehouses.map((wh) => (
                <button
                  key={wh.code}
                  type="button"
                  onClick={() => {
                    onSelectWarehouse(wh.code);
                    setIsWarehouseOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between
                    transition-colors hover:bg-[#F1F5F9]
                    ${activeWarehouse === wh.code ? 'font-semibold text-blue-600 bg-blue-50/60' : 'text-[#334155]'}
                  `}
                >
                  <span className="truncate">{t(wh.labelKey)}</span>
                  {activeWarehouse === wh.code && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Switcher Pill */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
          title={t('demo.switch_lang')}
          aria-label={t('demo.switch_lang')}
        >
          <Globe className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="uppercase">{language}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="relative p-2 rounded-md text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
            title={t('topbar.notifications')}
            aria-label={t('topbar.notifications')}
            aria-expanded={isNotificationOpen}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white border border-[#CBD5E1] rounded-lg shadow-xl py-2 z-30 animate-in fade-in duration-100">
              <div className="px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#0F172A]">{t('topbar.notifications')}</span>
                  {unreadCount > 0 && (
                    <Badge variant="error" size="sm">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    {t('topbar.markAllRead')}
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#94A3B8]">
                    {t('topbar.noNotifications')}
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 text-xs flex gap-3 hover:bg-[#F8FAFC] transition-colors ${
                        item.unread ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {item.type === 'info' && <PackagePlus className="w-4 h-4 text-blue-500" />}
                        {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[#0F172A] leading-snug ${item.unread ? 'font-semibold' : 'font-normal'}`}>
                          {t(item.titleKey)}
                        </p>
                        <span className="text-[11px] text-[#94A3B8] mt-1 block">
                          {t(item.timeKey)}
                        </span>
                      </div>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 px-3 border-t border-[#F1F5F9]">
                <Link
                  to="/alerts"
                  onClick={() => setIsNotificationOpen(false)}
                  className="block text-center text-xs font-medium text-blue-600 hover:text-blue-800 py-1"
                >
                  {t('common.view')} {t('nav.alerts')} &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-md hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
            aria-expanded={isUserMenuOpen}
            aria-label={t('topbar.userMenuAria')}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 ring-2 ring-blue-100">
              {avatarMeta.initials}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-[#0F172A] max-w-[120px] truncate">
                {activeRole === 'ADMIN' ? t('topbar.adminUser') : t(roleMeta.labelKey)}
              </span>
              <span className="text-[10px] text-[#64748B]">{t(`topbar.roleShort.${activeRole}`)}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0 hidden md:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-[#CBD5E1] rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#0F172A] truncate">
                  {activeRole === 'ADMIN' ? t('topbar.adminUser') : t(roleMeta.labelKey)}
                </p>
                <p className="text-[11px] text-[#64748B] truncate">
                  {`${avatarMeta.emailPrefix}@smartinventory.local`}
                </p>
                <Badge variant={roleMeta.badgeVariant} size="sm" className="mt-1.5 text-[10px]">
                  {activeRole === 'ADMIN' ? t('topbar.adminRole') : activeRole}
                </Badge>
              </div>

              <div className="py-1">
                {capabilities.canManageUsers && (
                  <Link
                    to="/users"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#64748B]" />
                    <span>{t('topbar.profile')}</span>
                  </Link>
                )}
                {capabilities.canManageSettings && (
                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-[#64748B]" />
                    <span>{t('topbar.accountSettings')}</span>
                  </Link>
                )}
                <Link
                  to="/reports"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#64748B]" />
                  <span>{t('topbar.systemAudit')}</span>
                </Link>
              </div>

              <div className="border-t border-[#E2E8F0] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    alert(t('topbar.logoutMockAlert'));
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>{t('topbar.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
