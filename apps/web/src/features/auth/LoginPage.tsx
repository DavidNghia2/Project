import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerErrorKey(null);
    setServerErrorFallback(null);

    const validationErrors = validateLoginFields(email, password);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
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
      navigate('/dashboard', { replace: true });
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
      <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-md p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
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
            type="email"
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
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
            prefix={<Mail className="w-4 h-4" />}
          />

          <Input
            id="login-input-password"
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
            prefix={<Lock className="w-4 h-4" />}
            suffix={
              <button
                type="button"
                id="btn-toggle-login-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                className="p-1.5 -mr-1 text-[#64748B] hover:text-[#0F172A] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              iconLeft={!submitting ? <LogIn className="w-4 h-4" /> : undefined}
            >
              {submitting ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] text-center text-sm text-[#475569]">
          <span>{t('auth.noAccount')} </span>
          <Link
            to="/register"
            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1 py-1 inline-block"
          >
            {t('auth.createOne')}
          </Link>
        </div>
      </section>

      {isMockMode && <DemoAccountsPanel onSelectDemoAccount={handleSelectDemoAccount} />}
    </AuthLayoutShell>
  );
};
