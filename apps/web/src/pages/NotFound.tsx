import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { routes } from '../utils/routes';

export const NotFound = () => {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-center text-ink">
      <div className="max-w-lg">
        <p className="font-display text-8xl font-bold text-canopy">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Page Not Found</h1>
        <p className="mt-4 text-ink/65">The page you are looking for is not available in this school workspace.</p>
        <Link to={routes.dashboard} className="mt-8 inline-flex">
          <Button>Return to dashboard</Button>
        </Link>
      </div>
    </main>
  );
};
