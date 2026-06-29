import { ArrowLeft, HeartHandshake, Home, Mail, Phone, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ParentDto } from '@evoyamwana/shared';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import { ProfileChat } from '../components/ProfileChat';
import { parentsService } from '../services/parents.service';

export const ParentProfilePage = () => {
  const { id } = useParams();
  const [parent, setParent] = useState<ParentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    parentsService
      .get(id)
      .then(setParent)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load parent'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="px-4 py-6 sm:px-6 lg:px-8"><LoadingRows rows={8} /></div>;
  }

  if (!parent) {
    return <div className="px-4 py-6 sm:px-6 lg:px-8"><EmptyState icon={UsersRound} title="Parent not found" description={error || 'This parent profile is unavailable.'} /></div>;
  }

  const fullName = `${parent.firstName} ${parent.lastName}`;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/parents" className="inline-flex items-center gap-2 text-sm font-bold text-ocean">
          <ArrowLeft size={16} />
          Back to parents
        </Link>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-5">
            <article className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel">
              <div className="flex items-start gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-lg bg-ocean text-xl font-black text-white">
                  {parent.firstName[0]}{parent.lastName[0]}
                </span>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-ember">Parent profile</p>
                  <h2 className="mt-1 font-display text-4xl font-bold text-ink">{fullName}</h2>
                  <p className="mt-2 text-sm font-semibold text-ink/55">Family contact</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm">
                <p className="flex items-center gap-2"><Mail size={17} className="text-ocean" /> {parent.user?.email}</p>
                <p className="flex items-center gap-2"><Phone size={17} className="text-ember" /> {parent.phone ?? 'No phone recorded'}</p>
                <p className="flex items-center gap-2"><Home size={17} className="text-ocean" /> {parent.address ?? 'No address recorded'}</p>
              </div>
            </article>

            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <div className="flex items-center gap-2">
                <HeartHandshake size={20} className="text-ember" />
                <h3 className="font-bold">Linked students</h3>
              </div>
              <div className="mt-4 grid gap-3">
                {parent.children?.length ? parent.children.map((child) => (
                  <Link key={child.student.id} to={`/students/${child.student.id}`} className="rounded-lg border border-ocean/10 bg-sky p-4 transition hover:border-ocean/30 hover:bg-white">
                    <p className="font-bold text-ink">{child.student.firstName} {child.student.lastName}</p>
                    <p className="mt-1 text-sm text-ink/55">{child.student.studentCode} · {child.student.class?.name ?? 'No class'}</p>
                    <span className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-bold text-ocean">{child.relationship}</span>
                  </Link>
                )) : <p className="text-sm text-ink/55">No child linked</p>}
              </div>
            </article>
          </div>

          <ProfileChat recipientId={parent.userId} recipientName={fullName} />
        </section>
      </div>
    </div>
  );
};
