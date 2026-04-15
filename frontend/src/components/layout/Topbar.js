import { useLocation } from 'react-router-dom';

function Topbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-app/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-sm text-muted">
          Current route: <span className="font-medium text-text">{pathname}</span>
        </p>

        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary hover:text-text">
            Warehouse A
          </button>
          <button className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary hover:text-text">
            Alerts
          </button>
          <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text">
            D. Dastardly
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
