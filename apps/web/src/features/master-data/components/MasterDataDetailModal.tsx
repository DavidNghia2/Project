import React from 'react';
import { useTranslation } from '../../../i18n';
import { Calendar, Link2, Pencil } from 'lucide-react';
import { Modal, Button, Badge } from '../../../design-system';
import type { MasterStatus, ProductReferenceSummary } from '../types';

export interface DetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

export interface MasterDataDetailModalProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  titlePrefix: string;
  code?: string;
  name?: string;
  status?: MasterStatus;
  description?: string;
  fields: DetailField[];
  references: ProductReferenceSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export const MasterDataDetailModal: React.FC<MasterDataDetailModalProps> = ({
  open,
  onClose,
  onEdit,
  titlePrefix,
  code,
  name,
  status,
  description,
  fields,
  references,
  createdAt,
  updatedAt,
}) => {
  const { t, language } = useTranslation();
  if (!code || !name) return null;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <span>{titlePrefix}:</span>
          <span className="font-mono text-[#2563EB]">{code}</span>
        </div>
      }
      description={t('masterData.common.detailDesc')}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('masterData.common.closeBtn')}
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onEdit();
              }}
            >
              {t('masterData.common.editBtn')}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5 text-xs sm:text-sm">
        {/* Header Summary */}
        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="font-mono text-xs font-semibold text-[#2563EB] block">{code}</span>
            <h4 className="text-base font-bold text-[#0F172A] leading-snug">{name}</h4>
          </div>
          {status && (
            <Badge variant={status === 'active' ? 'success' : 'neutral'} size="sm" dot>
              {status === 'active' ? t('masterData.common.statusActive') : t('masterData.common.statusInactive')}
            </Badge>
          )}
        </div>

        {/* Attribute Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map((field, idx) => (
            <div
              key={`${field.label}-${idx}`}
              className={`p-3 bg-white border border-[#E2E8F0] rounded-lg ${
                field.fullWidth ? 'sm:col-span-2' : ''
              }`}
            >
              <span className="text-[11px] font-medium text-[#64748B] block mb-1">
                {field.label}
              </span>
              <div className="text-xs sm:text-sm font-medium text-[#0F172A] break-words">
                {field.value || '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Description / Notes */}
        {description && (
          <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-lg space-y-1">
            <span className="text-[11px] font-medium text-[#64748B] block">
              {t('masterData.common.descNotes')}
            </span>
            <p className="text-xs text-[#334155] leading-relaxed">{description}</p>
          </div>
        )}

        {/* Linked Products Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#2563EB]" />
              <span>{t('masterData.common.refProductsHeading', { count: references.length })}</span>
            </h5>
          </div>

          {references.length === 0 ? (
            <div className="p-3 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-lg text-xs text-[#475569]">
              {t('masterData.common.refEmpty')}
            </div>
          ) : (
            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#475569]">
                  <tr>
                    <th className="py-2 px-3">{t('masterData.common.refSkuCol')}</th>
                    <th className="py-2 px-3">{t('masterData.common.refNameCol')}</th>
                    <th className="py-2 px-3 text-right">{t('masterData.common.refDetailCol')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {references.map((ref) => (
                    <tr key={ref.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2 px-3 font-mono font-semibold text-[#2563EB] whitespace-nowrap">
                        {ref.sku}
                      </td>
                      <td className="py-2 px-3 text-[#0F172A] font-medium">{ref.name}</td>
                      <td className="py-2 px-3 text-right text-[#475569] tabular-nums whitespace-nowrap">
                        {ref.detailText}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Timestamps */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {t('masterData.common.createdAtLabel')} {formatDate(createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {t('masterData.common.updatedAtLabel')} {formatDate(updatedAt)}
          </span>
        </div>
      </div>
    </Modal>
  );
};
