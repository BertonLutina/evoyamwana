import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import type { LoginFormValues } from '../types/forms';
import { routes } from '../utils/routes';
import { useLocale } from '../contexts/LocaleContext';

export const Login = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { t } = useLocale();
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (key: keyof LoginFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = await authService.login(values);
      setSession(session);
      navigate(routes.dashboard);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-ink/10 bg-white/96 p-6 shadow-[0_24px_70px_rgba(7,27,58,0.12)] backdrop-blur sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-ocean">{t('auth.welcome')}</p>
          <h1 className="mt-4 max-w-md font-display text-[2.85rem] font-bold leading-[0.98] tracking-[-0.02em] text-ink">
            {t('auth.loginTitle')}
          </h1>
        </div>
        <span className="hidden h-14 w-1 rounded-full bg-ember sm:block" />
      </div>

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
        <Input label={t('auth.email')} type="email" value={values.email} onChange={(event) => updateValue('email', event.target.value)} required />
        <Input label={t('auth.password')} type="password" value={values.password} onChange={(event) => updateValue('password', event.target.value)} required />
        {error ? <p className="rounded-md bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p> : null}
        <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
          {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>
      <p className="mt-6 border-t border-ink/10 pt-5 text-sm text-ink/58">
        {t('auth.newSchool')}{' '}
        <Link className="font-semibold text-canopy hover:text-ink" to={routes.registerSchool}>
          {t('auth.registerSchool')}
        </Link>
      </p>
    </div>
  );
};
