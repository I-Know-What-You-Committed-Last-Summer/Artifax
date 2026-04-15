import { NavLink } from 'react-router-dom';
import { adminMenu, mainMenu, userMenu } from '../../config/navigation';

function NavSection({ title, items, mobile = false }) {
  if (mobile) {
    return (
      <div className="flex gap-2">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-muted hover:border-primary hover:text-text'
              }`
            }
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-app text-[10px] font-bold">
              {item.short}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-muted hover:bg-app hover:text-text'
                }`
              }
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-[11px] font-semibold tracking-wide group-hover:border-primary/30">
                {item.short}
              </span>
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full border border-border bg-app px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sidebar() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            AF
          </span>
          <div>
            <p className="text-xl font-semibold tracking-tight text-text">Artifax</p>
            <p className="text-xs text-muted">Production Workspace</p>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2">
          <NavSection title="Main Menu" items={mainMenu} />
          <NavSection title="Associate" items={userMenu} />
          <NavSection title="Admin" items={adminMenu} />
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-app px-3 py-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-text">
              JM
            </span>
            <div>
              <p className="text-sm font-medium text-text">J. Martinez</p>
              <p className="text-xs text-muted">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="mb-3 overflow-x-auto pb-1 lg:hidden">
        <div className="min-w-max rounded-xl border border-border bg-surface p-2 shadow-card">
          <NavSection title="Main Menu" items={mainMenu} mobile />
        </div>
      </div>
    </>
  );
}

export default Sidebar;
