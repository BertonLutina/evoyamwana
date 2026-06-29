import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  emptyState?: ReactNode;
}

export const ResponsiveTable = <T,>({ columns, data, getRowKey, emptyState }: ResponsiveTableProps<T>) => {
  if (!data.length && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ocean/10 bg-white/90 shadow-card">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-ocean/10">
          <thead className="bg-sky/80">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-ocean/70">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean/10">
            {data.map((item) => (
              <tr key={getRowKey(item)} className="transition hover:bg-sky/55">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-ink">
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid divide-y divide-ocean/10 md:hidden">
        {data.map((item) => (
          <article key={getRowKey(item)} className="grid gap-3 p-4">
            {columns.map((column) => (
              <div key={column.key} className="flex items-start justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-ocean/60">{column.header}</span>
                <span className="text-right text-sm text-ink">{column.render(item)}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
};
