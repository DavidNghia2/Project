import React, { useState } from 'react';
import { AlertTriangle, Link2 } from 'lucide-react';
import { Modal, Button, Checkbox, Badge } from '../../../design-system';
import type { ProductReferenceSummary } from '../types';
import { useTranslation } from '../../../i18n';

export interface MasterDataDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (forceConfirm: boolean) => void;
  entityLabel: string;
  itemCode?: string;
  itemName?: string;
  references: ProductReferenceSummary[];
}

interface DeleteModalBodyProps {
  entityLabel: string;
  itemCode: string;
  itemName: string;
  references: ProductReferenceSummary[];
  onClose: () => void;
  onConfirm: (forceConfirm: boolean) => void;
}

const DeleteModalBody: React.FC<DeleteModalBodyProps> = ({
  entityLabel,
  itemCode,
  itemName,
  references,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [acknowledgeReferenced, setAcknowledgeReferenced] = useState(false);
  const hasReferences = references.length > 0;
  const canConfirm = !hasReferences || acknowledgeReferenced;
  const capitalizedEntity = entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1);
  const descText = t('masterData.common.refBlockDesc', {
    entity: capitalizedEntity,
    code: itemCode,
    name: itemName,
  });
  const [descBeforeCode, descAfterCode] = descText.split(itemCode);

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {hasReferences ? (
        <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg space-y-2.5">
          <div className="flex items-start gap-2.5 text-[#92400E]">
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-xs sm:text-sm text-[#78350F]">
                {t('masterData.common.refBlockTitle', { count: references.length })}
              </p>
              <p className="text-xs text-[#92400E] leading-relaxed">
                {descBeforeCode}
                <strong className="font-mono">{itemCode}</strong>
                {descAfterCode}
              </p>
            </div>
          </div>

          <div className="pl-7 flex flex-wrap gap-1.5">
            {references.slice(0, 6).map((ref) => (
              <Badge key={ref.id} variant="warning" size="sm">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Link2 className="w-3 h-3" />
                  {ref.sku}
                </span>
              </Badge>
            ))}
            {references.length > 6 && (
              <Badge variant="neutral" size="sm">
                {t('masterData.common.refMoreItems', { count: references.length - 6 })}
              </Badge>
            )}
          </div>

          <div className="pt-2 pl-7 border-t border-[#FDE68A]/70">
            <Checkbox
              id="confirm-force-delete-ref"
              checked={acknowledgeReferenced}
              onChange={(checked) => setAcknowledgeReferenced(checked)}
              label={
                <span className="text-xs font-medium text-[#78350F]">
                  {t('masterData.common.refAckCheckbox')}
                </span>
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
          <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-xs sm:text-sm text-[#7F1D1D]">
              {t('masterData.common.deleteConfirmTitle', { entity: entityLabel })}
            </p>
            <p className="text-xs text-[#991B1B] leading-relaxed">
              {t('masterData.common.deletePromptPrefix', { entity: entityLabel })}{' '}
              <strong className="font-semibold text-[#7F1D1D]">{itemName}</strong> ({t('masterData.common.deletePromptCodeLabel')}{' '}
              <span className="font-mono font-bold">{itemCode}</span>)?
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-[#475569] leading-relaxed">
        {t('masterData.common.deleteImpactNote')}
      </p>

      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
        <Button variant="secondary" size="sm" onClick={onClose}>
          {t('masterData.common.cancelBtn')}
        </Button>
        <Button
          id="btn-confirm-master-delete"
          variant="danger"
          size="sm"
          disabled={!canConfirm}
          onClick={() => onConfirm(hasReferences ? acknowledgeReferenced : true)}
        >
          {hasReferences ? t('masterData.common.forceDeleteBtn') : t('masterData.common.confirmDeleteBtn')}
        </Button>
      </div>
    </div>
  );
};

export const MasterDataDeleteModal: React.FC<MasterDataDeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
  entityLabel,
  itemCode,
  itemName,
  references,
}) => {
  const { t } = useTranslation();

  if (!itemCode || !itemName) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={t('masterData.common.deleteModalTitle', { entity: entityLabel, code: itemCode })}
    >
      {open ? (
        <DeleteModalBody
          key={itemCode}
          entityLabel={entityLabel}
          itemCode={itemCode}
          itemName={itemName}
          references={references}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      ) : null}
    </Modal>
  );
};
