import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button } from '../../design-system';
import { LanguageSelect, useTranslation } from '../../i18n';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth';

export const AcceptInvitationPage: React.FC = () => {
  const { refreshSession, user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = params.get('token') ?? '';

  const displayedError = error ? t(error) : !token ? t('onboarding.invitation.invalidLink') : null;

  const accept = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const { error: acceptError } = await supabase.rpc('accept_invitation', { invitation_token: token });
    if (acceptError) {
      const invitationErrors: Record<string, string> = {
        'invitation is invalid or expired': 'onboarding.invitation.invalidLink',
        'invitation email does not match the signed-in account': 'onboarding.errors.invitationEmail',
        'user already belongs to a company': 'onboarding.errors.alreadyMember',
      };
      setError(invitationErrors[acceptError.message] ?? 'onboarding.errors.acceptFailed');
      setLoading(false);
      return;
    }
    try {
      await refreshSession();
      navigate('/dashboard', { replace: true });
    } catch {
      setError('onboarding.invitation.refreshError');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 space-y-5 shadow-sm text-center">
        <div className="flex justify-end"><LanguageSelect id="invitation-language" /></div>
        <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
        <div><h1 className="text-xl font-bold text-slate-900">{t('onboarding.invitation.title')}</h1><p className="text-sm text-slate-600 mt-2">{t('onboarding.invitation.description')}</p></div>
        {displayedError && <Alert variant="error" message={displayedError} />}
        <Button fullWidth onClick={() => void accept()} loading={loading} disabled={!token}>{t('onboarding.invitation.accept')}</Button>
        <p className="text-sm text-slate-600">{t('onboarding.invitation.signedInAs', { email: user?.email || '' })}</p>
        <Button variant="secondary" fullWidth onClick={() => void signOut().then(() => navigate(`/login?next=${encodeURIComponent(`/accept-invitation?token=${token}`)}`, { replace: true }))}>{t('onboarding.invitation.switchAccount')}</Button>
      </section>
    </main>
  );
};
