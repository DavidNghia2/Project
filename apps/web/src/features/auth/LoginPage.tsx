import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authenticationUrl, invitationDestination } from './invitationRedirect';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from './useAuth';
import { validateLoginFields, type LoginFormErrors } from './validators';
import { AuthLayoutShell } from './components/AuthLayoutShell';
import { DemoAccountsPanel } from './components/DemoAccountsPanel';
import { Alert, Button, Input } from '../../design-system';
import { useTranslation } from '../../i18n';

interface LoginLocationState {
  registeredEmail?: string;
  registrationSuccess?: boolean;
}

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { signIn, isMockMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const invitation = invitationDestination(params.get('next'));
  const state = (location.state as LoginLocationState | null) ?? null;

  const [email, setEmail] = useState(state?.registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [serverErrorKey, setServerErrorKey] = useState<string | null>(null);
  const [serverErrorFallback, setServerErrorFallback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRegisteredBanner, setShowRegisteredBanner] = useState(
    Boolean(state?.registrationSuccess)
  );

  useEffect(() => {
    document.title = `${t('auth.signIn')} — ${t('layout.brandName')}`;
  }, [t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerErrorKey(null);
    setServerErrorFallback(null);

    const validationErrors = validateLoginFields(email, password);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorId = validationErrors.email
        ? 'login-input-email'
        : validationErrors.password
        ? 'login-input-password'
        : null;
      if (firstErrorId) {
        document.getElementById(firstErrorId)?.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      const error = await signIn({ email, password });
      if (error) {
        setServerErrorKey(error.messageKey);
        setServerErrorFallback(error.message);
        return;
      }
      navigate(invitation ?? (isMockMode ? '/dashboard' : '/account'), { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFieldErrors({});
    setServerErrorKey(null);
    setServerErrorFallback(null);
  };

  const resolvedServerError = serverErrorKey
    ? t(serverErrorKey) !== serverErrorKey
      ? t(serverErrorKey)
      : serverErrorFallback
    : null;

  return (
    <AuthLayoutShell>
      {/* Main Auth Card */}
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_44px_-16px_rgba(15,23,42,0.1)] p-6 sm:p-7 space-y-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">{t('auth.loginSubtitle')}</p>
        </div>

        {showRegisteredBanner && (
          <Alert
            variant="success"
            dismissible
            onDismiss={() => setShowRegisteredBanner(false)}
            message={t('auth.registrationSuccessBanner')}
          />
        )}

        {resolvedServerError && (
          <Alert
            variant="error"
            message={resolvedServerError}
            data-testid="login-server-error"
          />
        )}

        <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="login-input-email"
            name="email"
            type="email"
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
            spellCheck={false}
            size="lg"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            error={fieldErrors.email ? t(fieldErrors.email) : undefined}
            prefix={<Mail className="w-4 h-4" aria-hidden="true" />}
          />

          <Input
            id="login-input-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            autoComplete="current-password"
            size="lg"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            error={fieldErrors.password ? t(fieldErrors.password) : undefined}
            prefix={<Lock className="w-4 h-4" aria-hidden="true" />}
            suffix={
              <button
                type="button"
                id="btn-toggle-login-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                className="min-h-10 min-w-10 -mr-2 inline-flex items-center justify-center text-[#64748B] hover:text-[#0F172A] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            }
          />

          <div className="pt-1">
            <Button
              id="btn-login-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              iconLeft={!submitting ? <LogIn className="w-4 h-4" aria-hidden="true" /> : undefined}
            >
              {submitting ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] text-center text-sm text-[#475569]">
          <span>{t('auth.noAccount')} </span>
          <Link
            to={invitation ? authenticationUrl('/register', invitation) : '/register'}
            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1.5 py-2 inline-block"
          >
            {t('auth.createOne')}
          </Link>
        </div>
      </section>

      {isMockMode && <DemoAccountsPanel onSelectDemoAccount={handleSelectDemoAccount} />}
    </AuthLayoutShell>
  );
};
