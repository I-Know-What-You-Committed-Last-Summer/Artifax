// Hooks and navigation used by the login page
import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { setCurrentUser } from '../../utils/currentUser';
import { clearAuthToken, setAuthToken } from '../../utils/authToken';
import { getCurrentUserFromSession, loginEmployee } from '../../services/authApi';

function LoginPage() {
  // Router helper to navigate on successful login
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic email validation only
  const emailError = useMemo(() => {
    if (!email.trim()) {
      return 'Email is required';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Enter a valid email address';
    }

    return '';
  }, [email]);

  const isFormValid = !emailError && password.trim().length >= 8;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const loginResponse = await loginEmployee({
        email: email.trim(),
        password,
      });

      const serverToken = loginResponse.accessToken || loginResponse.token || '';

      if (serverToken) {
        setAuthToken(serverToken);
      } else {
        // Current backend authenticates with secure session cookies.
        clearAuthToken();
      }

      const sessionUser = await getCurrentUserFromSession();

      const fallbackName = [name.trim(), surname.trim()].filter(Boolean).join(' ').trim();

      setCurrentUser({
        name: sessionUser.Username || loginResponse.employeeName || fallbackName || email.trim(),
        role: sessionUser.UserLevel || 'Employee',
        email: sessionUser.UserEmail || loginResponse.employeeEmail || email.trim(),
      });

      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page-shell">
      <section className="login-card">
        <header className="login-card-header">
          <div className="login-title-row">
            <div className="login-avatar" aria-hidden="true">
              {/* decorative avatar icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M4.5 20c1.8-3.3 4.5-5 7.5-5s5.7 1.7 7.5 5" />
              </svg>
            </div>
            <h1>Login</h1>
          </div>
        </header>

        <div className="login-card-body">
          <div className="login-section-heading">Required User Information</div>

          {/* Controlled form with labels, inputs and inline validation hints */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span className="login-label">Name</span>
              <div className="login-input-shell">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  autoComplete="given-name"
                  className="login-input"
                />
                <span className="login-field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7l-8.5 8.5L8 12" />
                  </svg>
                </span>
              </div>
            </label>

            <label className="login-field">
              <span className="login-label">Surname</span>
              <div className="login-input-shell">
                <input
                  value={surname}
                  onChange={(event) => setSurname(event.target.value)}
                  type="text"
                  autoComplete="family-name"
                  className="login-input"
                />
                <span className="login-field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7l-8.5 8.5L8 12" />
                  </svg>
                </span>
              </div>
            </label>

            <label className="login-field">
              <span className="login-label">Email</span>
              <div className={`login-input-shell ${emailError ? 'error' : ''}`}>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  className="login-input"
                />
                <span className="login-field-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 7v5" />
                    <circle cx="12" cy="16.5" r="0.9" />
                    <path d="M10.3 4.5h3.4l5.8 5.8v3.4l-5.8 5.8h-3.4l-5.8-5.8v-3.4z" />
                  </svg>
                </span>
              </div>
              {/* Inline validation hint for email */}
              {emailError ? <p className="login-field-hint error">{emailError}</p> : <p className="login-field-hint">Use your company email address.</p>}
            </label>

            <label className="login-field">
              <span className="login-label">Password</span>
              <div className="login-input-shell">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="login-input"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
                      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.8 0 9.7 4.9 10.8 6.5a1.4 1.4 0 0 1 0 1.5c-.6.9-1.6 2.3-3.1 3.7" />
                      <path d="M6.6 6.6C4.3 8.2 2.8 10.1 2 11.5a1.4 1.4 0 0 0 0 1.5C3.1 14.7 7 19.6 12.8 19.6c1.2 0 2.4-.2 3.5-.6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.8 12C4 10.1 7.6 5.4 12 5.4S20 10.1 21.2 12c-1.2 1.9-4.8 6.6-9.2 6.6S4 13.9 2.8 12Z" />
                      <circle cx="12" cy="12" r="2.8" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {/* Accessible alert region showing validation messages */}
            <div className="login-alert" role="alert" aria-live="polite">
              <div className="login-alert-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8.3v4.2" />
                  <path d="M12 15.8h.01" />
                </svg>
              </div>
              <div>
                <strong>{submitError ? 'Login error' : 'Input required'}</strong>
                <p>{submitError || emailError || 'Enter email and password to continue.'}</p>
              </div>
            </div>

            {/* Submit button disabled until form is valid */}
            <button type="submit" className="login-submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
