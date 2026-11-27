import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Bell,
  Boxes,
  ClipboardCheck,
  CornerDownLeft,
  LayoutDashboard,
  Package,
  Scale,
  Search,
  Settings,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import { MOTION_OVERLAY, MOTION_SPRING, useSafeReducedMotion } from '../design-system';
import { useTranslation } from '../i18n';
import { canAccessNavKey, useRolePreview, type NavMenuKey } from '../features/users-rbac';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  activeWarehouse: string;
  onSelectWarehouse: (code: string) => void;
}

interface CommandItem {
  id: string;
  group: 'nav' | 'warehouse';
  label: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  active?: boolean;
}

const NAV_COMMANDS: ReadonlyArray<{
  key: NavMenuKey;
  labelKey: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'dashboard', labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'stock-in', labelKey: 'nav.stockIn', path: '/stock-in', icon: ArrowDownToLine },
  { key: 'stock-out', labelKey: 'nav.stockOut', path: '/stock-out', icon: ArrowUpFromLine },
  { key: 'stocktaking', labelKey: 'nav.stocktaking', path: '/stocktaking', icon: ClipboardCheck },
  { key: 'products', labelKey: 'nav.products', path: '/products', icon: Package },
  { key: 'warehouses', labelKey: 'nav.warehouses', path: '/warehouses', icon: Warehouse },
  { key: 'categories', labelKey: 'nav.categories', path: '/categories', icon: Boxes },
  { key: 'units', labelKey: 'nav.units', path: '/units', icon: Scale },
  { key: 'suppliers', labelKey: 'nav.suppliers', path: '/suppliers', icon: Truck },
  { key: 'alerts', labelKey: 'nav.alerts', path: '/alerts', icon: Bell },
  { key: 'reports', labelKey: 'nav.reports', path: '/reports', icon: BarChart3 },
  { key: 'users', labelKey: 'nav.users', path: '/users', icon: Users },
  { key: 'settings', labelKey: 'nav.settings', path: '/settings', icon: Settings },
];

const WAREHOUSE_COMMANDS = [
  { code: 'ALL', labelKey: 'topbar.allWarehouses' },
  { code: 'WH-01', labelKey: 'topbar.warehouseHanoi' },
  { code: 'WH-02', labelKey: 'topbar.warehouseDanang' },
  { code: 'WH-03', labelKey: 'topbar.warehouseSaigon' },
] as const;

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  activeWarehouse,
  onSelectWarehouse,
}) => {
  const { t } = useTranslation();
  const { activeRole } = useRolePreview();
  const navigate = useNavigate();
  const shouldReduceMotion = useSafeReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = NAV_COMMANDS.filter((item) =>
      canAccessNavKey(activeRole, item.key)
    ).map((item) => ({
      id: `nav-${item.key}`,
      group: 'nav',
      label: t(item.labelKey),
      subtitle: item.path,
      icon: item.icon,
      onSelect: () => {
        navigate(item.path);
        onClose();
      },
    }));

    const whItems: CommandItem[] = WAREHOUSE_COMMANDS.map((wh) => ({
      id: `wh-${wh.code}`,
      group: 'warehouse',
      label: `${t('topbar.warehouse')}: ${t(wh.labelKey)}`,
      subtitle: wh.code,
      icon: Warehouse,
      active: activeWarehouse === wh.code,
      onSelect: () => {
        onSelectWarehouse(wh.code);
        onClose();
      },
    }));

    const all = [...navItems, ...whItems];
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return all;
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(trimmed) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(trimmed))
    );
  }, [activeRole, activeWarehouse, navigate, onClose, onSelectWarehouse, query, t]);

  const safeIndex = items.length > 0 ? Math.min(activeIndex, items.length - 1) : 0;

  const handleClose = () => {
    setQuery('');
    setActiveIndex(0);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }
    if (items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = items[safeIndex];
      setQuery('');
      setActiveIndex(0);
      target?.onSelect();
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[75] flex items-start justify-center pt-[12vh] px-3 sm:px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
          onKeyDown={handleKeyDown}
        >
          <m.div
            initial={MOTION_OVERLAY.backdrop.initial}
            animate={MOTION_OVERLAY.backdrop.animate}
            exit={MOTION_OVERLAY.backdrop.exit}
            transition={MOTION_OVERLAY.backdrop.transition}
            onClick={handleClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs"
          />

          <m.div
            initial={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.modalPanel.initial}
            animate={MOTION_OVERLAY.modalPanel.animate}
            exit={shouldReduceMotion ? { opacity: 0 } : MOTION_OVERLAY.modalPanel.exit}
            transition={shouldReduceMotion ? { duration: 0.08 } : MOTION_OVERLAY.modalPanel.transition}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[70dvh]"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0]">
              <Search className="w-4.5 h-4.5 text-[#64748B] shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder={`${t('common.search').replace(/[.…]+$/, '')}...`}
                className="flex-1 min-w-0 bg-transparent text-base sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] font-mono text-[10px] font-semibold text-[#64748B]">
                ESC
              </kbd>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
              {items.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#94A3B8]">
                  {t('table.noDataTitle')}
                </div>
              ) : (
                items.map((item, idx) => {
                  const Icon = item.icon;
                  const isHighlighted = idx === safeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={item.onSelect}
                      className={`relative w-full flex items-center gap-3 px-3 min-h-11 sm:min-h-10 py-2 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                        isHighlighted ? 'text-[#0F172A]' : 'text-[#475569]'
                      }`}
                    >
                      {isHighlighted && (
                        <m.span
                          layoutId="command-palette-active-item"
                          aria-hidden="true"
                          transition={shouldReduceMotion ? { duration: 0.01 } : MOTION_SPRING.tab}
                          className="pointer-events-none absolute inset-0 rounded-lg bg-[#EFF6FF] border border-blue-200/80"
                        />
                      )}
                      <Icon
                        className={`relative z-10 w-4 h-4 shrink-0 ${
                          isHighlighted ? 'text-[#2563EB]' : 'text-[#64748B]'
                        }`}
                      />
                      <span className="relative z-10 flex-1 min-w-0 truncate font-medium text-xs sm:text-sm">
                        {item.label}
                      </span>
                      {item.subtitle && (
                        <span className="relative z-10 font-mono text-[11px] text-[#94A3B8] shrink-0">
                          {item.subtitle}
                        </span>
                      )}
                      {isHighlighted && (
                        <CornerDownLeft className="relative z-10 w-3.5 h-3.5 text-[#2563EB] shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
