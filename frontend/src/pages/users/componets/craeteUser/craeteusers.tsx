import { useEffect, useMemo, useState } from 'react';
import './createusers.css';
import FilterSelect from '../../../../components/common/FilterSelect';
import { useApi } from '../../../../hooks/useApi';

type User = {
  id: number;
  name: string;
  email: string;
  branch: string;
  role: string;
  status: string;
};

interface CreateUsersPageProps {
  user?: User;
  onSave: (user: Omit<User, 'id'> & { id: number | null }) => void;
  onDelete: (id: number) => void;
}

function CraeteUsersPage({ user, onSave, onDelete }: CreateUsersPageProps) {
  const api = useApi();
  // `api` is the shared axios instance from `src/hooks/useApi.ts`.
  // This file does not call backend endpoints directly for create/update; it passes data
  // up to the parent (`users.tsx`) via `onSave`/`onDelete`. Parent handles POST/PATCH/DELETE.
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [isEditing, setIsEditing] = useState(true);

  const [branchOptions, setBranchOptions] = useState<Array<{ label: string; value: string }>>([]);

  const roleOptions = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Employee', value: 'Employee' },
  ];

  // Fetch branches once on mount
  useEffect(() => {
    // Load branch list from backend once on mount.
    // Endpoint: GET /api/Branch (implemented in Backend/Controllers/BranchController.cs)
    // Response: array of BranchDto objects. We map them to `{ label, value }` for `FilterSelect`.
    let mounted = true;
    (async () => {
      try {
        const resp = await api.get('/Branch');
        if (!mounted) return;
        const opts = (resp.data ?? []).map((b: any) => ({ label: b.name ?? b.branchName ?? b.label, value: b.name ?? b.branchName ?? b.label }));
        setBranchOptions(opts);
        // If the form is for a new user and branch is empty, pick the first branch as default.
        setBranch((current) => (current ? current : (opts.length > 0 ? opts[0].value : '')));
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    })();

    return () => { mounted = false; };
  }, [api]);

  // Sync incoming `user` prop to local form state when it changes
  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setBranch(user.branch);
      setEmail(user.email);
      setPassword('************');
      setRole(user.role);
      setIsEditing(false);
    } else {
      setFullName('');
      // keep current branch (from fetched defaults) when creating new user
      setEmail('');
      setPassword('');
      setRole('Admin');
      setIsEditing(true);
    }
  }, [user]);

  const emailError = useMemo(() => {
    if (!email.trim()) {
      return 'Email is required';
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return 'Email error: end with @gmail.com';
    }

    return '';
  }, [email]);

  const isFormValid =
    fullName.trim().length > 0 &&
    branch.trim().length > 0 &&
    role.trim().length > 0 &&
    !emailError &&
    password.trim().length >= 8;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    // Pass form data up to the parent `Users` component via `onSave`.
    // The parent is responsible for calling the backend API (POST/PATCH) with the proper DTO.
    onSave({
      id: user?.id ?? null,
      name: fullName,
      email,
      branch,
      role,
      status: user?.status ?? 'Active',
    });
    setIsEditing(false);
  };

  return (
    <section className="createusers-card">
      <header className="createusers-card-header">
        <div className="createusers-title-row">
          <div className="createusers-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 20c1.8-3.3 4.5-5 7.5-5s5.7 1.7 7.5 5" />
            </svg>
          </div>
          <h1>Create User</h1>
        </div>
      </header>

      <div className="createusers-card-body">
        <div className="createusers-section-heading">Required User Information</div>

        <form className="createusers-form" onSubmit={handleSubmit} noValidate>
          <label className="createusers-field">
            <span className="createusers-label">Full Name</span>
            <div className="createusers-input-shell">
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                type="text"
                autoComplete="name"
                className="createusers-input"
                disabled={!isEditing}
              />
            </div>
          </label>

          <label className="createusers-field">
            <span className="createusers-label">Branch</span>
            <div className="createusers-input-shell createusers-select-shell">
              <FilterSelect
                value={branch}
                onChange={setBranch}
                options={branchOptions}
                className="createusers-select"
                ariaLabel="Select branch"
              />
            </div>
          </label>

          <label className="createusers-field">
            <span className="createusers-label">Role</span>
            <div className="createusers-input-shell createusers-select-shell">
              <FilterSelect
                value={role}
                onChange={setRole}
                options={roleOptions}
                className="createusers-select"
                ariaLabel="Select role"
              />
            </div>
          </label>

          <label className="createusers-field">
            <span className="createusers-label">Email</span>
            <div className={`createusers-input-shell ${emailError ? 'error' : ''}`}>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                className="createusers-input"
                disabled={!isEditing}
              />
            </div>
          </label>

          <label className="createusers-field createusers-password-field">
            <span className="createusers-label">Password</span>
            <div className="createusers-input-shell">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                className="createusers-input"
                disabled={!isEditing}
                placeholder={user ? '••••••••••••' : 'Enter password'}
              />
            </div>
          </label>

          <div className="createusers-alert" role="alert" aria-live="polite">
            <div className="createusers-alert-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8.3v4.2" />
                <path d="M12 15.8h.01" />
              </svg>
            </div>
            <div>
              <strong>Wrong input</strong>
              <p>{emailError || 'Email error: end with @gmail.com'}</p>
            </div>
          </div>

          <div className="createusers-action-row">
            {user ? (
              isEditing ? (
                <>
                  <button type="submit" className="createusers-submit" disabled={!isFormValid}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="createusers-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      if (user) {
                        setFullName(user.name);
                        setBranch(user.branch);
                        setEmail(user.email);
                        setPassword('************');
                        setRole(user.role);
                      }
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="createusers-submit"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="createusers-secondary createusers-delete"
                    onClick={() => user && onDelete(user.id)}
                  >
                    Delete User
                  </button>
                </>
              )
            ) : (
              <button type="submit" className="createusers-submit" disabled={!isFormValid}>
                Create User
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default CraeteUsersPage;
