import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader } from '../../components/PageHeader';
import { I18nProvider } from '../../i18n';
import {
  MOTION_OVERLAY,
  MOTION_STAGGER_PRESETS,
  MotionReveal,
  MotionRoot,
  StaggerGroup,
  StaggerItem,
  StaggerList,
  Table,
  createStaggerItemVariants,
  createTableRowMotionProps,
  getCappedStaggerDelay,
  getStaggerVariantKeys,
} from '../index';

function createControllableReducedMotionMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();

  const mock = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return query.includes('prefers-reduced-motion') ? matches : false;
    },
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: (_event: string, cb: () => void) => {
      if (query.includes('prefers-reduced-motion')) listeners.add(cb);
    },
    removeEventListener: (_event: string, cb: () => void) => {
      listeners.delete(cb);
    },
    dispatchEvent: vi.fn(),
  }));

  return {
    mock,
    setReducedMotion(next: boolean) {
      matches = next;
      listeners.forEach((cb) => cb());
    },
  };
}

describe('Global Motion Design System & Stagger Primitives', () => {
  it('computes deterministic delays and caps them at maxItems - 1 across all 9 presets', () => {
    expect(getCappedStaggerDelay(0, 'header')).toBe(0);
    expect(getCappedStaggerDelay(1, 'header')).toBe(0.07);
    expect(getCappedStaggerDelay(8, 'header')).toBe(0.07);

    expect(getCappedStaggerDelay(0, 'cards')).toBe(0.1);
    expect(getCappedStaggerDelay(7, 'cards')).toBe(0.625);
    expect(getCappedStaggerDelay(25, 'cards')).toBe(0.625);
    expect(getCappedStaggerDelay(-4, 'cards')).toBe(0.1);

    expect(getCappedStaggerDelay(0, 'sections')).toBe(0.04);
    expect(getCappedStaggerDelay(4, 'sections')).toBe(0.4);
    expect(getCappedStaggerDelay(12, 'sections')).toBe(0.4);

    expect(getCappedStaggerDelay(5, 'list')).toBe(0.515);
    expect(getCappedStaggerDelay(50, 'list')).toBe(0.515);
    expect(getCappedStaggerDelay(5, 'tableRow')).toBe(0.465);
    expect(getCappedStaggerDelay(50, 'tableRow')).toBe(0.465);

    expect(getCappedStaggerDelay(10, 'modal')).toBe(0.3);
    expect(getCappedStaggerDelay(10, 'form')).toBe(0.28);
    expect(getCappedStaggerDelay(20, 'chart')).toBe(0.4);
    expect(getCappedStaggerDelay(20, 'expressive')).toBe(0.585);

    // Unified variant builder & Table row helper share the exact same delay cap
    const v50 = createStaggerItemVariants('list', 'default', 50);
    const v5 = createStaggerItemVariants('list', 'default', 5);
    expect(v50.visible).toEqual(v5.visible);

    const row50 = createTableRowMotionProps(50, true, false);
    const row5 = createTableRowMotionProps(5, true, false);
    expect(row50.transition).toEqual(row5.transition);
    expect(createTableRowMotionProps(0, true, true).initial).toBe(false);

    expect(MOTION_STAGGER_PRESETS.cards.duration).toBeLessThanOrEqual(0.4);
    expect(MOTION_OVERLAY.modalPanel.exit.transition.duration).toBeLessThan(
      MOTION_OVERLAY.modalPanel.transition.duration
    );
  });

  it('supports isolated nested StaggerGroup channels and semantic HTML tags without visibility lockout', () => {
    expect(getStaggerVariantKeys('default')).toEqual({ hiddenKey: 'hidden', visibleKey: 'visible' });
    expect(getStaggerVariantKeys('isolated')).toEqual({
      hiddenKey: 'isolatedHidden',
      visibleKey: 'isolatedVisible',
    });

    const { container } = render(
      <MotionRoot>
        <StaggerGroup as="section" preset="sections" className="page-sections">
          <StaggerItem>
            <PageHeader
              title="Warehouse Operations"
              description="Live balance ledger"
              actions={<button type="button">New Voucher</button>}
            />
          </StaggerItem>
          <StaggerItem>
            <StaggerList as="ol" preset="list" isolate className="step-list">
              <StaggerItem as="li">Step 1: Intake</StaggerItem>
              <StaggerItem as="li">Step 2: Maker-Checker Approval</StaggerItem>
            </StaggerList>
          </StaggerItem>
          <MotionReveal as="article" className="secondary-note">
            Secondary Operational Guidance
          </MotionReveal>
        </StaggerGroup>
      </MotionRoot>
    );

    expect(container.querySelector('section.page-sections')).not.toBeNull();
    expect(container.querySelector('ol.step-list')).not.toBeNull();
    expect(container.querySelector('article.secondary-note')).not.toBeNull();
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByText('Warehouse Operations')).toBeVisible();
    expect(screen.getByText('New Voucher')).toBeVisible();
    expect(screen.getByText('Step 1: Intake')).toBeVisible();
    expect(screen.getByText('Secondary Operational Guidance')).toBeVisible();
  });

  it('preserves input focus and typed values across live prefers-reduced-motion toggles in Stagger and Table', async () => {
    const originalMatchMedia = window.matchMedia;
    const controller = createControllableReducedMotionMatchMedia(false);
    window.matchMedia = controller.mock;
    const user = userEvent.setup();

    try {
      const rows = [{ id: 'row-1', label: 'SKU-001' }];
      render(
        <I18nProvider>
          <MotionRoot>
            <StaggerGroup preset="form">
              <StaggerItem>
                <input aria-label="Voucher Note" defaultValue="" />
              </StaggerItem>
            </StaggerGroup>
            <Table
              columns={[
                {
                  key: 'label',
                  label: 'Item',
                  render: (_val, rec) => <input aria-label={`Row ${rec.id}`} defaultValue="" />,
                },
              ]}
              data={rows}
            />
          </MotionRoot>
        </I18nProvider>
      );

      const formInput = screen.getByLabelText('Voucher Note') as HTMLInputElement;
      await user.click(formInput);
      await user.type(formInput, 'Keep Focus');
      expect(document.activeElement).toBe(formInput);

      // Toggle prefers-reduced-motion ON -> OFF while focused inside StaggerItem
      act(() => controller.setReducedMotion(true));
      expect(document.activeElement).toBe(formInput);
      expect(formInput.value).toBe('Keep Focus');

      act(() => controller.setReducedMotion(false));
      expect(document.activeElement).toBe(formInput);
      expect(formInput.value).toBe('Keep Focus');

      // Now focus input inside Table row and toggle reduced motion ON -> OFF
      const tableInput = screen.getByLabelText('Row row-1') as HTMLInputElement;
      await user.click(tableInput);
      await user.type(tableInput, 'Row Value');
      expect(document.activeElement).toBe(tableInput);

      act(() => controller.setReducedMotion(true));
      expect(document.activeElement).toBe(tableInput);
      expect(tableInput.value).toBe('Row Value');

      act(() => controller.setReducedMotion(false));
      expect(document.activeElement).toBe(tableInput);
      expect(tableInput.value).toBe('Row Value');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
