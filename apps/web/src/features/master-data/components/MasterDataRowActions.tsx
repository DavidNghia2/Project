import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

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
}) => (
  <div className="inline-flex items-center justify-end gap-1">
    <button
      type="button"
      onClick={onView}
      className="p-1.5 text-[#475569] hover:text-[#2563EB] hover:bg-blue-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] outline-none cursor-pointer"
      title="Xem chi tiết"
      aria-label={`Xem chi tiết ${itemCode}`}
    >
      <Eye className="w-4 h-4" />
    </button>
    {canMutate && (
      <>
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 text-[#475569] hover:text-[#D97706] hover:bg-amber-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] outline-none cursor-pointer"
          title="Chỉnh sửa"
          aria-label={`Sửa ${itemCode}`}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-[#475569] hover:text-[#DC2626] hover:bg-red-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#DC2626] outline-none cursor-pointer"
          title="Xóa bản ghi"
          aria-label={`Xóa ${itemCode}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </>
    )}
  </div>
);
