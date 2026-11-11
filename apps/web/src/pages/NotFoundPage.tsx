import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { useTranslation } from '../i18n';
import { Button } from '../design-system';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="font-mono text-sm font-bold text-blue-600 tracking-wider">
          ERROR 404
        </span>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          {t('notFound.title')}
        </h2>
        <p className="text-sm text-[#64748B] leading-relaxed">
          {t('notFound.desc')}
        </p>
      </div>

      <div className="pt-2 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" iconLeft={<Home className="w-4 h-4" />}>
            {t('notFound.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
