import { Baby, BookOpen, BriefcaseBusiness, GraduationCap, School } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { StudentCategory, StudentRegistrationFormData } from '../../services/studentRegistrationApi';
import type { StudentValidationErrors } from '../../services/studentValidation';

interface Props {
  form: StudentRegistrationFormData;
  setForm: Dispatch<SetStateAction<StudentRegistrationFormData>>;
  errors: StudentValidationErrors;
}

const categories: Array<{ value: StudentCategory; label: string; detail: string; icon: typeof Baby }> = [
  { value: 'creche', label: 'Crèche / garderie', detail: 'Accueil petite enfance et suivi familial.', icon: Baby },
  { value: 'maternelle', label: 'Maternelle', detail: 'Petite enfance, santé et récupération.', icon: Baby },
  { value: 'primaire', label: 'Primaire', detail: 'Bases scolaires, responsables et suivi.', icon: BookOpen },
  { value: 'secondaire', label: 'Secondaire', detail: 'Section, option et orientation.', icon: School },
  { value: 'secondaire_general', label: 'Secondaire général', detail: 'Humanités générales et orientation.', icon: School },
  { value: 'secondaire_technique', label: 'Secondaire technique', detail: 'Technique, professionnel et options.', icon: BriefcaseBusiness },
  { value: 'formation', label: 'Centre de formation', detail: 'Programme court, métier ou certification.', icon: BriefcaseBusiness },
  { value: 'haute_ecole', label: 'Haute école', detail: 'Institut supérieur et formation graduée.', icon: GraduationCap },
  { value: 'universite', label: 'Université', detail: 'Faculté, programme et inscription.', icon: GraduationCap },
  { value: 'mixte', label: 'École mixte', detail: 'Complexe scolaire multi-cycles.', icon: School }
];

export const StudentCategoryStep = ({ form, setForm, errors }: Props) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {categories.map((category) => {
      const Icon = category.icon;
      const isSelected = form.category === category.value;
      return (
        <button
          key={category.value}
          type="button"
          onClick={() => setForm((current) => ({ ...current, category: category.value }))}
          className={`min-h-32 rounded-lg border p-4 text-left transition ${
            isSelected ? 'border-ocean bg-sky shadow-panel' : 'border-ocean/10 bg-white hover:border-ocean/35'
          }`}
        >
          <span className={`grid h-10 w-10 place-items-center rounded-lg ${isSelected ? 'bg-ocean text-white' : 'bg-ocean/10 text-ocean'}`}>
            <Icon size={20} />
          </span>
          <span className="mt-4 block text-lg font-black text-ink">{category.label}</span>
          <span className="mt-1 block text-sm leading-5 text-ink/55">{category.detail}</span>
        </button>
      );
    })}
    {errors.category ? <p className="text-sm font-semibold text-clay sm:col-span-2">{errors.category}</p> : null}
  </div>
);
