import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { africanCountries, schoolStatusLabels, schoolTypeLabels } from '@evoyamwana/shared';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/auth.service';
import type { RegisterSchoolFormValues } from '../types/forms';
import { routes } from '../utils/routes';
import { useLocale } from '../contexts/LocaleContext';

const initialValues: RegisterSchoolFormValues = {
  schoolName: '',
  legalName: '',
  country: '',
  city: '',
  address: '',
  schoolType: '',
  schoolStatus: '',
  accreditationNumber: '',
  schoolEmail: '',
  schoolPhone: '',
  ownerFullName: '',
  ownerEmail: '',
  password: '',
  documentUrl: ''
};

const schoolTypeOptions = Object.entries(schoolTypeLabels);
const schoolStatusOptions = Object.entries(schoolStatusLabels);

const requiredDocuments = [
  'Autorisation ou agrément officiel de l’école',
  'Pièce d’identité du promoteur ou responsable légal',
  'Preuve d’adresse ou localisation de l’établissement',
  'Document légal de l’organisation si l’école est privée',
  'Contacts administratifs valides pour vérification'
];

interface CountryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

const CountryAutocomplete = ({ value, onChange }: CountryAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = africanCountries.find((country) => country.name === value);
  const filteredCountries = useMemo(() => {
    const query = value.trim().toLocaleLowerCase('fr');
    if (!query || selectedCountry) {
      return africanCountries;
    }

    return africanCountries.filter((country) => country.name.toLocaleLowerCase('fr').includes(query));
  }, [selectedCountry, value]);

  return (
    <label className="relative grid gap-2 text-sm font-semibold text-ink">
      <span className="text-[0.82rem]">Pays</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">{selectedCountry?.flag ?? '🌍'}</span>
        <input
          autoComplete="off"
          className="h-[54px] w-full rounded-lg border border-ink/10 bg-white/88 px-4 pl-12 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] outline-none transition placeholder:text-ink/35 hover:border-ocean/35 focus:border-ocean focus:ring-4 focus:ring-ocean/10"
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un pays africain"
          required
          value={value}
        />
      </div>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-[5rem] z-20 max-h-64 overflow-y-auto rounded-lg border border-ocean/15 bg-white p-2 shadow-[0_18px_50px_rgba(7,27,58,0.18)]">
          {filteredCountries.length ? filteredCountries.map((country) => (
            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-sky focus:bg-sky focus:outline-none"
              key={country.name}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(country.name);
                setIsOpen(false);
              }}
              type="button"
            >
              <span className="text-xl">{country.flag}</span>
              <span>{country.name}</span>
            </button>
          )) : <p className="px-3 py-2 text-sm text-ink/58">Aucun pays africain trouvé</p>}
        </div>
      ) : null}
    </label>
  );
};

export const RegisterSchool = () => {
  const { t } = useLocale();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (key: keyof RegisterSchoolFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const result = await authService.registerSchool(values);
      setSuccess(result.message);
      setValues(initialValues);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to register school');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-ink/10 bg-white/95 p-6 shadow-[0_28px_90px_rgba(16,26,20,0.13)] backdrop-blur sm:p-9">
      <p className="text-sm font-bold uppercase tracking-[0.32em] text-canopy">{t('auth.startWorkspace')}</p>
      <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-[-0.02em] text-ink">{t('auth.registerTitle')}</h1>
      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nom de l’école" value={values.schoolName} onChange={(event) => updateValue('schoolName', event.target.value)} required />
          <Input label="Nom légal complet" value={values.legalName} onChange={(event) => updateValue('legalName', event.target.value)} />
          <CountryAutocomplete value={values.country} onChange={(country) => updateValue('country', country)} />
          <Input label="Ville" value={values.city} onChange={(event) => updateValue('city', event.target.value)} required />
          <Input label="Adresse de l’école" value={values.address} onChange={(event) => updateValue('address', event.target.value)} />
          <label className="grid gap-2 text-sm font-semibold text-ink">
            <span className="text-[0.82rem]">Type d’école</span>
            <select className="h-[54px] rounded-lg border border-ink/10 bg-white/88 px-4 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] outline-none transition hover:border-ocean/35 focus:border-ocean focus:ring-4 focus:ring-ocean/10" value={values.schoolType} onChange={(event) => updateValue('schoolType', event.target.value)}>
              <option value="">Sélectionner</option>
              {schoolTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            <span className="text-[0.82rem]">Statut de l’école</span>
            <select className="h-[54px] rounded-lg border border-ink/10 bg-white/88 px-4 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] outline-none transition hover:border-ocean/35 focus:border-ocean focus:ring-4 focus:ring-ocean/10" value={values.schoolStatus} onChange={(event) => updateValue('schoolStatus', event.target.value)}>
              <option value="">Sélectionner</option>
              {schoolStatusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <Input label="N° agrément / autorisation" value={values.accreditationNumber} onChange={(event) => updateValue('accreditationNumber', event.target.value)} />
          <Input label="Email école" type="email" value={values.schoolEmail} onChange={(event) => updateValue('schoolEmail', event.target.value)} required />
          <Input label="Téléphone école" value={values.schoolPhone} onChange={(event) => updateValue('schoolPhone', event.target.value)} />
          <Input label="Nom complet du responsable" value={values.ownerFullName} onChange={(event) => updateValue('ownerFullName', event.target.value)} required />
          <Input label="Email responsable" type="email" value={values.ownerEmail} onChange={(event) => updateValue('ownerEmail', event.target.value)} required />
          <Input label="Mot de passe" type="password" minLength={8} value={values.password} onChange={(event) => updateValue('password', event.target.value)} required />
        </div>
        <section className="border-t border-ink/10 pt-5">
          <h2 className="text-sm font-bold text-ink">Documents à préparer</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {requiredDocuments.map((document) => (
              <div className="flex items-start gap-2 text-sm font-medium text-ink/70" key={document}>
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-canopy" />
                <span>{document}</span>
              </div>
            ))}
          </div>
        </section>
        {error ? <p className="rounded-md bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p> : null}
        {success ? <p className="rounded-md bg-canopy/10 px-3 py-2 text-sm font-semibold text-canopy">{success}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('auth.creatingWorkspace') : t('auth.createWorkspace')}
        </Button>
      </form>
      <p className="mt-7 border-t border-ink/10 pt-5 text-sm text-ink/58">
        Already registered?{' '}
        <Link className="font-semibold text-canopy hover:text-ink" to={routes.login}>
          Sign in
        </Link>
      </p>
    </div>
  );
};
