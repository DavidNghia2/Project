import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Tooltip } from '../../../design-system';
import { useTranslation } from '../../../i18n';

export interface MasterDataRowActionsProps {
  itemCode: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canMutate?: boolean;
}

export const MasterDataRowActions: React.FC<MasterDataRowActionsProps> = ({
  itemCode,
  onView,
  onEdit,
  onDelete,
  canMutate = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center justify-end gap-1">
      <Tooltip content={t('masterData.common.viewTitle')}>
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 p-2 sm:p-1.5 text-[#475569] hover:text-[#2563EB] hover:bg-blue-50 active:scale-95 rounded-md transition-[color,background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-[#2563EB] outline-none cursor-pointer"
          aria-label={t('masterData.common.viewAria', { code: itemCode })}
        >
          <Eye className="w-4 h-4" />
        </button>
      </Tooltip>
      {canMutate && (
        <>
          <Tooltip content={t('masterData.common.editTitle')}>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 p-2 sm:p-1.5 text-[#475569] hover:text-[#D97706] hover:bg-amber-50 active:scale-95 rounded-md transition-[color,background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-[#2563EB] outline-none cursor-pointer"
              aria-label={t('masterData.common.editAria', { code: itemCode })}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content={t('masterData.common.deleteTitle')}>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-8 sm:min-w-8 p-2 sm:p-1.5 text-[#475569] hover:text-[#DC2626] hover:bg-red-50 active:scale-95 rounded-md transition-[color,background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-[#DC2626] outline-none cursor-pointer"
              aria-label={t('masterData.common.deleteAria', { code: itemCode })}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </>
      )}
    </div>
  );
};
