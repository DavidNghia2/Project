import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authenticationUrl, invitationDestination } from './invitationRedirect';
import { Check, Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react';
import { useAuth } from './useAuth';
import { validateRegisterFields, type RegisterFormErrors } from './validators';
import { AuthLayoutShell } from './components/AuthLayoutShell';
import { Alert, Button, Input } from '../../design-system';
import { evaluatePasswordPolicy } from '../../lib/auth';
import { useTranslation } from '../../i18n';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const invitation = invitationDestination(params.get('next'));

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [serverErrorKey, setServerErrorKey] = useState<string | null>(null);
  const [serverErrorFallback, setServerErrorFallback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const policy = evaluatePasswordPolicy(password);

  useEffect(() => {
    document.title = `${t('auth.signUp')} — ${t('layout.brandName')}`;
  }, [t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerErrorKey(null);
    setServerErrorFallback(null);

    const validationErrors = validateRegisterFields({
      fullName,
      email,
      password,
      confirmPassword,
    });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorId = validationErrors.fullName
        ? 'register-input-fullname'
        : validationErrors.email
        ? 'register-input-email'
        : validationErrors.password
        ? 'register-input-password'
        : validationErrors.confirmPassword
        ? 'register-input-confirm-password'
        : null;
      if (firstErrorId) {
        document.getElementById(firstErrorId)?.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      const { user, session, error } = await signUp({
        fullName,
        email,
        password,
        confirmPassword,
      });

      if (error || !user) {
        if (error) {
          setServerErrorKey(error.messageKey);
          setServerErrorFallback(error.message);
        }
        return;
      }

      if (session) {
        navigate(invitation ?? '/onboarding', { replace: true });
        return;
      }
      navigate(invitation ? authenticationUrl('/login', invitation) : '/login', {
        replace: true,
        state: {
          registeredEmail: user.email,
          registrationSuccess: true,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resolvedServerError = serverErrorKey
    ? t(serverErrorKey) !== serverErrorKey
      ? t(serverErrorKey)
      : serverErrorFallback
    : null;

  const passwordRules = [
    { ok: policy.hasMinLength, labelKey: 'auth.passwordRules.minLength' },
    { ok: policy.hasUppercase, labelKey: 'auth.passwordRules.uppercase' },
    { ok: policy.hasNumber, labelKey: 'auth.passwordRules.number' },
  ];

  return (
    <AuthLayoutShell>
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_44px_-16px_rgba(15,23,42,0.1)] p-6 sm:p-7 space-y-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {resolvedServerError && (
          <Alert
            variant="error"
            message={resolvedServerError}
            data-testid="register-server-error"
          />
        )}

        <form id="register-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="register-input-fullname"
            name="fullName"
            type="text"
            label={t('auth.fullName')}
            placeholder={t('auth.fullNamePlaceholder')}
            autoComplete="name"
            autoCapitalize="words"
            spellCheck={false}
            size="lg"
            required
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
              }
            }}
            error={fieldErrors.fullName ? t(fieldErrors.fullName) : undefined}
            prefix={<User className="w-4 h-4" aria-hidden="true" />}
          />

          <Input
            id="register-input-email"
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

          <div className="space-y-2">
            <Input
              id="register-input-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={t('auth.password')}
              placeholder={t('auth.createPasswordPlaceholder')}
              autoComplete="new-password"
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
                  id="btn-toggle-register-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  className="min-h-10 min-w-10 -mr-2 inline-flex items-center justify-center text-[#64748B] hover:text-[#0F172A] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              }
            />

            {/* Password Strength Indicators */}
            <div className="space-y-1.5 pt-0.5" aria-live="polite">
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map((index) => {
                  const active = policy.passedCount > index;
                  const barColor =
                    policy.passedCount === 3
                      ? 'bg-[#16A34A]'
                      : policy.passedCount === 2
                      ? 'bg-[#D97706]'
                      : active
                      ? 'bg-[#2563EB]'
                      : 'bg-[#E2E8F0]';
                  return (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-colors duration-150 ${barColor}`}
                    />
                  );
                })}
              </div>
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.labelKey}
                    className={`inline-flex items-center gap-1 text-xs ${
                      rule.ok ? 'text-[#16A34A] font-medium' : 'text-[#475569]'
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 ${
                        rule.ok ? 'text-[#16A34A]' : 'text-[#94A3B8]'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{t(rule.labelKey)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Input
            id="register-input-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            autoComplete="new-password"
            size="lg"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            error={fieldErrors.confirmPassword ? t(fieldErrors.confirmPassword) : undefined}
            prefix={<Lock className="w-4 h-4" aria-hidden="true" />}
            suffix={
              <button
                type="button"
                id="btn-toggle-register-confirm-password"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')
                }
                className="min-h-10 min-w-10 -mr-2 inline-flex items-center justify-center text-[#64748B] hover:text-[#0F172A] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            }
          />

          <div className="pt-1">
            <Button
              id="btn-register-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              iconLeft={!submitting ? <UserPlus className="w-4 h-4" aria-hidden="true" /> : undefined}
            >
              {submitting ? t('auth.creatingAccount') : t('auth.signUp')}
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] text-center text-sm text-[#475569]">
          <span>{t('auth.hasAccount')} </span>
          <Link
            to={invitation ? authenticationUrl('/login', invitation) : '/login'}
            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1.5 py-2 inline-block"
          >
            {t('auth.signInHere')}
          </Link>
        </div>
      </section>
    </AuthLayoutShell>
  );
};
