import React, { useMemo, useState } from 'react';
import { Building2, LoaderCircle } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Input, Select } from '../../design-system';
import { LanguageSelect, useTranslation } from '../../i18n';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth';
import { functionErrorMessage } from './functionError';

function makeSlug(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export const OnboardingPage: React.FC = () => {
  const { user, refreshSession, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [industryCode, setIndustryCode] = useState('GENERAL');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const derivedSlug = useMemo(() => slug || makeSlug(companyName), [slug, companyName]);

  if (user?.company) return <Navigate to="/dashboard" replace />;
  if (user?.accessStatus !== 'no-company' && user?.accessStatus !== undefined) return <Navigate to="/account" replace />;

  if (user?.profileStatus !== 'active') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <section className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 space-y-4 shadow-sm">
          <div className="flex justify-end"><LanguageSelect id="onboarding-inactive-language" /></div>
          <h1 className="text-xl font-bold text-slate-900">{t('onboarding.create.inactiveTitle')}</h1>
          <p className="text-sm text-slate-600">{t('onboarding.create.inactiveDesc')}</p>
          <Button fullWidth onClick={() => void signOut().then(() => navigate('/', { replace: true }))}>{t('auth.signOut')}</Button>
        </section>
      </main>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (companyName.trim().length < 2 || derivedSlug.length < 2) {
      setError('onboarding.create.invalidName');
      return;
    }
    setSubmitting(true);
    const { error: invokeError } = await supabase.functions.invoke('onboard-company', {
      body: { companyName: companyName.trim(), companySlug: derivedSlug, industryCode },
    });
    if (invokeError) {
      const message = await functionErrorMessage(invokeError);
      setError(message === 'user already belongs to a company'
        ? 'onboarding.errors.alreadyMember'
        : message.includes('companies_slug_key') ? 'onboarding.errors.slugTaken' : 'onboarding.errors.createFailed');
      setSubmitting(false);
      return;
    }
    try {
      await refreshSession();
      navigate('/dashboard', { replace: true });
    } catch {
      setError('onboarding.create.refreshError');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <section className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-end"><LanguageSelect id="onboarding-language" /></div>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-slate-500">{t('onboarding.create.greeting', { name: user?.fullName || user?.email || '' })}</p>
            <h1 className="text-2xl font-bold text-slate-900">{t('onboarding.create.title')}</h1>
            <p className="text-sm text-slate-600 mt-1">{t('onboarding.create.ownerNotice')}</p>
          </div>
        </div>
        {error && <Alert variant="error" message={t(error)} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('onboarding.create.name')} value={companyName} onChange={(event) => setCompanyName(event.target.value)} required placeholder={t('onboarding.create.namePlaceholder')} />
          <Input label={t('onboarding.create.slug')} value={slug} onChange={(event) => setSlug(makeSlug(event.target.value))} required placeholder={derivedSlug || 'cong-ty-an-phat'} hint={t('onboarding.create.slugHint')} />
          <Select label={t('onboarding.create.industry')} value={industryCode} onChange={(event) => setIndustryCode(event.target.value)} options={[
            { value: 'GENERAL', label: t('onboarding.create.industries.general') },
            { value: 'RETAIL', label: t('onboarding.create.industries.retail') },
            { value: 'MANUFACTURING', label: t('onboarding.create.industries.manufacturing') },
            { value: 'FOOD', label: t('onboarding.create.industries.food') },
          ]} />
          <Button type="submit" fullWidth loading={submitting} iconLeft={submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}>{t('onboarding.create.submit')}</Button>
        </form>
        <p className="text-sm text-slate-600 border-t border-slate-200 pt-4">{t('onboarding.create.inviteNote')}</p>
        <Link to="/account" className="text-sm font-medium text-blue-700">{t('onboarding.create.back')}</Link>
      </section>
    </main>
  );
};
