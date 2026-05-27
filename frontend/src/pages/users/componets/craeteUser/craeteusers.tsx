import { useEffect, useMemo, useState } from 'react';
import './createusers.css';
import FilterSelect from '../../../../components/common/FilterSelect';

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
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('Warehouse A');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [isEditing, setIsEditing] = useState(true);

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
      setBranch('Warehouse A');
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
            <FilterSelect
              value={branch}
              onChange={setBranch}
              ariaLabel="Branch selector"
              className="createusers-select-shell"
              disabled={!isEditing}
              options={[
                { label: 'Warehouse A', value: 'Warehouse A' },
                { label: 'Warehouse B', value: 'Warehouse B' },
                { label: 'Warehouse C', value: 'Warehouse C' },
              ]}
            />
          </label>

          <label className="createusers-field">
            <span className="createusers-label">Role</span>
            <FilterSelect
              value={role}
              onChange={setRole}
              ariaLabel="Role selector"
              className="createusers-select-shell"
              disabled={!isEditing}
              options={[
                { label: 'Admin', value: 'Admin' },
                { label: 'Staff', value: 'Staff' },
              ]}
            />
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
                    className="createusers-secondary"
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
