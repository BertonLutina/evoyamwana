import type { ClassDto, ParentDto } from '@evoyamwana/shared';
import type { StudentCategory, StudentRegistrationFormData } from '../../services/studentRegistrationApi';

interface Props {
  form: StudentRegistrationFormData;
  classes: ClassDto[];
  parents: ParentDto[];
}

const categoryLabels = {
  creche: 'Crèche / garderie',
  maternelle: 'Maternelle',
  primaire: 'Primaire',
  secondaire: 'Secondaire',
  secondaire_general: 'Secondaire général',
  secondaire_technique: 'Secondaire technique / professionnel',
  formation: 'Centre de formation',
  haute_ecole: 'Haute école / institut supérieur',
  universite: 'Université',
  mixte: 'École mixte / complexe scolaire'
};

const relationshipLabels = {
  father: 'Père',
  mother: 'Mère',
  tutor: 'Tuteur',
  guardian: 'Responsable',
  other: 'Autre'
};

const specificKeyForCategory = (category: StudentCategory): keyof StudentRegistrationFormData['specific'] => {
  if (category === 'creche' || category === 'maternelle') return 'maternelle';
  if (category === 'primaire' || category === 'mixte') return 'primaire';
  if (category === 'secondaire' || category === 'secondaire_general' || category === 'secondaire_technique' || category === 'formation') return 'secondaire';
  return 'universite';
};

const SummaryBlock = ({ title, rows }: { title: string; rows: Array<[string, unknown]> }) => (
  <section className="rounded-lg border border-ocean/10 bg-white p-4">
    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-ocean">{title}</h3>
    <dl className="mt-3 grid gap-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 sm:grid-cols-[180px_1fr]">
          <dt className="font-bold text-ink/55">{label}</dt>
          <dd className="font-semibold text-ink">{String(value || 'Non renseigné')}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export const StudentSummaryStep = ({ form, classes, parents }: Props) => {
  const className = classes.find((item) => item.id === form.general.classId)?.name;
  const guardianRows = form.guardians.map((guardian, index) => {
    const parent = parents.find((item) => item.id === guardian.guardianId);
    const parentName = parent ? `${parent.firstName} ${parent.lastName}` : `${guardian.parent.firstName} ${guardian.parent.lastName}`.trim();
    const contact = parent ? (parent.phone || parent.user?.email || '') : (guardian.parent.phone || guardian.parent.email || '');
    return [
      `Responsable ${index + 1}`,
      `${parentName || 'Nouveau parent'}${contact ? ` · ${contact}` : ''} · ${relationshipLabels[guardian.relationshipType]}${parent ? ' · existant sélectionné' : ' · à créer'}${guardian.isPrimaryContact ? ' · principal' : ''}${guardian.emergencyContact ? ' · urgence' : ''}${guardian.canPickUpChild ? ' · récupération' : ''}`
    ] as [string, string];
  });

  const specific = form.specific[specificKeyForCategory(form.category)];
  const specificRows = Object.entries(specific).map(([key, value]) => [key, typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value] as [string, unknown]);

  return (
    <div className="grid gap-4">
      <SummaryBlock
        title="Inscription"
        rows={[
          ['Catégorie', categoryLabels[form.category]],
          ['Statut', form.general.status],
          ['Classe', className || 'Sans classe'],
          ['Année scolaire', form.general.academicYear]
        ]}
      />
      <SummaryBlock
        title="Informations générales"
        rows={[
          ['Prénom', form.general.firstName],
          ['Nom', form.general.lastName],
          ['Genre', form.general.gender],
          ['Date de naissance', form.general.birthDate],
          ['Lieu de naissance', form.general.birthPlace],
          ['Nationalité', form.general.nationality],
          ['Matricule', form.general.studentCode || 'Auto']
        ]}
      />
      <SummaryBlock title="Responsables" rows={guardianRows.length ? guardianRows : [['Responsables', 'Aucun']]} />
      <SummaryBlock
        title="Informations médicales"
        rows={[
          ['Groupe sanguin', form.medical.bloodType],
          ['Allergies', form.medical.allergies],
          ['Maladies chroniques', form.medical.chronicDiseases],
          ['Médicaments', form.medical.medication],
          ['Médecin', form.medical.doctorName],
          ['Téléphone médecin', form.medical.doctorPhone],
          ['Notes d’urgence', form.medical.emergencyNotes]
        ]}
      />
      <SummaryBlock title={`Détails ${categoryLabels[form.category]}`} rows={specificRows} />
    </div>
  );
};
