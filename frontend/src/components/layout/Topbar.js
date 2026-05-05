import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function Topbar() {
  const { pathname } = useLocation();
  const [isSynthwave, setIsSynthwave] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseSynthwave = savedTheme === 'synthwave';
    setIsSynthwave(shouldUseSynthwave);

    if (shouldUseSynthwave) {
      document.documentElement.setAttribute('data-theme', 'synthwave');
      return;
    }

    document.documentElement.removeAttribute('data-theme');
  }, []);

  const handleThemeToggle = (event) => {
    const checked = event.target.checked;
    setIsSynthwave(checked);

    if (checked) {
      document.documentElement.setAttribute('data-theme', 'synthwave');
      localStorage.setItem('theme', 'synthwave');
      return;
    }

    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-app/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-sm text-muted">
          Current route: <span className="font-medium text-text">{pathname}</span>
        </p>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-surface text-muted transition hover:border-primary hover:text-text">
            <input
              type="checkbox"
              className="theme-controller absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              value="synthwave"
              checked={isSynthwave}
              onChange={handleThemeToggle}
            />

            <span className="pointer-events-none relative flex h-4 w-4 items-center justify-center">
              <svg
                className={`absolute inset-0 h-4 w-4 transition-all duration-300 ease-out ${isSynthwave ? 'scale-75 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 1.5V3.5M12 20.5V22.5M1.5 12H3.5M20.5 12H22.5M4.3 4.3L5.7 5.7M18.3 18.3L19.7 19.7M19.7 4.3L18.3 5.7M5.7 18.3L4.3 19.7" />
              </svg>

              <svg
                className={`absolute inset-0 h-4 w-4 transition-all duration-300 ease-out ${isSynthwave ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-90 opacity-0'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.5 14.2A8 8 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7Z" />
              </svg>
            </span>
          </label>
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
