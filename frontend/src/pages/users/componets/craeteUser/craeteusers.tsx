import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createusers.css';
import FilterSelect from '../../../../components/common/FilterSelect';

function CraeteUsersPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('Sam');
  const [branch, setBranch] = useState('1');
  const [email, setEmail] = useState('Sam@gmail');
  const [password, setPassword] = useState('************');

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
    !emailError &&
    password.trim().length >= 8;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    navigate('/dashboard');
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
              />
              <span className="createusers-field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7l-8.5 8.5L8 12" />
                </svg>
              </span>
            </div>
          </label>

          <label className="createusers-field">
            <span className="createusers-label">Branch</span>
            <FilterSelect
              value={branch}
              onChange={setBranch}
              ariaLabel="Branch selector"
              options={[
                { label: 'Branch 1', value: '1' },
                { label: 'Branch 2', value: '2' },
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
              />
              <span className="createusers-field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 7v5" />
                  <circle cx="12" cy="16.5" r="0.9" />
                  <path d="M10.3 4.5h3.4l5.8 5.8v3.4l-5.8 5.8h-3.4l-5.8-5.8v-3.4z" />
                </svg>
              </span>
            </div>
            {emailError ? (
              <p className="createusers-field-hint error">{emailError}</p>
            ) : (
              <p className="createusers-field-hint">Use your admin-issued company email.</p>
            )}
          </label>

          <label className="createusers-field">
            <span className="createusers-label">Password</span>
            <div className="createusers-input-shell">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                className="createusers-input"
              />
              <span className="createusers-field-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                  <rect x="5.2" y="11" width="13.6" height="9" rx="2.2" />
                </svg>
              </span>
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

          <button type="submit" className="createusers-submit" disabled={!isFormValid}>
            Create User
          </button>
        </form>
      </div>
    </section>
  );
}

export default CraeteUsersPage;
