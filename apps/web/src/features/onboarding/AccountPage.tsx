import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../design-system';
import { LanguageSelect, useTranslation } from '../../i18n';
import { useAuth } from '../auth';

export function AccountPage({ firstVisit = false }: { firstVisit?: boolean }) {
  const { user, signOut, refreshSession } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (user?.company) return <Navigate to="/dashboard" replace />;
  const blocked = user?.accessStatus === 'inactive' || user?.accessStatus === 'suspended';
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <section className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-7 space-y-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {blocked ? t('onboarding.account.unavailable') : firstVisit ? t('onboarding.account.nextStep') : t('onboarding.account.title')}
          </h1>
          <LanguageSelect id="account-language" />
        </div>
        <p className="text-sm text-slate-600">{user?.email}</p>
        {blocked ? (
          <p className="text-slate-600">
            {user?.accessStatus === 'suspended' ? t('onboarding.account.suspended') : t('onboarding.account.inactive')}{' '}
            {t('onboarding.account.contactAdmin')}
          </p>
        ) : (
          <>
            <p className="text-slate-600">{t('onboarding.account.noCompany')}</p>
            <Link to="/onboarding/create-company" className="block rounded-xl border border-blue-200 bg-blue-50 p-4 font-semibold text-blue-800 hover:bg-blue-100">{t('onboarding.account.createCompany')}</Link>
            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold text-slate-900">{t('onboarding.account.joinTitle')}</h2>
              <p className="text-sm text-slate-600 mt-1">{t('onboarding.account.joinDesc')}</p>
            </div>
            {firstVisit && <Link to="/account" className="block text-center text-blue-700 font-medium">{t('onboarding.account.decideLater')}</Link>}
          </>
        )}
        <div className="flex gap-3">
          <Button onClick={() => void refreshSession()}>{t('onboarding.account.refresh')}</Button>
          <Button variant="secondary" onClick={() => void signOut().then(() => navigate('/', { replace: true }))}>{t('auth.signOut')}</Button>
        </div>
      </section>
    </main>
  );
}
