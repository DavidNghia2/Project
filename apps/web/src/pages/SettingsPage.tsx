import React from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Input, Checkbox } from '../design-system';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const SettingsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const canManageSettings = capabilities.canManageSettings;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.settingsTitle')}
        description={t('pages.settingsDesc')}
        actions={
          canManageSettings ? (
            <Button variant="primary" size="sm" iconLeft={<Save className="w-4 h-4" />}>
              {t('common.save')}
            </Button>
          ) : undefined
        }
      />

      {!canManageSettings ? (
        <RoleScopeNotice role={activeRole} context="restricted" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title={language === 'vi' ? 'Quy tắc phê duyệt Maker-Checker' : 'Maker-Checker Approval Rules'}
          description={
            language === 'vi'
              ? 'Ràng buộc người tạo phiếu không được tự phê duyệt giao dịch của chính mình.'
              : 'Enforce strict maker-checker segregation of duties for inventory transactions.'
          }
          padding="md"
          className="space-y-4"
        >
          <Checkbox
            label={language === 'vi' ? 'Bắt buộc Manager khác duyệt phiếu do Manager tạo' : 'Disallow managers approving their own stock orders'}
            checked={true}
            onChange={() => {}}
            disabled
            hint="Theo baseline an toàn dữ liệu của tài liệu đặc tả đồ án tốt nghiệp."
          />
          <Checkbox
            label={language === 'vi' ? 'Chặn hoàn tất giao dịch nếu phát hiện tồn kho âm' : 'Enforce zero-negative stock threshold on dispatch'}
            checked={true}
            onChange={() => {}}
            disabled
            hint="Database transaction rollback tự động khi on-hand không đủ."
          />
        </Card>

        <Card
          title={language === 'vi' ? 'Quy ước tiền tố mã chứng từ' : 'Sequence & Numbering Prefixes'}
          description={language === 'vi' ? 'Cấu hình tiền tố tự động sinh cho các loại phiếu.' : 'Document number prefixes for inventory tracking.'}
          padding="md"
          className="space-y-3"
        >
          <Input label="Tiền tố phiếu nhập (Stock-In)" value="IN-" onChange={() => {}} disabled size="sm" />
          <Input label="Tiền tố phiếu xuất (Stock-Out)" value="OUT-" onChange={() => {}} disabled size="sm" />
          <Input label="Tiền tố phiên kiểm kê (Stocktaking)" value="STK-" onChange={() => {}} disabled size="sm" />
        </Card>
        </div>
      )}
    </div>
  );
};
