import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Alert, Button, Card } from '../design-system';
import { useTranslation } from '../i18n';
import {
  REPORT_DEFAULT_END_DATE,
  REPORT_DEFAULT_START_DATE,
  ReportChartsPanel,
  ReportDataTable,
  ReportFiltersBar,
  ReportSummaryStrip,
  computeReport,
  triggerCsvDownload,
  validateDateRange,
  type ReportFilterState,
  type ReportType,
} from '../features/reports';
import { RoleScopeNotice, useRolePreview } from '../features/users-rbac';

const INITIAL_FILTERS: ReportFilterState = {
  reportType: 'current_stock',
  startDate: REPORT_DEFAULT_START_DATE,
  endDate: REPORT_DEFAULT_END_DATE,
  warehouseCode: 'ALL',
  category: 'ALL',
};

export const ReportsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { activeRole, capabilities } = useRolePreview();
  const [filters, setFilters] = useState<ReportFilterState>(INITIAL_FILTERS);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const dateValidation = useMemo(
    () => validateDateRange(filters.startDate, filters.endDate, language),
    [filters.startDate, filters.endDate, language]
  );

  const report = useMemo(() => computeReport(filters, language), [filters, language]);

  const handleReportTypeChange = (reportType: ReportType) => {
    setExportNotice(null);
    setFilters((prev) => ({ ...prev, reportType }));
  };

  const handleResetFilters = () => {
    setExportNotice(null);
    setFilters((prev) => ({
      ...INITIAL_FILTERS,
      reportType: prev.reportType,
    }));
  };

  const handleExportCsv = () => {
    if (!dateValidation.valid || report.rows.length === 0) return;
    const result = triggerCsvDownload(report, filters, language);
    setExportNotice(
      language === 'vi'
        ? `Đã xuất file ${result.filename} (${result.rowCount} dòng dữ liệu + dòng tổng hợp).`
        : `Exported ${result.filename} (${result.rowCount} rows + summary row).`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pages.reportsTitle')}
        description={t('pages.reportsDesc')}
        actions={
          capabilities.canExportReports ? (
            <Button
              id="btn-export-csv"
              variant="primary"
              size="sm"
              disabled={!dateValidation.valid || report.rows.length === 0}
              onClick={handleExportCsv}
              iconLeft={<Download className="w-4 h-4" />}
            >
              {language === 'vi' ? 'Xuất báo cáo CSV' : 'Export Report CSV'}
            </Button>
          ) : undefined
        }
      />

      {capabilities.isReadOnly && <RoleScopeNotice role={activeRole} context="catalog" />}

      {exportNotice && (
        <Alert
          variant="success"
          message={exportNotice}
          dismissible
          onDismiss={() => setExportNotice(null)}
        />
      )}

      <Card padding="md">
        <ReportFiltersBar
          filters={filters}
          dateValidation={dateValidation}
          onReportTypeChange={handleReportTypeChange}
          onStartDateChange={(startDate) => setFilters((prev) => ({ ...prev, startDate }))}
          onEndDateChange={(endDate) => setFilters((prev) => ({ ...prev, endDate }))}
          onWarehouseChange={(warehouseCode) =>
            setFilters((prev) => ({ ...prev, warehouseCode }))
          }
          onCategoryChange={(category) => setFilters((prev) => ({ ...prev, category }))}
          onApplyPreset={(startDate, endDate) =>
            setFilters((prev) => ({ ...prev, startDate, endDate }))
          }
          onReset={handleResetFilters}
        />
      </Card>

      <ReportSummaryStrip report={report} validDateRange={dateValidation.valid} />

      <ReportChartsPanel report={report} validDateRange={dateValidation.valid} />

      <ReportDataTable
        report={report}
        validDateRange={dateValidation.valid}
        onResetFilters={handleResetFilters}
        onExportCsv={handleExportCsv}
      />
    </div>
  );
};
