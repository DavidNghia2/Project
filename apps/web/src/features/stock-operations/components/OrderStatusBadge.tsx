import React from 'react';
import { m, useReducedMotion } from 'motion/react';
import { Badge, MOTION_SPRING, type BadgeVariant } from '../../../design-system';
import { useTranslation } from '../../../i18n';
import type { OrderStatus } from '../types';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const STATUS_BADGE_MAP: Record<OrderStatus, { variant: BadgeVariant; i18nKey: string }> = {
  DRAFT: { variant: 'neutral', i18nKey: 'status.draft' },
  SUBMITTED: { variant: 'warning', i18nKey: 'status.submitted' },
  APPROVED: { variant: 'info', i18nKey: 'status.approved' },
  COMPLETED: { variant: 'success', i18nKey: 'status.completed' },
  REJECTED: { variant: 'error', i18nKey: 'status.rejected' },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const cfg = STATUS_BADGE_MAP[status];
  return (
    <m.span
      key={status}
      initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.9, opacity: 0.85 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0.01 } : MOTION_SPRING.snappy}
      className="inline-flex"
    >
      <Badge variant={cfg.variant} size={size} dot>
        {t(cfg.i18nKey)}
      </Badge>
    </m.span>
  );
};
