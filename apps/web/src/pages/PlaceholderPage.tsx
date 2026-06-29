import { Inbox, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { LoadingRows } from '../components/LoadingRows';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  const [isActionOpen, setIsActionOpen] = useState(false);
  const singularTitle = title.endsWith('s') ? title.slice(0, -1) : title;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Workspace</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">{description}</p>
          </div>
          <Button type="button" className="gap-2 bg-ocean hover:bg-ink" onClick={() => setIsActionOpen((current) => !current)}>
            <Plus size={18} />
            Add {singularTitle}
          </Button>
        </div>

        {isActionOpen ? (
          <section className="mt-5 rounded-lg border border-ocean/15 bg-white p-5 shadow-panel">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-ocean">Action ready</p>
                <h3 className="mt-1 text-xl font-bold text-ink">Create {singularTitle}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
                  This module is connected to navigation. The creation workflow will use this area once the {title.toLowerCase()} API is implemented.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setIsActionOpen(false)}>
                Close
              </Button>
            </div>
          </section>
        ) : null}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Loading preview</h3>
              <span className="rounded-full bg-sky px-3 py-1 text-xs font-bold text-ocean">Ready for data</span>
            </div>
            <LoadingRows />
          </article>
          <EmptyState
            icon={Inbox}
            title={`No ${title.toLowerCase()} records yet`}
            description="Connect this view to API data when the module is ready. The layout already includes empty and loading states."
          />
        </section>
      </div>
    </div>
  );
};
