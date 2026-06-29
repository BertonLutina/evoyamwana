import type { ParentDto } from '@evoyamwana/shared';
import { HeartHandshake, Phone, Plus, Search, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';
import { ParentFormModal } from '../components/ParentFormModal';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { parentsService, type ParentFormPayload, type ParentListResponse } from '../services/parents.service';

export const ParentsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ParentListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useMemo(() => ({ search, page, pageSize: 10 }), [search, page]);

  const loadParents = async () => {
    setIsLoading(true);
    setError('');
    try {
      setResult(await parentsService.list(params));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load parents');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadParents();
  }, [params]);

  const handleSubmit = async (payload: ParentFormPayload) => {
    setIsSubmitting(true);
    try {
      await parentsService.create(payload);
      setIsCreateOpen(false);
      await loadParents();
    } finally {
      setIsSubmitting(false);
    }
  };

  const parents = result?.parents ?? [];
  const pagination = result?.pagination;
  const linkedChildren = parents.reduce((total, parent) => total + (parent.children?.length ?? 0), 0);
  const primaryContacts = parents.filter((parent) => parent.children?.some((child) => child.isPrimary)).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Family network</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">Parents</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
              Manage parent accounts, phone numbers, household addresses, and the students connected to each family contact.
            </p>
          </div>
          <Button className="gap-2 bg-ocean hover:bg-ink" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} />
            Add parent
          </Button>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <UsersRound className="text-ocean" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Parents in this school</p>
            <p className="mt-1 text-3xl font-bold text-ink">{pagination?.total ?? parents.length}</p>
          </article>
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <HeartHandshake className="text-ember" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Linked children</p>
            <p className="mt-1 text-3xl font-bold text-ink">{linkedChildren}</p>
          </article>
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <Phone className="text-ocean" size={22} />
            <p className="mt-4 text-sm font-semibold text-ink/55">Primary contacts</p>
            <p className="mt-1 text-3xl font-bold text-ink">{primaryContacts}</p>
          </article>
        </section>

        <section className="mt-6 rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
            <Search size={18} className="text-ocean/55" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
              placeholder="Search by parent, phone, email, or child"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </label>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5">
          {isLoading ? (
            <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
              <LoadingRows rows={7} />
            </article>
          ) : parents.length ? (
            <ResponsiveTable<ParentDto>
              data={parents}
              getRowKey={(parent) => parent.id}
              columns={[
                {
                  key: 'parent',
                  header: 'Parent',
                  render: (parent) => (
                    <Link to={`/parents/${parent.id}`} className="flex items-center gap-3 rounded-md transition hover:text-ocean">
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-ocean text-sm font-black text-white">
                        {parent.firstName[0]}{parent.lastName[0]}
                      </span>
                      <div>
                        <p className="font-bold">{parent.firstName} {parent.lastName}</p>
                        <p className="text-xs text-ink/50">{parent.user?.email}</p>
                      </div>
                    </Link>
                  )
                },
                { key: 'phone', header: 'Phone', render: (parent) => parent.phone ?? 'Not set' },
                { key: 'address', header: 'Address', render: (parent) => parent.address ?? 'Not set' },
                {
                  key: 'children',
                  header: 'Students',
                  render: (parent) => parent.children?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {parent.children.map((child) => (
                        <span key={child.student.id} className="rounded-full bg-sky px-2.5 py-1 text-xs font-bold text-ocean">
                          {child.student.firstName} {child.student.lastName} · {child.student.class?.name ?? 'No class'}
                        </span>
                      ))}
                    </div>
                  ) : 'No child linked'
                },
                {
                  key: 'relationship',
                  header: 'Relationship',
                  render: (parent) => parent.children?.map((child) => child.relationship).join(', ') || 'Guardian'
                },
                {
                  key: 'profile',
                  header: 'Profile',
                  render: (parent) => <Link className="font-bold text-ocean hover:text-ember" to={`/parents/${parent.id}`}>Open</Link>
                }
              ]}
            />
          ) : (
            <EmptyState
              icon={UsersRound}
              title="No parents found"
              description="Add parent contacts, or adjust the search to see linked family accounts."
            />
          )}
        </section>

        {pagination ? (
          <div className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-ocean/10 bg-white px-4 py-3 text-sm shadow-panel sm:flex-row sm:items-center">
            <p className="text-ink/60">
              Page <span className="font-bold text-ink">{pagination.page}</span> of <span className="font-bold text-ink">{pagination.totalPages}</span> · {pagination.total} parents
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                Previous
              </Button>
              <Button variant="ghost" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {isCreateOpen ? (
        <ParentFormModal
          isSubmitting={isSubmitting}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
};
