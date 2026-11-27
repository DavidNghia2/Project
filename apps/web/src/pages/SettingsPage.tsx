import React from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { Card, Button, Input, Checkbox, StaggerGroup, StaggerItem } from '../design-system';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const canManageSettings = capabilities.canManageSettings;

  return (
    <StaggerGroup preset="sections" className="space-y-6">
      <StaggerItem>
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
      </StaggerItem>

      {!canManageSettings ? (
        <RoleScopeNotice role={activeRole} context="restricted" />
      ) : (
        <StaggerItem>
          <StaggerGroup preset="cards" isolate className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StaggerItem index={0}>
              <Card
                title={t('settings.makerCheckerTitle')}
                description={t('settings.makerCheckerDesc')}
                padding="md"
                className="space-y-4 h-full"
              >
                <Checkbox
                  label={t('settings.ruleOwnOrderLabel')}
                  checked={true}
                  onChange={() => {}}
                  disabled
                  hint={t('settings.ruleOwnOrderHint')}
                />
                <Checkbox
                  label={t('settings.ruleNegativeStockLabel')}
                  checked={true}
                  onChange={() => {}}
                  disabled
                  hint={t('settings.ruleNegativeStockHint')}
                />
              </Card>
            </StaggerItem>

            <StaggerItem index={1}>
              <Card
                title={t('settings.prefixesTitle')}
                description={t('settings.prefixesDesc')}
                padding="md"
                className="space-y-3 h-full"
              >
                <Input id="settings-prefix-in" label={t('settings.prefixIn')} value="IN-" onChange={() => {}} disabled size="sm" />
                <Input id="settings-prefix-out" label={t('settings.prefixOut')} value="OUT-" onChange={() => {}} disabled size="sm" />
                <Input id="settings-prefix-stk" label={t('settings.prefixStk')} value="STK-" onChange={() => {}} disabled size="sm" />
              </Card>
            </StaggerItem>
          </StaggerGroup>
        </StaggerItem>
      )}
    </StaggerGroup>
  );
};
