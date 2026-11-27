import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import {
  Menu,
  Bell,
  Warehouse,
  ChevronDown,
  Search,
  User,
  Shield,
  LogOut,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  PackagePlus,
} from 'lucide-react';
import { LanguageSelect, useTranslation } from '../i18n';
import { Badge, MOTION_OVERLAY, MOTION_SPRING, useSafeReducedMotion } from '../design-system';
import { ROLE_META, useRolePreview, type RoleCode } from '../features/users-rbac';
import { useAuth } from '../features/auth/useAuth';
import type { Warehouse as WarehouseRecord } from '../features/master-data/types';

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
  onOpenCommandPalette?: () => void;
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
  onOpenCommandPalette,
}) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useSafeReducedMotion();
  const { activeRole, capabilities } = useRolePreview();
  const { user: authUser, signOut, isMockMode } = useAuth();
  const location = useLocation();
  const companyId = authUser?.company?.id;
  const [remoteWarehouses, setRemoteWarehouses] = useState<{ companyId: string; rows: WarehouseRecord[] }>();
  useEffect(() => {
    if (isMockMode || !companyId) return;
    let active = true;
    void import('../features/master-data/warehouseRepository')
      .then(({ fetchCompanyWarehouses }) => fetchCompanyWarehouses())
      .then(({ warehouses }) => {
        if (active) setRemoteWarehouses({ companyId, rows: warehouses.filter((warehouse) => warehouse.status === 'active') });
      }).catch(() => { if (active) setRemoteWarehouses(undefined); });
    return () => { active = false; };
  }, [isMockMode, companyId, location.pathname, authUser?.assignedWarehouses]);
  const roleMeta = ROLE_META[activeRole];
  const avatarMeta = ROLE_AVATAR_META[activeRole];
  const navigate = useNavigate();

  const displayInitials = authUser?.avatarInitials ?? avatarMeta.initials;
  const displayName =
    authUser?.fullName ?? (activeRole === 'ADMIN' ? t('topbar.adminUser') : t(roleMeta.labelKey));
  const displayEmail = authUser?.email ?? `${avatarMeta.emailPrefix}@smartinventory.local`;

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await signOut();
    navigate('/', { replace: true });
  };

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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsWarehouseOpen(false);
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
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
    { code: 'ALL', label: t('topbar.allWarehouses') },
    ...(isMockMode || !companyId ? [
      { code: 'WH-01', label: t('topbar.warehouseHanoi') },
      { code: 'WH-02', label: t('topbar.warehouseDanang') },
      { code: 'WH-03', label: t('topbar.warehouseSaigon') },
    ] : (remoteWarehouses?.companyId === companyId ? remoteWarehouses?.rows ?? [] : []).map((warehouse) => ({
      code: warehouse.id,
      label: [warehouse.code, warehouse.name, warehouse.country].filter(Boolean).join(' · '),
    }))),
  ];

  const currentWh = warehouses.find((w) => w.code === activeWarehouse) || warehouses[0];

  return (
    <header className="h-16 shrink-0 bg-white border-b border-[#E2E8F0] px-2.5 sm:px-4 lg:px-6 sticky top-0 z-20">
      <div className="h-full w-full max-w-7xl 2xl:max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Page Title/Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 -ml-1 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors shrink-0 cursor-pointer"
            aria-label={t('topbar.openMenuAria')}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex flex-col min-w-0 flex-1">
            <nav
              className="hidden md:flex items-center gap-1.5 text-xs text-[#64748B] mb-0.5 whitespace-nowrap overflow-hidden"
              aria-label={t('topbar.breadcrumbAria')}
            >
              <Link to="/dashboard" className="hover:text-blue-600 transition-colors shrink-0">
                {t('layout.brandName')}
              </Link>
              {pageInfo.parent && (
                <>
                  <span className="text-[#CBD5E1] shrink-0">/</span>
                  <span className="text-[#64748B] shrink-0">{pageInfo.parent}</span>
                </>
              )}
              <span className="text-[#CBD5E1] shrink-0">/</span>
              <span className="text-[#0F172A] font-medium truncate">{pageInfo.title}</span>
            </nav>
            <h1
              style={{ viewTransitionName: 'app-page-title' }}
              className="text-sm sm:text-lg font-semibold text-[#0F172A] tracking-tight truncate leading-tight"
            >
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Quick Command Palette Trigger (desktop md+) */}
          {onOpenCommandPalette && (
            <button
              type="button"
              id="btn-open-command-palette"
              onClick={onOpenCommandPalette}
              className="hidden md:inline-flex items-center gap-2 h-9 px-2.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              aria-label="Quick command palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <kbd className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#475569]">
                Ctrl K
              </kbd>
            </button>
          )}

          {/* Warehouse Selector */}
          <div className="relative" ref={warehouseRef}>
            <button
              type="button"
              onClick={() => {
                setIsWarehouseOpen((prev) => !prev);
                setIsNotificationOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-11 min-w-11 sm:min-h-9 sm:min-w-0 px-2 sm:px-3 rounded-md border border-[#CBD5E1] bg-white text-xs sm:text-sm text-[#0F172A] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors cursor-pointer"
              title={t('topbar.warehouse')}
              aria-label={`${t('topbar.warehouse')}: ${currentWh.label}`}
              aria-haspopup="listbox"
              aria-expanded={isWarehouseOpen}
            >
              <Warehouse className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
              <span className="hidden min-[400px]:inline sm:hidden font-mono text-xs font-semibold">
                {isMockMode || currentWh.code === 'ALL' ? currentWh.code : currentWh.label.split(' · ')[0]}
              </span>
              <span className="hidden sm:inline font-medium max-w-[140px] lg:max-w-[180px] truncate text-left">
                {currentWh.label}
              </span>
              <ChevronDown
                className={`hidden sm:block w-3.5 h-3.5 text-[#64748B] shrink-0 transition-transform duration-150 ${
                  isWarehouseOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence>
              {isWarehouseOpen && (
                <m.div
                  role="listbox"
                  aria-label={t('topbar.warehouse')}
                  initial={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.popover.initial}
                  animate={MOTION_OVERLAY.popover.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.popover.exit}
                  transition={MOTION_OVERLAY.popover.transition}
                  className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-1.5 sm:w-64 max-h-[calc(100dvh-5rem)] overflow-y-auto bg-white border border-[#CBD5E1] rounded-lg shadow-lg py-1 z-30 origin-top-right"
                >
                  <div className="px-3 py-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider border-b border-[#F1F5F9]">
                    {t('topbar.warehouse')}
                  </div>
                  {warehouses.map((wh) => (
                    <button
                      key={wh.code}
                      type="button"
                      role="option"
                      aria-selected={activeWarehouse === wh.code}
                      onClick={() => {
                        onSelectWarehouse(wh.code);
                        setIsWarehouseOpen(false);
                      }}
                      className={`
                        w-full text-left px-3 min-h-11 sm:min-h-9 py-2 text-sm sm:text-xs flex items-center justify-between
                        transition-colors hover:bg-[#F1F5F9] cursor-pointer
                        ${activeWarehouse === wh.code ? 'font-semibold text-blue-600 bg-blue-50/60' : 'text-[#334155]'}
                      `}
                    >
                      <span className="truncate">{wh.label}</span>
                      {activeWarehouse === wh.code && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                    </button>
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          </div>

          <LanguageSelect id="workspace-language" className="hidden sm:block" />

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationOpen((prev) => !prev);
                setIsWarehouseOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="relative inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 rounded-md text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors cursor-pointer"
              title={t('topbar.notifications')}
              aria-label={t('topbar.notifications')}
              aria-expanded={isNotificationOpen}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <m.span
                    key={unreadCount}
                    initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.12 } }}
                    transition={MOTION_SPRING.snappy}
                    className="absolute top-1.5 right-1.5 sm:top-1 sm:right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white"
                  >
                    {unreadCount}
                  </m.span>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <m.div
                  initial={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.popover.initial}
                  animate={MOTION_OVERLAY.popover.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.popover.exit}
                  transition={MOTION_OVERLAY.popover.transition}
                  className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-1.5 sm:w-96 max-h-[calc(100dvh-5rem)] flex flex-col bg-white border border-[#CBD5E1] rounded-lg shadow-xl py-2 z-30 origin-top-right"
                >
                  <div className="px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm text-[#0F172A] truncate">{t('topbar.notifications')}</span>
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
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline py-1 shrink-0 cursor-pointer"
                      >
                        {t('topbar.markAllRead')}
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#94A3B8]">
                        {t('topbar.noNotifications')}
                      </div>
                    ) : (
                      notifications.map((item, idx) => (
                        <m.div
                          key={item.id}
                          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.16, delay: idx * 0.03 }}
                          className={`p-3 text-xs flex gap-3 hover:bg-[#F8FAFC] transition-colors duration-200 ${
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
                          <AnimatePresence>
                            {item.unread && (
                              <m.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center"
                              />
                            )}
                          </AnimatePresence>
                        </m.div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 px-3 border-t border-[#F1F5F9] shrink-0">
                    <Link
                      to="/alerts"
                      onClick={() => setIsNotificationOpen(false)}
                      className="flex items-center justify-center min-h-10 sm:min-h-8 text-xs font-medium text-blue-600 hover:text-blue-800 py-1"
                    >
                      {t('common.view')} {t('nav.alerts')} &rarr;
                    </Link>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar & Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen((prev) => !prev);
                setIsWarehouseOpen(false);
                setIsNotificationOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 sm:min-h-9 sm:min-w-0 pl-1 pr-1 sm:pr-1.5 py-1 rounded-md hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors cursor-pointer"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              aria-label={t('topbar.userMenuAria')}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 ring-2 ring-blue-100">
                {displayInitials}
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-[#0F172A] max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-[#64748B]">{t(`topbar.roleShort.${activeRole}`)}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#64748B] shrink-0 hidden md:block transition-transform duration-150 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <m.div
                  role="menu"
                  initial={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.popover.initial}
                  animate={MOTION_OVERLAY.popover.animate}
                  exit={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.popover.exit}
                  transition={MOTION_OVERLAY.popover.transition}
                  className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-1.5 sm:w-60 max-h-[calc(100dvh-5rem)] overflow-y-auto bg-white border border-[#CBD5E1] rounded-lg shadow-xl py-1 z-30 origin-top-right"
                >
                  <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {displayEmail}
                    </p>
                    <Badge variant={roleMeta.badgeVariant} size="sm" className="mt-1.5 text-[10px]">
                      {activeRole === 'ADMIN' ? t('topbar.adminRole') : activeRole}
                    </Badge>
                  </div>

                  {/* Mobile language switcher (keeps full language access on 320px-639px without crowding Topbar) */}
                  <div className="sm:hidden px-4 py-2.5 border-b border-[#E2E8F0]">
                    <label htmlFor="workspace-language-mobile" className="block text-[11px] font-medium text-[#64748B] mb-1.5">
                      {t('demo.switch_lang')}
                    </label>
                    <LanguageSelect id="workspace-language-mobile" className="w-full" />
                  </div>

                  <div className="py-1">
                    {capabilities.canManageUsers && (
                      <Link
                        to="/users"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 min-h-11 sm:min-h-9 py-2 text-sm sm:text-xs text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#64748B] shrink-0" />
                        <span>{t('topbar.profile')}</span>
                      </Link>
                    )}
                    {capabilities.canManageSettings && (
                      <Link
                        to="/settings"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 min-h-11 sm:min-h-9 py-2 text-sm sm:text-xs text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 text-[#64748B] shrink-0" />
                        <span>{t('topbar.accountSettings')}</span>
                      </Link>
                    )}
                    <Link
                      to="/reports"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 min-h-11 sm:min-h-9 py-2 text-sm sm:text-xs text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                    >
                      <Shield className="w-4 h-4 text-[#64748B] shrink-0" />
                      <span>{t('topbar.systemAudit')}</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#E2E8F0] pt-1">
                    <button
                      type="button"
                      role="menuitem"
                      id="btn-topbar-logout"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 min-h-11 sm:min-h-9 py-2 text-sm sm:text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{t('topbar.logout')}</span>
                    </button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
