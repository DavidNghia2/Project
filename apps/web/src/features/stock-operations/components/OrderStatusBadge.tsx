import React from 'react';
import { Badge, type BadgeVariant } from '../../../design-system';
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
  const cfg = STATUS_BADGE_MAP[status];
  return (
    <Badge variant={cfg.variant} size={size} dot>
      {t(cfg.i18nKey)}
    </Badge>
  );
};
