interface LoadingRowsProps {
  rows?: number;
}

export const LoadingRows = ({ rows = 4 }: LoadingRowsProps) => {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-md bg-sky" />
      ))}
    </div>
  );
};
